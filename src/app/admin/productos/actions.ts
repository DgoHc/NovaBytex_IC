"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Product, CustomCategory } from "@/lib/products";

export interface DbProductRow {
  id?: number;
  name: string;
  category: string;
  brand: string | null;
  sku: string | null;
  warranty: string | null;
  description: string | null;
  full_description: string | null;
  price: number;
  previous_price: number | null;
  image: string | null;
  gallery: string[] | null;
  in_stock: boolean;
  available: boolean;
  featured: boolean;
  rating: number;
  reviews_count: number;
  image_type: string;
  type: "technology" | "library";
  tech_subtype?: "hardware" | "license" | null;
  specifications: string[] | null;
  features: string[] | null;
  created_at?: string;
  updated_at?: string;
}

function toDbProduct(p: Partial<Product>): DbProductRow {
  return {
    ...(p.id ? { id: p.id } : {}),
    name: p.name ?? "",
    category: p.category ?? "General",
    brand: p.brand ?? "NovaBytex",
    sku: p.sku ?? null,
    warranty: p.warranty ?? null,
    description: p.description ?? null,
    full_description: p.fullDescription ?? null,
    price: Number(p.price) || 0,
    previous_price: p.previousPrice != null ? Number(p.previousPrice) : null,
    image: p.image ?? "",
    gallery: p.gallery ?? [],
    in_stock: p.inStock ?? true,
    available: p.available ?? true,
    featured: p.featured ?? false,
    rating: Number(p.rating) || 4.5,
    reviews_count: Number(p.reviewsCount) || 0,
    image_type: p.imageType ?? "switch",
    type: p.type ?? "technology",
    tech_subtype: p.techSubtype ?? null,
    specifications: p.specifications ?? [],
    features: p.features ?? [],
    ...(p.createdAt ? { created_at: p.createdAt } : {}),
  };
}

function fromDbProduct(row: any): Product {
  return {
    id: Number(row.id),
    name: row.name ?? "",
    category: row.category ?? "",
    brand: row.brand ?? "NovaBytex",
    sku: row.sku ?? "",
    warranty: row.warranty ?? "",
    description: row.description ?? "",
    fullDescription: row.full_description ?? row.fullDescription ?? "",
    price: Number(row.price) || 0,
    previousPrice: row.previous_price != null ? Number(row.previous_price) : undefined,
    image: row.image ?? "",
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    inStock: Boolean(row.in_stock),
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    rating: Number(row.rating) || 4.5,
    reviewsCount: Number(row.reviews_count) || 0,
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    features: Array.isArray(row.features) ? row.features : [],
    imageType: row.image_type ?? "switch",
    type: row.type ?? "technology",
    techSubtype: row.tech_subtype ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/**
 * Obtiene todos los productos directamente desde Supabase vía Service Role
 */
export async function fetchProductsAction(): Promise<{ success: boolean; data?: Product[]; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const products = (data || []).map(fromDbProduct);
    return { success: true, data: products };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al conectar con la base de datos",
    };
  }
}

/**
 * Crea o actualiza un producto en Supabase
 */
export async function saveProductAction(
  productData: Partial<Product>
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const row = toDbProduct(productData);

    const { data, error } = await supabase
      .from("products")
      .upsert(row)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/productos");
    revalidatePath("/libreria");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/inventario");

    return { success: true, data: fromDbProduct(data) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al guardar producto",
    };
  }
}

/**
 * Elimina un producto por ID en Supabase
 */
export async function deleteProductAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/productos");
    revalidatePath("/libreria");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/inventario");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al eliminar producto",
    };
  }
}

/**
 * Alterna la visibilidad en tienda (available) de un producto
 */
export async function toggleProductAvailableAction(
  id: number,
  available: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("products")
      .update({ available })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/productos");
    revalidatePath("/libreria");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al actualizar visibilidad",
    };
  }
}

/**
 * Alterna el stock de un producto
 */
export async function toggleProductStockAction(
  id: number,
  inStock: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("products")
      .update({ in_stock: inStock })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/productos");
    revalidatePath("/libreria");
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al actualizar stock",
    };
  }
}

/**
 * Inserción masiva de productos (para carga de Excel)
 */
export async function bulkUpsertProductsAction(
  products: Product[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    if (!products.length) return { success: true, count: 0 };
    const supabase = getSupabaseAdmin();
    const rows = products.map(toDbProduct);

    // Inserción en lotes de 50 para garantizar estabilidad con 300+ productos
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("products")
        .upsert(chunk, { onConflict: "id" });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/productos");
    revalidatePath("/libreria");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/inventario");

    return { success: true, count: products.length };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error en carga masiva de productos",
    };
  }
}

/**
 * Obtener categorías personalizadas desde Supabase
 */
export async function fetchCustomCategoriesAction(): Promise<{
  success: boolean;
  data?: CustomCategory[];
  error?: string;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("custom_categories")
      .select("name, type")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CustomCategory[] };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al cargar categorías",
    };
  }
}

/**
 * Guardar una categoría personalizada en Supabase
 */
export async function saveCustomCategoryAction(
  category: CustomCategory
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("custom_categories")
      .upsert(
        { name: category.name.trim(), type: category.type },
        { onConflict: "name" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al guardar categoría",
    };
  }
}

