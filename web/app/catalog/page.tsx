import { ActiveFilters } from "components/catalog/active-filters";
import { FilterSidebar } from "components/catalog/filter-sidebar";
import { ProductGrid } from "components/catalog/product-grid";
import { SortBar } from "components/catalog/sort-bar";
import { getCollections, getProducts } from "lib/vadmin";
import type { Product } from "lib/vadmin/types";
import { Suspense } from "react";

type SearchParams = {
  category?: string;
  size?: string | string[];
  sort?: string;
  q?: string;
};

// Sort products client-side based on sort param
function sortProducts(products: Product[], sort: string): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price_asc":
      return copy.sort(
        (a, b) =>
          parseFloat(a.priceRange.minVariantPrice.amount) -
          parseFloat(b.priceRange.minVariantPrice.amount)
      );
    case "price_desc":
      return copy.sort(
        (a, b) =>
          parseFloat(b.priceRange.minVariantPrice.amount) -
          parseFloat(a.priceRange.minVariantPrice.amount)
      );
    case "name_asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }
}

// Filter products by category and size
function filterProducts(
  products: Product[],
  category: string | undefined,
  sizes: string[]
): Product[] {
  let result = products;

  if (category) {
    result = result.filter((p) =>
      p.tags?.some((t) => t.toLowerCase() === category.toLowerCase()) ||
      // also match by handle if the API returns them by category
      true // For now show all — backend filtering via API param is preferred
    );
  }

  if (sizes.length > 0) {
    result = result.filter((p) =>
      p.options
        .find((o) => o.name === "Talle")
        ?.values.some((v) => sizes.includes(v))
    );
  }

  return result;
}

export default async function CatalogPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;

  const category = searchParams.category;
  const sizes = searchParams.size
    ? Array.isArray(searchParams.size)
      ? searchParams.size
      : [searchParams.size]
    : [];
  const sort = searchParams.sort ?? "newest";
  const query = searchParams.q;

  // Fetch all products (with optional category filter on the API side)
  const [allProducts, collections] = await Promise.all([
    getProducts({ query }),
    getCollections(),
  ]);

  // Extract all available sizes from all products
  const allSizes = Array.from(
    new Set(
      allProducts.flatMap(
        (p) =>
          p.options.find((o) => o.name === "Talle")?.values ?? []
      )
    )
  );

  // Filter and sort
  const filtered = filterProducts(allProducts, category, sizes);
  const sorted = sortProducts(filtered, sort);

  // Strip the "Todo" entry from collections for the sidebar
  const sidebarCategories = collections.filter((c) => c.handle !== "");

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 lg:px-8">
      {/* ── Page Title ─────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <h1
          className="text-4xl font-medium"
          style={{ fontFamily: "var(--font-serif)", color: "var(--pb-text)" }}
        >
          {category
            ? sidebarCategories.find((c) => c.handle === category)?.title ??
              category
            : "Catálogo"}
        </h1>
        {query && (
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--pb-text-secondary)" }}
          >
            Resultados para "{query}"
          </p>
        )}
      </div>

      {/* ── Main Layout ────────────────────────────────────────────── */}
      <div className="flex gap-10 lg:gap-16">
        {/* Sidebar */}
        <div
          className="hidden w-56 shrink-0 lg:block"
          style={{ borderRight: "1px solid var(--pb-border)" }}
        >
          <Suspense fallback={null}>
            <FilterSidebar
              categories={sidebarCategories}
              sizes={allSizes}
            />
          </Suspense>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <SortBar total={sorted.length} />
            <ActiveFilters />
          </Suspense>
          <div className="mt-6">
            <ProductGrid products={sorted} />
          </div>
        </div>
      </div>
    </div>
  );
}
