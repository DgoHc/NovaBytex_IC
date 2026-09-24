import { PRODUCTS_DATA, type Product, type CatalogType } from "@/lib/products";

const STORAGE_KEY = "nova:products:v1";

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
    const stored = readFromStorage();
    if (stored && stored.length > 0) return stored;
    const seed = [...PRODUCTS_DATA];
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
    const current = ProductService.list();
    const next = current.filter((p) => p.id !== id);
    if (next.length === current.length) return false;
    writeToStorage(next);
    return true;
  },

  resetToSeed(): Product[] {
    writeToStorage([...PRODUCTS_DATA]);
    return PRODUCTS_DATA;
  },

  stats() {
    const all = ProductService.list();
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
