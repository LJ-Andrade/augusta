"use client";

import Price from "components/price";
import { Cart } from "lib/vadmin/types";
import Image from "next/image";

export default function OrderSummary({ cart, shippingFee = 0 }: { cart: Cart; shippingFee?: number }) {
  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  const total = subtotal + shippingFee;

  return (
    <div className="rounded-[12px] border border-bone bg-parchment p-6">
      <h2 className="mb-6 text-xl font-medium font-serif">Resumen de Compra</h2>
      
      <ul className="mb-6 space-y-4">
        {cart.lines.map((item, i) => (
          <li key={i} className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-[8px] bg-bone flex-none">
              <Image
                src={item.merchandise.product.featuredImage.url}
                alt={item.merchandise.product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.merchandise.product.title}</p>
              <p className="text-xs text-stone-brown">Cant: {item.quantity}</p>
            </div>
            <Price
              className="text-sm font-semibold"
              amount={item.cost.totalAmount.amount}
              currencyCode={item.cost.totalAmount.currencyCode}
            />
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t border-bone pt-6 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-brown">Subtotal</span>
          <Price amount={subtotal.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
        </div>
        <div className="flex justify-between">
          <span className="text-stone-brown">Envío</span>
          {shippingFee > 0 ? (
            <Price amount={shippingFee.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
          ) : (
            <span className="text-green-600 font-medium">Gratis</span>
          )}
        </div>
        <div className="flex justify-between border-t border-bone pt-4 text-lg font-bold">
          <span>Total</span>
          <Price amount={total.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
        </div>
      </div>
    </div>
  );
}
