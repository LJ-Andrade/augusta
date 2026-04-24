import { vadminFetch } from "./index";
import { DeliveryMethod, PaymentMethod } from "./types";

export async function getDeliveryMethods(): Promise<DeliveryMethod[]> {
  try {
    const res = await vadminFetch<{ data: DeliveryMethod[] }>({
      path: "catalog/delivery-methods",
      cache: "no-store",
    });
    return res.body.data;
  } catch (e) {
    return [];
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const res = await vadminFetch<{ data: PaymentMethod[] }>({
      path: "catalog/payment-methods",
      cache: "no-store",
    });
    return res.body.data;
  } catch (e) {
    return [];
  }
}
