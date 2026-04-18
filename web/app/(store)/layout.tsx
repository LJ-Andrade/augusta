import { CartProvider } from "components/cart/cart-context";
import { AnnouncementBar } from "components/layout/announcement-bar";
import { Navbar } from "components/layout/navbar";
import Footer from "components/layout/footer";
import { WelcomeToast } from "components/welcome-toast";
import { getCart } from "lib/vadmin/cart";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cart = getCart();

  return (
    <CartProvider cartPromise={cart}>
      <AnnouncementBar />
      <Navbar />
      <main>
        {children}
        <Footer />
        <Toaster closeButton />
        <WelcomeToast />
      </main>
    </CartProvider>
  );
}
