import { PRODUCTS_DATA, type Product, type CatalogType } from "@/lib/products";

const STORAGE_KEY = "nova:products:v2";
const DELETED_KEY = "nova:deleted_product_ids:v1";

function readDeletedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DELETED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
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
  const max = products.reduce((acc, p) => (p.id > acc ? p.id : acc), 0);
  return max + 1;
}

function readFromStorage(): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
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

  list(): Product[] {
    const deletedIds = readDeletedIds();
    const stored = readFromStorage();
    if (stored && stored.length > 0) {
      // Filtrar cualquier producto eliminado
      const activeStored = stored.filter((p) => !deletedIds.has(p.id));

      // Sincronizar estado de disponibilidad (available) con los datos base de PRODUCTS_DATA
      const synced = activeStored.map((p) => {
        const seed = PRODUCTS_DATA.find((s) => s.id === p.id);
        if (seed && seed.available !== p.available) {
          return { ...p, available: seed.available };
        }
        return p;
      });

      const existingIds = new Set(synced.map((p) => p.id));
      // Solo incorporar productos base si NO fueron eliminados explícitamente
      const missing = PRODUCTS_DATA.filter((p) => !existingIds.has(p.id) && !deletedIds.has(p.id));
      if (missing.length > 0 || activeStored.length !== stored.length) {
        const merged = [...synced, ...missing];
        writeToStorage(merged);
        return merged;
      }
      writeToStorage(synced);
      return synced;
    }
    const seed = PRODUCTS_DATA.filter((p) => !deletedIds.has(p.id));
    writeToStorage(seed);
    return seed;
  },

  findById(id: number): Product | undefined {
    return ProductService.list().find((p) => p.id === id);
  },

  findByType(type: CatalogType | "all"): Product[] {
    const all = ProductService.list();
    if (type === "all") return all;
    return all.filter((p) => p.type === type);
  },

  create(input: CreateProductInput): Product {
    const current = ProductService.list();
    const id = input.id ?? generateId(current);
    const now = new Date().toISOString();
    const product: Product = {
      ...DEFAULT_NEW_PRODUCT,
      ...input,
      id,
      createdAt: now,
    };
    const next = [...current, product];
    writeToStorage(next);
    return product;
  },

  bulkCreate(inputs: CreateProductInput[]): Product[] {
    if (!inputs.length) return [];
    let current = ProductService.list();
    let nextId = generateId(current);
    const now = new Date().toISOString();
    const createdList: Product[] = [];

    for (const input of inputs) {
      const id = input.id ?? nextId++;
      const product: Product = {
        ...DEFAULT_NEW_PRODUCT,
        ...input,
        id,
        createdAt: now,
      };
      createdList.push(product);
    }

    const next = [...current, ...createdList];
    writeToStorage(next);
    return createdList;
  },

  update(input: UpdateProductInput): Product | null {
    const current = ProductService.list();
    const idx = current.findIndex((p) => p.id === input.id);
    if (idx < 0) return null;
    const updated: Product = {
      ...current[idx],
      ...input,
      id: input.id,
      createdAt: current[idx].createdAt ?? new Date().toISOString(),
    };
    const next = [...current];
    next[idx] = updated;
    writeToStorage(next);
    return updated;
  },

  toggleAvailable(id: number): Product | null {
    const product = ProductService.findById(id);
    if (!product) return null;
    return ProductService.update({ id, available: !product.available });
  },

  remove(id: number): boolean {
    const deletedIds = readDeletedIds();
    deletedIds.add(id);
    writeDeletedIds(deletedIds);

    const current = ProductService.list();
    const next = current.filter((p) => p.id !== id);
    writeToStorage(next);
    return true;
  },

  resetToSeed(): Product[] {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DELETED_KEY);
    }
    writeToStorage([...PRODUCTS_DATA]);
    return PRODUCTS_DATA;
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
