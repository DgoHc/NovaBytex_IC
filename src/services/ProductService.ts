import { PRODUCTS_DATA, type Product, type CatalogType } from "@/lib/products";
import type { ValidatedRow } from "@/lib/excelValidator";
import {
  saveProductAction,
  deleteProductAction,
  toggleProductAvailableAction,
  bulkUpsertProductsAction,
  fetchProductsAction,
} from "@/app/admin/productos/actions";

const STORAGE_KEY = "nova:products:v2";
const DELETED_KEY = "nova:deleted_product_ids:v1";
const BROADCAST_CHANNEL_NAME = "nova:catalog:sync";

export type CatalogSyncMessage =
  | { type: "PRODUCT_TOGGLED"; id: number; available: boolean; product: Product }
  | { type: "PRODUCT_UPDATED"; product: Product }
  | { type: "PRODUCT_CREATED"; product: Product }
  | { type: "PRODUCT_DELETED"; id: number }
  | { type: "BATCH_SYNC" };

let syncChannel: BroadcastChannel | null = null;

function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return syncChannel;
}

export function broadcastCatalogChange(msg: CatalogSyncMessage): void {
  if (typeof window === "undefined") return;

  // 1. Mensajería instantánea cross-tab nativa vía BroadcastChannel
  try {
    const ch = getSyncChannel();
    if (ch) ch.postMessage(msg);
  } catch {}

  // 2. Disparo de CustomEvent local en la misma ventana
  try {
    window.dispatchEvent(new CustomEvent("nova:catalog:local_event", { detail: msg }));
  } catch {}

  // 3. Notificación a través del storage event del navegador
  try {
    window.localStorage.setItem("nova:catalog:ping", Date.now().toString());
  } catch {}
}

export function normalizeProduct(p: any): Product {
  return {
    ...p,
    id: Number(p.id),
    name: p.name ?? "",
    category: p.category ?? "",
    brand: p.brand ?? "NovaBytex",
    sku: p.sku ?? "",
    warranty: p.warranty ?? "",
    description: p.description ?? "",
    fullDescription: p.fullDescription ?? p.description ?? "",
    price: Number(p.price) || 0,
    previousPrice: p.previousPrice != null ? Number(p.previousPrice) : undefined,
    image: p.image ?? "",
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    inStock: Boolean(p.inStock),
    available: p.available !== false,
    featured: Boolean(p.featured),
    rating: Number(p.rating) || 4.5,
    reviewsCount: Number(p.reviewsCount) || 0,
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    features: Array.isArray(p.features) ? p.features : [],
    imageType: p.imageType ?? "switch",
    type: p.type === "library" ? "library" : "technology",
    techSubtype: p.techSubtype ?? undefined,
    createdAt: p.createdAt ?? new Date().toISOString(),
  };
}

function readDeletedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DELETED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map((id) => Number(id)) : []);
  } catch {
    return new Set();
  }
}

function writeDeletedIds(ids: Set<number>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

function generateId(products: Product[]): number {
  const max = products.reduce((acc, p) => (Number(p.id) > acc ? Number(p.id) : acc), 0);
  return max + 1;
}

function readFromStorage(): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const seen = new Set<number>();
    const normalized: Product[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const numId = Number(item.id);
      if (!numId || seen.has(numId)) continue;
      seen.add(numId);
      normalized.push(normalizeProduct(item));
    }
    return normalized;
  } catch {
    return null;
  }
}

