'use server';

import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products';
import { db } from '@/db';
import { razorpay } from '@/lib/razorpay';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Order } from '@prisma/client';

interface Address {
    name: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
}

export const createCheckoutSession = async ({
    shippingAddress,
    billingAddress,
    configId
}: { shippingAddress: Address, billingAddress: Address, configId: string }) => {

    const configuration = await db.configuration.findUnique({
        where: { id: configId }
    });
    if (!configuration) {
        throw new Error('Configuration not found');
    }

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        throw new Error('You need to be logged in');
    }

    const { finish, material } = configuration;
    let price = BASE_PRICE;
    if (material === 'polycarbonate') {
        price += PRODUCT_PRICES.material.polycarbonate;
    } else if (material === 'silicone') {
        price += PRODUCT_PRICES.material.silicone;
    }
    if (finish === 'textured') {
        price += PRODUCT_PRICES.finish.textured;
    } else if (finish === 'smooth') {
        price += PRODUCT_PRICES.finish.smooth;
    }

    // Create shipping and billing address records
    const shippingAddressRecord = await db.shippingAddress.create({
        data: { ...shippingAddress }
    });

    const billingAddressRecord = await db.billingAddress.create({
        data: { ...billingAddress }
    });

    let order: Order | undefined = undefined;
    const existingOrder = await db.order.findFirst({
        where: {
            userId: user.id,
            configurationId: configuration.id,
        }
    });

    if (existingOrder) {
        order = existingOrder;
    } else {
        order = await db.order.create({
            data: {
                amount: price / 100,
                userId: user.id,
                configurationId: configuration.id,
                shippingAddressId: shippingAddressRecord.id,
                billingAddressId: billingAddressRecord.id,
            }
        });
    }

    // console.log(order.id)

    const razorpayOrder = await razorpay.orders.create({
        amount: price,
        currency: "INR",
        receipt: `order_${order.id}`,
        payment_capture: true,
        notes: {
            userId: user.id,
            orderId: order.id,
        },
    });

    // console.log(razorpayOrder.id)
    return {
        orderDetails: {
            id: razorpayOrder.id,
            orderId: order.id,
            amount: razorpayOrder.amount as number,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            name: "Custom Phone Case",
            description: "Custom Phone Case Purchase",
            prefill: {
                name: (user.given_name + " " + user.family_name) || '',
                email: user.email,
                contact: "",
            },
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
        }
    };
};
