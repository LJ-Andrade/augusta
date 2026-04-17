import { cookies } from "next/headers";
import { vadminFetch } from "./index";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const res = await vadminFetch<{token: string, customer: any}>({
      path: "customer/login",
      method: "POST",
      body: { email, password },
    });

    if (res.body.token) {
      (await cookies()).set("auth_token", res.body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return { success: true };
    }
  } catch (e: any) {
    return { error: e.message || "Credenciales inválidas" };
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const res = await vadminFetch<{token: string, customer: any}>({
      path: "customer/register",
      method: "POST",
      body: { name, email, password, password_confirmation: password },
    });

    if (res.body.token) {
      (await cookies()).set("auth_token", res.body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      return { success: true };
    }
  } catch (e: any) {
    return { error: e.message || "Error al registrarse" };
  }
}

export async function logout() {
  const token = (await cookies()).get("auth_token")?.value;
  if (token) {
    await vadminFetch({
      path: "customer/logout",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  (await cookies()).delete("auth_token");
}

export async function getMe() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const res = await vadminFetch<any>({
      path: "customer/me",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.body;
  } catch (e) {
    return null;
  }
}
