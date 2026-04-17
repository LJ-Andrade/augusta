import { TAGS } from "lib/constants";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { headers } from "next/headers";
import { 
  Cart, 
  Collection, 
  Menu, 
  Page, 
  Product 
} from "./types";

const endpoint = process.env.NEXT_PUBLIC_VADMIN_API_URL || "http://localhost:8000/api";

export async function vadminFetch<T>({
  cache = "force-cache",
  headers,
  method = "GET",
  params,
  body,
  path,
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  method?: string;
  params?: Record<string, string | boolean | undefined>;
  body?: any;
  path: string;
}): Promise<{ status: number; body: T } | never> {
  try {
    const url = new URL(`${endpoint}/${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }

    const result = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
    });

    const data = await result.json();

    if (!result.ok) {
      throw {
        status: result.status,
        message: data.message || "API Error",
      };
    }

    return {
      status: result.status,
      body: data,
    };
  } catch (e: any) {
    console.error(`[vadminFetch Error] path: ${path}`, e);
    throw {
      error: e,
      path,
    };
  }
}


// CATALOG
export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await vadminFetch<Product[]>({
    path: "catalog/products",
    params: { search: query, reverse, sortKey },
  });

  return res.body;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  try {
    const res = await vadminFetch<Product>({
      path: `catalog/products/${handle}`,
    });
    return res.body;
  } catch (e) {
    return undefined;
  }
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await vadminFetch<any[]>({
    path: "catalog/categories",
  });

  // Transform VADMIN categories to Storefront Collections
  const collections = res.body.map((cat) => ({
    handle: cat.slug,
    title: cat.name,
    description: cat.description || "",
    seo: {
      title: cat.name,
      description: cat.description || "",
    },
    updatedAt: cat.updated_at,
    path: `/search/${cat.slug}`,
  }));

  // Add "All" collection
  return [
    {
      handle: "",
      title: "Todo",
      description: "Todos los productos",
      seo: { title: "Todo", description: "Todos los productos" },
      path: "/search",
      updatedAt: new Date().toISOString(),
    },
    ...collections,
  ];
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const collections = await getCollections();
  return collections.find((c) => c.handle === handle);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const res = await vadminFetch<Product[]>({
    path: "catalog/products",
    params: { category: collection, reverse, sortKey },
  });

  return res.body;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  // Static menu for now or fetch from categories
  if (handle === 'next-js-commerce-footer-menu') {
    return [
      { title: 'Inicio', path: '/' },
      { title: 'Contacto', path: '/contact' },
    ];
  }
  
  const collections = await getCollections();
  return collections.slice(0, 5).map(c => ({
    title: c.title,
    path: c.path
  }));
}

export async function revalidate(req: any): Promise<any> {
    return { status: 200, message: "Revalidation not implemented yet for VADMIN" };
}

