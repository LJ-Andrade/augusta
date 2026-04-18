import { cookies } from "next/headers";
import { vadminFetch } from "./index";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  try {
    const res = await vadminFetch<{ token: string; customer: any }>({
      path: "customer/login",
      method: "POST",
      body: { email, password },
    });

    if (res.body.token) {
      const maxAge = remember ? 60 * 60 * 24 * 365 : undefined; // 1 year or session

      (await cookies()).set("auth_token", res.body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  } catch (e: any) {
    const errorMsg = e.message || e.error?.message || "Login failed";
    return { success: false, error: errorMsg };
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;

  try {
    const res = await vadminFetch<{ token: string; customer: any }>({
      path: "customer/register",
      method: "POST",
      body: { name, email, password, password_confirmation },
    });

    if (res.body.token) {
      (await cookies()).set("auth_token", res.body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      return { success: true };
    }
    return { success: false, error: "Registration failed" };
  } catch (e: any) {
    const errorMsg = e.message || e.error?.message || "Registration failed";
    return { success: false, error: errorMsg };
  }
}

export async function logout() {
  (await cookies()).delete("auth_token");
}

export async function getSession() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const res = await vadminFetch<any>({
      path: "customer/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.body;
  } catch (e) {
    return null;
  }
}
