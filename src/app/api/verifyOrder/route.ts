'use server';

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";

const generatedSignature = (

    razorpayOrderId: string,
    razorpayPaymentId: string
) => {
    const keySecret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET as string;

    const sig = crypto
        .createHmac("sha256", keySecret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");
    return sig;
};

export async function POST(request: NextRequest) {
    const { fieldId, orderId, razorpayPaymentId, razorpaySignature } =
        await request.json();

    const signature = generatedSignature(orderId, razorpayPaymentId);
    if (signature !== razorpaySignature) {
        return NextResponse.json(
            { message: "payment verification failed", isOk: false },
            { status: 400 }
        );
    }

    // console.log('razorpay', local_order_id);
    // console.log('response', orderId);
    const updatedOrder = await db.order.update({
        where: { id: fieldId },
        data: {
            isPaid: true,
        },
    })

    console.log(updatedOrder);


    return NextResponse.json(
        { message: "payment verified successfully", isOk: true },
        { status: 200 }
    );
}