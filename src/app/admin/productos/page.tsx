"use client";

import dynamic from "next/dynamic";

const ProductList = dynamic(
  () =>
    import("@/components/admin/ProductList").then((mod) => mod.ProductList),
  { ssr: false }
);

export default function AdminProductosPage() {
  return <ProductList />;
}