function writeToStorage(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

export type CreateProductInput = Omit<Product, "id" | "createdAt"> & {
  id?: number;
};
export type UpdateProductInput = Partial<CreateProductInput> & { id: number };

const DEFAULT_NEW_PRODUCT: Omit<Product, "id" | "createdAt"> = {
  name: "",
  description: "",
  fullDescription: "",
  category: "Libros",
  brand: "NovaBytex",
  sku: "NB-NEW-000",
  warranty: "6 meses",
  price: 0,
  previousPrice: undefined,
  image: "",
  gallery: [],
  inStock: true,
  available: true,
  featured: false,
  rating: 4.5,
  reviewsCount: 0,
  specifications: [],
  features: [],
  imageType: "book",
  type: "library",
};

export const ProductService = {
  STORAGE_KEY,
  DEFAULT_NEW_PRODUCT,

  /**
   * Sincronización asíncrona con Supabase en segundo plano.
   * Si Supabase responde, actualiza la caché local y retorna los productos de la BD.
   * Si falla o está offline, retorna la caché de localStorage / datos base.
   */
  async syncWithSupabase(): Promise<Product[]> {
    try {
      const res = await fetchProductsAction();
      if (res.success && res.data && res.data.length > 0) {
        const localList = ProductService.list();
        const localMap = new Map(localList.map((p) => [Number(p.id), p]));

        const merged: Product[] = res.data.map((dbProd) => {
          const localProd = localMap.get(Number(dbProd.id));
          if (!localProd) return normalizeProduct(dbProd);
          // Respetar estado de activación y stock modificado localmente
          return normalizeProduct({
            ...dbProd,
            available: localProd.available,
            inStock: localProd.inStock,
          });
        });

        // Asegurar productos locales que aún no se reflejen en la BD
        const dbIds = new Set(res.data.map((p) => Number(p.id)));
        const missingInDb = localList.filter((p) => !dbIds.has(Number(p.id)));
        const finalList = [...merged, ...missingInDb];

        writeToStorage(finalList);
        return finalList;
      }
    } catch {
      // Continuar con fallback local
    }
    return ProductService.list();
  },

  list(): Product[] {
    const deletedIds = readDeletedIds();
    const stored = readFromStorage();
    if (stored && stored.length > 0) {
      // Filtrar cualquier producto eliminado
      const activeStored = stored.filter((p) => !deletedIds.has(Number(p.id)));

      const existingIds = new Set(activeStored.map((p) => Number(p.id)));
      // Solo incorporar productos base si NO fueron eliminados explícitamente y aún no existen en el almacenamiento
      const missing = PRODUCTS_DATA
        .filter((p) => !existingIds.has(Number(p.id)) && !deletedIds.has(Number(p.id)))
        .map(normalizeProduct);

      if (missing.length > 0 || activeStored.length !== stored.length) {
        const merged = [...activeStored, ...missing];
        writeToStorage(merged);
        return merged;
      }
      return activeStored;
    }
    const seed = PRODUCTS_DATA
      .filter((p) => !deletedIds.has(Number(p.id)))
      .map(normalizeProduct);
    writeToStorage(seed);
    return seed;
  },

  findById(id: number | string): Product | undefined {
    const numId = Number(id);
    return ProductService.list().find((p) => Number(p.id) === numId);
  },

  findByType(type: CatalogType | "all"): Product[] {
    const all = ProductService.list();
    if (type === "all") return all;
    return all.filter((p) => p.type === type);
  },

  create(input: CreateProductInput): Product {
    const current = ProductService.list();
    const id = input.id ? Number(input.id) : generateId(current);
    const now = new Date().toISOString();
    const product: Product = normalizeProduct({
      ...DEFAULT_NEW_PRODUCT,
      ...input,
      id,
      createdAt: now,
    });
    const next = [...current, product];
    writeToStorage(next);

    // Sincronizar con Supabase en segundo plano
    saveProductAction(product).catch(() => {});

    // Notificar a otras pestañas en tiempo real
    broadcastCatalogChange({ type: "PRODUCT_CREATED", product });

    return product;
  },

  bulkCreate(inputs: CreateProductInput[]): Product[] {
    if (!inputs.length) return [];
    let current = ProductService.list();
    let nextId = generateId(current);
    const now = new Date().toISOString();
    const createdList: Product[] = [];

    for (const input of inputs) {
      const id = input.id ? Number(input.id) : nextId++;
      const product: Product = normalizeProduct({
        ...DEFAULT_NEW_PRODUCT,
        ...input,
        id,
        createdAt: now,
      });
      createdList.push(product);
    }

    const next = [...current, ...createdList];
    writeToStorage(next);

    // Sincronizar inserción masiva en Supabase
    bulkUpsertProductsAction(createdList).catch(() => {});

    // Notificar en tiempo real
    broadcastCatalogChange({ type: "BATCH_SYNC" });

    return createdList;
  },

  /**
   * Importación segura por lotes respetando las decisiones de duplicados (omitir, actualizar precio/stock, crear nuevo)
   */
  importValidatedBatch(rows: ValidatedRow[]): {
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
  } {
    let current = ProductService.list();
    let nextId = generateId(current);
    const now = new Date().toISOString();
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const toUpsert: Product[] = [];

    for (const row of rows) {
      if (row.status === "ERROR") {
        skippedCount++;
        continue;
      }

      const dup = row.duplicate;
      if (dup) {
        if (dup.action === "skip" || dup.action === "delete") {
          skippedCount++;
          continue;
        }

        if (dup.action === "update_all" && dup.targetProductId) {
          const idx = current.findIndex((p) => p.id === dup.targetProductId);
          if (idx >= 0) {
            const updated: Product = {
              ...current[idx],
              ...row.product,
              id: dup.targetProductId,
              createdAt: current[idx].createdAt,
            };
            current[idx] = updated;
            toUpsert.push(updated);
            updatedCount++;
            continue;
          }
        }

        if (dup.action === "update_price_stock" && dup.targetProductId) {
          const idx = current.findIndex((p) => p.id === dup.targetProductId);
          if (idx >= 0) {
            const updated: Product = {
              ...current[idx],
              price: row.product.price,
              previousPrice: row.product.previousPrice,
              inStock: row.product.inStock,
            };
            current[idx] = updated;
            toUpsert.push(updated);
            updatedCount++;
            continue;
          }
        }

        if (dup.action === "merge" && dup.targetProductId && dup.mergedFields) {
          const idx = current.findIndex((p) => p.id === dup.targetProductId);
          if (idx >= 0) {
            const updated: Product = {
              ...current[idx],
              ...dup.mergedFields,
              id: dup.targetProductId,
            };
            current[idx] = updated;
            toUpsert.push(updated);
            updatedCount++;
            continue;
          }
        }

        if (dup.action === "create_new") {
          let newSku = row.product.sku;
          if (current.some((p) => p.sku.toLowerCase() === newSku.toLowerCase())) {
            newSku = `${newSku}-DUP${Math.floor(100 + Math.random() * 900)}`;
          }
          const newProduct: Product = {
            ...DEFAULT_NEW_PRODUCT,
            ...row.product,
            sku: newSku,
            id: nextId++,
            createdAt: now,
          };
          current.push(newProduct);
          toUpsert.push(newProduct);
          createdCount++;
          continue;
        }
      }

      // Si no es duplicado o no fue omitido: crear como producto nuevo
      const newProduct: Product = {
        ...DEFAULT_NEW_PRODUCT,
        ...row.product,
        id: nextId++,
        createdAt: now,
      };
      current.push(newProduct);
      toUpsert.push(newProduct);
      createdCount++;
    }

    writeToStorage(current);

    if (toUpsert.length > 0) {
      bulkUpsertProductsAction(toUpsert).catch(() => {
        // Fallback local ya asegurado
      });
    }

    broadcastCatalogChange({ type: "BATCH_SYNC" });

    return { createdCount, updatedCount, skippedCount };
  },

  update(input: UpdateProductInput): Product | null {
    const current = ProductService.list();
    const targetId = Number(input.id);
    const idx = current.findIndex((p) => Number(p.id) === targetId);
    if (idx < 0) return null;
    const updated: Product = normalizeProduct({
      ...current[idx],
      ...input,
      id: targetId,
      createdAt: current[idx].createdAt ?? new Date().toISOString(),
    });
    const next = [...current];
    next[idx] = updated;
    writeToStorage(next);

    // Sincronizar actualización en Supabase
    saveProductAction(updated).catch(() => {
      // Fallback ya persistido en localStorage
    });

    // Notificar en tiempo real
    broadcastCatalogChange({ type: "PRODUCT_UPDATED", product: updated });

    return updated;
  },

  toggleAvailable(id: number | string): Product | null {
    const targetId = Number(id);
    const product = ProductService.findById(targetId);
    if (!product) return null;
    const nextAvailable = !product.available;
    const updated = ProductService.update({ id: targetId, available: nextAvailable });

    if (updated) {
      // Sincronizar visibilidad en Supabase (upsert seguro si faltaba el registro)
      toggleProductAvailableAction(targetId, nextAvailable, updated).catch(() => {
        // Fallback ya persistido en localStorage
      });

      // Notificar en tiempo real entre pestañas
      broadcastCatalogChange({
        type: "PRODUCT_TOGGLED",
        id: targetId,
        available: nextAvailable,
        product: updated,
      });
    }

    return updated;
  },

  remove(id: number | string): boolean {
    const numId = Number(id);
    const deletedIds = readDeletedIds();
    deletedIds.add(numId);
    writeDeletedIds(deletedIds);

    const current = ProductService.list();
    const next = current.filter((p) => Number(p.id) !== numId);
    writeToStorage(next);

    // Sincronizar eliminación en Supabase
    deleteProductAction(numId).catch(() => {
      // Fallback ya persistido en localStorage
    });

    // Notificar en tiempo real
    broadcastCatalogChange({ type: "PRODUCT_DELETED", id: numId });

    return true;
  },

  updateLocalProduct(product: Product): void {
    const current = ProductService.list();
    const targetId = Number(product.id);
    const idx = current.findIndex((p) => Number(p.id) === targetId);
    const normalized = normalizeProduct(product);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...normalized };
    } else {
      current.push(normalized);
    }
    writeToStorage(current);
  },

  addLocalProduct(product: Product): void {
    const current = ProductService.list();
    const targetId = Number(product.id);
    if (!current.some((p) => Number(p.id) === targetId)) {
      current.push(normalizeProduct(product));
      writeToStorage(current);
    }
  },

  removeLocalProduct(id: number | string): void {
    const targetId = Number(id);
    const current = ProductService.list();
    const next = current.filter((p) => Number(p.id) !== targetId);
    writeToStorage(next);
  },

  resetToSeed(): Product[] {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DELETED_KEY);
    }
    const seed = PRODUCTS_DATA.map(normalizeProduct);
    writeToStorage(seed);

    // Resincronizar los 35 productos base en Supabase
    bulkUpsertProductsAction(seed).catch(() => {
      // Fallback en localStorage
    });

    broadcastCatalogChange({ type: "BATCH_SYNC" });

    return seed;
  },

  stats(items?: Product[]) {
    const all = items || ProductService.list();
    return {
      total: all.length,
      active: all.filter((p) => p.available).length,
      inactive: all.filter((p) => !p.available).length,
      technology: all.filter((p) => p.type === "technology").length,
      library: all.filter((p) => p.type === "library").length,
      inStock: all.filter((p) => p.inStock).length,
      outOfStock: all.filter((p) => !p.inStock).length,
      featured: all.filter((p) => p.featured).length,
    };
  },
};

export default ProductService;
