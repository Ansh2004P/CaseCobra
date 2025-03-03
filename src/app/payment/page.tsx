/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCheckoutSession } from "./actions";
import { useSearchParams, useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Address {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export default function CheckoutPage() {
    const [shippingAddress, setShippingAddress] = useState<Address>({
        name: "safsfa",
        street: "asfasf",
        city: "asffaf",
        state: "asfsfafsf",
        postalCode: "123456",
        country: "India",
    });
    const [billingAddress, setBillingAddress] = useState<Address>({
        name: "safsfa",
        street: "asfasf",
        city: "asffaf",
        state: "asfsfafsf",
        postalCode: "123456",
        country: "India",
    });
    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");


    useEffect(() => {
        const savedShipping = localStorage.getItem("shippingAddress");
        const savedBilling = localStorage.getItem("billingAddress");
        const savedSameAsShipping = localStorage.getItem("sameAsShipping");

        if (savedShipping) {
            setShippingAddress(JSON.parse(savedShipping));
        }
        if (savedBilling) {
            setBillingAddress(JSON.parse(savedBilling));
        }
        if (savedSameAsShipping) {
            setSameAsShipping(JSON.parse(savedSameAsShipping));
        }
    }, [id]);

    useEffect(() => {
        localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
        if (sameAsShipping) {
            setBillingAddress({ ...shippingAddress });
        }
    }, [shippingAddress, sameAsShipping]);

    useEffect(() => {
        localStorage.setItem("billingAddress", JSON.stringify(billingAddress));
    }, [billingAddress]);

    useEffect(() => {
        localStorage.setItem("sameAsShipping", JSON.stringify(sameAsShipping));
    }, [sameAsShipping]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        setter: Dispatch<SetStateAction<Address>>
    ) => {
        const { name, value } = e.target;
        setter((prev) => ({ ...prev, [name]: value }));
    };

    const validateAddress = (address: Address) =>
        Object.values(address).every((field) => field.trim() !== "");

    const { mutate: createPaymentSession } = useMutation({
        mutationKey: ["get-checkout-session"],
        mutationFn: createCheckoutSession,
        onSuccess: async ({ orderDetails }) => {
            if (!orderDetails) {
                toast.error("Unable to retrieve payment details.");
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => {
                const options = {
                    key: orderDetails.key,
                    amount: orderDetails.amount,
                    currency: orderDetails.currency,
                    name: orderDetails.name,
                    description: orderDetails.description,
                    order_id: orderDetails.id,
                    handler: async function (response: any) {
                        // verify Payment

                        const res = await fetch("/api/verifyOrder", {
                            method: "POST",
                            body: JSON.stringify({
                                fieldId: orderDetails.orderId,
                                orderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            }),
                        });

                        const data = await res.json();
                        // console.log(data);

                        if (data.isOk) {
                            toast.success("Payment Successful!");
                            router.push(orderDetails.success_url);
                        } else {
                            toast.error("Payment failed. Please try again.");
                            router.push(orderDetails.cancel_url);
                        }

                    },
                    prefill: orderDetails.prefill,
                    theme: { color: "#328a22" },
                    modal: {
                        ondismiss: function () {
                            router.push(orderDetails.cancel_url);
                        },
                    },
                };
                const razor = new (window as any).Razorpay(options);
                razor.open();
            };
            script.onerror = () => {
                toast.error("Failed to load Razorpay checkout.");
            };

            document.body.appendChild(script);
        },
        onError: () => {
            toast.error(
                <div>
                    <h1>Something went wrong</h1>
                    <p>There was an error on our end. Please try again.</p>
                </div>
            );
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAddress(shippingAddress) || !validateAddress(billingAddress)) {
            setError("All fields are required for both shipping and billing addresses.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await createPaymentSession({
                shippingAddress,
                billingAddress,
                configId: id!,
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100">
                            <h2 aria-label="Shipping Address Title" className="text-lg md:text-xl font-semibold text-gray-700 mb-4">Shipping Address</h2>
                            <div aria-label="Shipping Address Section" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div aria-label="Shipping Name" className="space-y-2">
                                    <Label htmlFor="shipping-name" className="text-gray-600">Name</Label>
                                    <Input
                                        id="shipping-name"
                                        placeholder="User Name"
                                        type="text"
                                        className="focus:ring-2 focus:ring-green-500"
                                        name="name"
                                        value={shippingAddress.name}
                                        onChange={(e) => handleChange(e, setShippingAddress)}
                                        required
                                    />
                                </div>
                                <div aria-label="Shipping Address" className="space-y-2">
                                    <Label htmlFor="shipping-street" className="text-gray-600">Street</Label>
                                    <Input
                                        id="shipping-street"
                                        type="text"
                                        name="street"
                                        placeholder="Address Line"
                                        className="focus:ring-2 focus:ring-green-500"
                                        value={shippingAddress.street}
                                        onChange={(e) => handleChange(e, setShippingAddress)}
                                        required
                                    />
                                </div>
                                <div aria-label="Shipping City" className="space-y-2">
                                    <Label htmlFor="shipping-city" className="text-gray-600">City</Label>
                                    <Input
                                        id="shipping-city"
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="focus:ring-2 focus:ring-green-500"
                                        value={shippingAddress.city}
                                        onChange={(e) => handleChange(e, setShippingAddress)}
                                        required
                                    />
                                </div>
                                <div aria-label="Shipping State" className="space-y-2">
                                    <Label htmlFor="shipping-state" className="text-gray-600">State</Label>
                                    <Input
                                        id="shipping-state"
                                        type="text"
                                        name="state"
                                        className="focus:ring-2 focus:ring-green-500"
                                        value={shippingAddress.state}
                                        onChange={(e) => handleChange(e, setShippingAddress)}
                                        required
                                    />
                                </div>
                                <div aria-label="Shipping PostalCode" className="space-y-2">
                                    <Label htmlFor="shipping-postalCode"
                                        className="text-gray-600"
                                    >Postal Code</Label>
                                    <Input
                                        id="shipping-postalCode"
                                        type="text"
                                        name="postalCode"
                                        value={shippingAddress.postalCode}
                                        maxLength={6}
                                        className="focus:ring-2 focus:ring-green-500"
                                        pattern="\d{6}"
                                        placeholder="123456"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d{0,6}$/.test(value)) {
                                                handleChange(e, setShippingAddress);
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div aria-label="Shipping Country" className="space-y-2">
                                    <Label htmlFor="shipping-country" className="text-gray-600">Country</Label>
                                    <select
                                        id="shipping-country"
                                        name="country"
                                        value={shippingAddress.country}
                                        onChange={(e) => handleChange(e, setShippingAddress)}
                                        className="border rounded-md p-[6px] focus:ring-1 focus:ring-green-500 w-full"
                                        required
                                    >
                                        <option value="">Select a country</option>
                                        {COUNTRIES.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div aria-label="Billing-same-as-shipping-checkbox" className="flex items-center space-x-2 py-4">
                            <Checkbox
                                id="same-address"
                                checked={sameAsShipping}
                                className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
                                onCheckedChange={(checked) => setSameAsShipping(Boolean(checked))}
                            />
                            <Label htmlFor="same-address" className="text-gray-600">
                                Billing Address same as Shipping Address
                            </Label>
                        </div>

                        {/* Billing Address */}
                        <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">Billing Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-name" className="text-gray-600">Name</Label>
                                    <Input
                                        id="shipping-name"
                                        type="text"
                                        className="focus:ring-2 focus:ring-green-500"
                                        name="name"
                                        value={billingAddress.name}
                                        onChange={(e) => handleChange(e, setBillingAddress)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-street" className="text-gray-600">Street</Label>
                                    <Input
                                        id="shipping-street"
                                        type="text"
                                        name="street"
                                        className="focus:ring-2 focus:ring-green-500"
                                        value={billingAddress.street}
                                        onChange={(e) => handleChange(e, setBillingAddress)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-city" className="text-gray-600">City</Label>
                                    <Input
                                        id="shipping-city"
                                        type="text"
                                        name="city"
                                        className="focus:ring-2 focus:ring-green-500"
                                        value={billingAddress.city}
                                        onChange={(e) => handleChange(e, setBillingAddress)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-state" className="text-gray-600">State</Label>
                                    <Input
                                        id="shipping-state"
                                        type="text"
                                        name="state"
                                        className="focus:ring-2 focus:ring-green-500"
                                        value={billingAddress.state}
                                        onChange={(e) => handleChange(e, setBillingAddress)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-postalCode"
                                        className="text-gray-600"
                                    >Postal Code</Label>
                                    <Input
                                        id="shipping-postalCode"
                                        type="text"
                                        name="postalCode"
                                        value={billingAddress.postalCode}
                                        maxLength={6}
                                        className="focus:ring-2 focus:ring-green-500"
                                        pattern="\d{6}"
                                        placeholder="123456"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d{0,6}$/.test(value)) {
                                                handleChange(e, setBillingAddress);
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-country" className="text-gray-600">Country</Label>
                                    <select
                                        id="shipping-country"
                                        name="country"
                                        value={billingAddress.country}
                                        onChange={(e) => handleChange(e, setBillingAddress)}
                                        className="border rounded-md p-[6px] focus:ring-1 focus:ring-green-500 w-full"
                                        required
                                    >
                                        <option value="">Select a country</option>
                                        {COUNTRIES.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-red-500">{error}</p>}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Processing..." : "Proceed to Payment"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
