"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ProductService,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/services/ProductService";
import type { CatalogType, Product } from "@/lib/products";

type ToastVariant = "success" | "error" | "info";
interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface CatalogContextValue {
  products: Product[];
  loading: boolean;
  hydrated: boolean;
  findById: (id: number) => Product | undefined;
  findByType: (type: CatalogType | "all") => Product[];
  createProduct: (input: CreateProductInput) => Product | null;
  bulkCreate: (inputs: CreateProductInput[]) => Product[];
  updateProduct: (input: UpdateProductInput) => Product | null;
  toggleAvailable: (id: number) => Product | null;
  deleteProduct: (id: number) => boolean;
  refresh: () => void;
  reset: () => void;
  stats: ReturnType<typeof ProductService.stats>;
  pushToast: (t: Omit<Toast, "id">) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const list = ProductService.list();
      setProducts(list);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const toast: Toast = { ...t, id };
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast]
  );

  const findById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  const findByType = useCallback(
    (type: CatalogType | "all") =>
      type === "all" ? products : products.filter((p) => p.type === type),
    [products]
  );

  const createProduct = useCallback(
    (input: CreateProductInput): Product | null => {
      try {
        const created = ProductService.create(input);
        refresh();
        pushToast({
          title: "Producto creado",
          description: `Se agregó «${created.name}» al catálogo.`,
          variant: "success",
        });
        return created;
      } catch (err) {
        pushToast({
          title: "Error al crear producto",
          description: err instanceof Error ? err.message : "Inténtalo nuevamente.",
          variant: "error",
        });
        return null;
      }
    },
    [pushToast, refresh]
  );

  const bulkCreate = useCallback(
    (inputs: CreateProductInput[]): Product[] => {
      try {
        const created = ProductService.bulkCreate(inputs);
        refresh();
        pushToast({
          title: "Importación exitosa",
          description: `Se importaron ${created.length} productos correctamente.`,
          variant: "success",
        });
        return created;
      } catch (err) {
        pushToast({
          title: "Error en importación",
          description: err instanceof Error ? err.message : "Error al procesar productos.",
          variant: "error",
        });
        return [];
      }
    },
    [pushToast, refresh]
  );

  const updateProduct = useCallback(
    (input: UpdateProductInput): Product | null => {
      try {
        const updated = ProductService.update(input);
        if (!updated) {
          pushToast({
            title: "Producto no encontrado",
            variant: "error",
          });
          return null;
        }
        refresh();
        pushToast({
          title: "Producto actualizado",
          description: `«${updated.name}» fue actualizado correctamente.`,
          variant: "success",
        });
        return updated;
      } catch (err) {
        pushToast({
          title: "Error al actualizar",
          description: err instanceof Error ? err.message : "Inténtalo nuevamente.",
          variant: "error",
        });
        return null;
      }
    },
    [pushToast, refresh]
  );

  const toggleAvailable = useCallback(
    (id: number): Product | null => {
      try {
        const updated = ProductService.toggleAvailable(id);
        if (!updated) return null;
        refresh();
        pushToast({
          title: updated.available ? "Producto activado" : "Producto desactivado",
          description: `«${updated.name}» ${
            updated.available ? "ahora está visible en tienda." : "se ocultó de la tienda."
          }`,
          variant: "info",
        });
        return updated;
      } catch {
        return null;
      }
    },
    [pushToast, refresh]
  );

  const deleteProduct = useCallback(
    (id: number): boolean => {
      const product = ProductService.findById(id);
      const ok = ProductService.remove(id);
      if (ok) {
        refresh();
        pushToast({
          title: "Producto eliminado",
          description: product
            ? `«${product.name}» fue eliminado del catálogo.`
            : undefined,
          variant: "success",
        });
      } else {
        pushToast({
          title: "No se pudo eliminar",
          description: "El producto no existe o ocurrió un error.",
          variant: "error",
        });
      }
      return ok;
    },
    [pushToast, refresh]
  );

  const reset = useCallback(() => {
    ProductService.resetToSeed();
    refresh();
    pushToast({
      title: "Catálogo restaurado",
      description: "Se regresó al conjunto inicial de productos.",
      variant: "info",
    });
  }, [pushToast, refresh]);

  const stats = useMemo(() => ProductService.stats(), [products]);

  const value: CatalogContextValue = {
    products,
    loading,
    hydrated,
    findById,
    findByType,
    createProduct,
    bulkCreate,
    updateProduct,
    toggleAvailable,
    deleteProduct,
    refresh,
    reset,
    stats,
    pushToast,
    toasts,
    dismissToast,
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return ctx;
}

export default CatalogContext;
