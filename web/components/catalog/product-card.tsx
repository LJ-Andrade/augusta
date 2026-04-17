"use client";

import { Product } from "lib/vadmin/types";
import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const imageUrl =
    product.featuredImage?.url ?? product.images?.[0]?.url ?? "";
  const imageAlt =
    product.featuredImage?.altText ?? product.title;

  const price = product.priceRange.minVariantPrice;
  const isNew =
    new Date(product.updatedAt) >
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Extract unique color swatches from variants
  const colors = product.options
    .find((o) => o.name === "Color")
    ?.values.slice(0, 5) ?? [];

  // Color name → hex (basic palette; extend as needed)
  const colorMap: Record<string, string> = {
    beige: "#D4B896",
    negro: "#1A1A1A",
    blanco: "#F5F5F0",
    gris: "#9E9E9E",
    azul: "#4A6FA5",
    rojo: "#B94040",
    verde: "#4A7A5A",
    marron: "#8B6C5C",
    rosa: "#D4A0A0",
    crema: "#F0E8D8",
  };

  const getColorHex = (name: string): string =>
    colorMap[name.toLowerCase()] ?? "#CCCCCC";

  return (
    <article className="pb-card group relative flex flex-col">
      {/* ── Image ──────────────────────────────────────────────────── */}
      <Link
        href={`/product/${product.handle}`}
        className="relative block overflow-hidden"
        style={{ aspectRatio: "4/5", backgroundColor: "var(--pb-surface)" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="pb-card-image object-cover"
            priority={priority}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "var(--pb-text-muted)" }}
          >
            <span className="text-xs uppercase tracking-widest">Sin imagen</span>
          </div>
        )}

        {/* Badge NUEVO */}
        {isNew && (
          <span
            className="absolute left-3 top-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{
              backgroundColor: "var(--pb-badge-bg)",
              color: "var(--pb-badge-text)",
            }}
          >
            Nuevo
          </span>
        )}

        {/* Hover overlay — "Ver producto" */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }}
        >
          <span className="rounded-none border border-white px-6 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black">
            Ver producto
          </span>
        </div>
      </Link>

      {/* ── Info ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 p-3 pt-3">
        {/* Category tag */}
        {product.tags?.[0] && (
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: "var(--pb-text-muted)" }}
          >
            {product.tags[0]}
          </span>
        )}

        {/* Product name — Serif */}
        <Link
          href={`/product/${product.handle}`}
          className="line-clamp-2 text-sm font-medium leading-snug transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-serif)", color: "var(--pb-text)" }}
        >
          {product.title}
        </Link>

        {/* Price */}
        <p
          className="text-sm font-medium"
          style={{ color: "var(--pb-text)" }}
        >
          {new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: price.currencyCode,
            minimumFractionDigits: 0,
          }).format(parseFloat(price.amount))}
        </p>

        {/* Color swatches */}
        {colors.length > 0 && (
          <div className="mt-1 flex gap-1.5">
            {colors.map((color) => (
              <span
                key={color}
                title={color}
                className="h-3.5 w-3.5 rounded-full border border-white ring-1 ring-gray-300 transition-transform hover:scale-125"
                style={{ backgroundColor: getColorHex(color) }}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
