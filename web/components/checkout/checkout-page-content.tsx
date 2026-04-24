"use client";

import { useState } from "react";
import CheckoutForm from "./checkout-form";
import MethodSelector from "./method-selector";
import OrderSummary from "./order-summary";
import { Cart, DeliveryMethod, PaymentMethod } from "lib/vadmin/types";
import { completeOrder } from "app/(store)/checkout/actions";
import { useFormStatus } from "react-dom";
import LoadingDots from "components/loading-dots";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 flex w-full items-center justify-center rounded-[12px] bg-graphite py-4 text-xs font-bold uppercase tracking-[0.2em] text-parchment transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? <LoadingDots className="bg-parchment" /> : "Confirmar Pedido"}
    </button>
  );
}

export default function CheckoutPageContent({
  cart,
  deliveryMethods,
  paymentMethods,
  session
}: {
  cart: Cart;
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
  session: any;
}) {
  const [selectedDeliveryFee, setSelectedDeliveryFee] = useState(
    parseFloat(deliveryMethods[0]?.fee || "0")
  );

  const handleDeliveryChange = (methodId: string) => {
    const method = deliveryMethods.find((m) => m.id === methodId);
    if (method) {
      setSelectedDeliveryFee(parseFloat(method.fee));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="mb-12 text-4xl font-medium font-serif">Finalizar Compra</h1>
      
      <form action={completeOrder} className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <CheckoutForm initialData={session} />
          <MethodSelector 
            deliveryMethods={deliveryMethods} 
            paymentMethods={paymentMethods} 
            onDeliveryChange={handleDeliveryChange}
          />
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <OrderSummary cart={cart} shippingFee={selectedDeliveryFee} />
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
