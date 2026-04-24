"use server";

import { checkout } from "lib/vadmin/cart";
import { TAGS } from "lib/constants";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOrder(formData: FormData) {
  const data = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postal_code: formData.get("postal_code"),
    delivery_method_id: formData.get("delivery_method_id"),
    payment_method_id: formData.get("payment_method_id"),
  };

  const result = await checkout(data);

  if (result.success) {
    updateTag(TAGS.cart);
    redirect("/checkout/success");
  } else {
    // Handle error - maybe redirect back with error message?
    // For now simple redirect to error or just stay
    return result;
  }
}
