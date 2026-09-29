"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/contexts/CatalogContext";
import { ProductForm } from "@/components/admin/ProductForm";
import { NovaLoader } from "@/components/NovaLoader";
import { ProductService } from "@/services/ProductService";

function EditarProductoContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { findById, hydrated, pushToast } = useCatalog();
  const [checked, setChecked] = useState(false);

  const id = Number(params?.id);
  const product = Number.isFinite(id) ? (findById(id) || ProductService.findById(id)) : undefined;

  useEffect(() => {
    if (!hydrated) return;
    const created = searchParams.get("created");
    if (created === "1") {
      pushToast({
        title: "¡Producto creado!",
        description: "Se agregó correctamente al catálogo.",
        variant: "success",
      });
      const next = new URL(window.location.href);
      next.searchParams.delete("created");
      window.history.replaceState(null, "", next.toString());
    }
    setChecked(true);
  }, [hydrated, pushToast, searchParams]);

  if (!product && (!checked || !hydrated)) {
    return (
      <div className="relative min-h-[360px]">
        <NovaLoader visible={true} fadingOut={false} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-rose-200 bg-rose-50 p-6 lg:p-10 space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="font-bodoni text-3xl md:text-4xl text-rose-900 tracking-tight leading-tight">
            Producto no encontrado
          </h1>
          <p className="text-sm md:text-base text-rose-800/80 leading-relaxed">
            El producto que intentas editar no existe, fue eliminado o
            actualmente no está disponible.
          </p>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/productos")}
            className="h-11 px-5 rounded-xl border-rose-200 bg-white text-rose-800 hover:bg-rose-100 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al listado
          </Button>
          <Button
            asChild
            className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white text-sm font-semibold"
          >
            <Link href="/admin/productos/nuevo">Crear producto nuevo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ProductForm mode="edit" initial={product} />;
}

export default function AdminEditarProductoPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-[360px]">
          <NovaLoader visible={true} fadingOut={false} />
        </div>
      }
    >
      <EditarProductoContent />
    </Suspense>
  );
}
