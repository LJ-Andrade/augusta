import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Catálogo | Plan B Store",
  description: "Explorá nuestra colección completa de moda mayorista.",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: "var(--pb-bg)", minHeight: "100vh" }}>
      <Suspense>{children}</Suspense>
    </div>
  );
}
