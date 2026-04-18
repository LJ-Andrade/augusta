"use client";

import { useCart } from "./cart-context";
import OpenCart from "./open-cart";

export default function CartTrigger() {
  const { cart, setIsOpen } = useCart();
  return (
    <button aria-label="Open cart" onClick={() => setIsOpen(true)}>
      <OpenCart quantity={cart?.totalQuantity} />
    </button>
  );
}
