import CartModal from "components/cart/modal";
import CartTrigger from "components/cart/trigger";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import { Menu } from "lib/vadmin/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import UserMenu from "./user-menu";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");
  const session = await getSession();

  // Split menu in half for left/right display around centered logo
  const half = Math.ceil(menu.length / 2);
  const leftMenu = menu.slice(0, half);
  const rightMenu = menu.slice(half);

  return (
    <header
      style={{ borderBottom: "1px solid var(--pb-border)", backgroundColor: "var(--pb-bg)" }}
      className="sticky top-0 z-50 w-full"
    >
      {/* ── Desktop Navbar ─────────────────────────────────────────────── */}
      <nav className="mx-auto hidden max-w-screen-2xl items-center px-6 py-3 md:grid md:grid-cols-3">

        {/* Left: empty for balance or keep Catalog if desired? User said "saquemos las categorias" */}
        <div className="flex items-center gap-8">
          <Link
            href="/catalog"
            className="text-xs font-medium uppercase tracking-widest transition-colors hover:opacity-60"
            style={{ color: "var(--pb-text)" }}
          >
            Catálogo
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" prefetch={true} className="flex items-center gap-2">
            <LogoSquare />
            <span
              className="text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)", color: "var(--pb-text)" }}
            >
              {SITE_NAME}
            </span>
          </Link>
        </div>

        {/* Right: User + Cart */}
        <div className="flex items-center justify-end gap-6">
          <UserMenu customer={session} />
          <CartTrigger />
        </div>
      </nav>

      {/* ── Mobile Navbar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} customer={session} />
        </Suspense>
        <Link href="/" prefetch={true} className="flex items-center gap-2">
          <LogoSquare />
          <span
            className="text-sm font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--pb-text)" }}
          >
            {SITE_NAME}
          </span>
        </Link>
        <CartTrigger />
      </div>
      <CartModal />
    </header>
  );
}
