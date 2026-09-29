"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogType } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { NovaLoader } from "@/components/NovaLoader";

function NuevoProductoContent() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const initialType: CatalogType | undefined =
    rawType === "technology" || rawType === "library" ? rawType : undefined;
  const initialCategory = searchParams.get("category") ?? undefined;

  return (
    <ProductForm
      mode="create"
      initialType={initialType}
      initialCategory={initialCategory}
    />
  );
}

export default function AdminNuevoProductoPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-[400px]">
          <NovaLoader visible={true} fadingOut={false} />
        </div>
      }
    >
      <NuevoProductoContent />
    </Suspense>
  );
}
