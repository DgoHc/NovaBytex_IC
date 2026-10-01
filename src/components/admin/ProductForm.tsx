"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Cpu,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploader from "@/components/ui/ImageUploader";
import {
  ALL_CATEGORIES,
  TECHNOLOGY_CATEGORIES,
  LIBRARY_CATEGORIES,
  getCategoriesForType,
  type CatalogType,
  type Product,
} from "@/lib/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { cn } from "@/lib/utils";
import { ProductService } from "@/services/ProductService";

const imageTypes: { value: Product["imageType"]; label: string; group: CatalogType | "both" }[] = [
  { value: "switch", label: "Switch / Red", group: "technology" },
  { value: "server", label: "Servidor", group: "technology" },
  { value: "router", label: "Router", group: "technology" },
  { value: "firewall", label: "Firewall", group: "technology" },
  { value: "storage", label: "Almacenamiento", group: "technology" },
  { value: "laptop", label: "Laptop", group: "technology" },
  { value: "accesspoint", label: "Access Point", group: "technology" },
  { value: "book", label: "Libro", group: "library" },
  { value: "notebook", label: "Cuaderno", group: "library" },
  { value: "agenda", label: "Agenda", group: "library" },
  { value: "pen", label: "Lapicero / Bolígrafo", group: "library" },
  { value: "pencil", label: "Lápiz", group: "library" },
  { value: "marker", label: "Marcador", group: "library" },
  { value: "highlighter", label: "Resaltador", group: "library" },
  { value: "desk", label: "Accesorio escritorio", group: "library" },
  { value: "office", label: "Material oficina", group: "library" },
  { value: "school", label: "Material escolar", group: "both" },
];

export const ProductFormSchema = z
  .object({
    name: z
      .string({ required_error: "El nombre es obligatorio." })
      .min(3, "El nombre debe tener al menos 3 caracteres.")
      .max(160, "El nombre es demasiado largo."),
    description: z
      .string()
      .min(5, "La descripción corta debe tener al menos 5 caracteres.")
      .max(320, "La descripción corta es demasiado larga."),
    fullDescription: z
      .string()
      .max(2500, "La descripción larga es demasiado larga.")
      .optional()
      .or(z.literal("")),
    category: z.string({ required_error: "Selecciona una categoría." }).min(2),
    type: z.enum(["technology", "library"], {
      required_error: "Selecciona Tecnología o Librería.",
    }),
    brand: z
      .string()
      .min(2, "La marca debe tener al menos 2 caracteres.")
      .max(80),
    sku: z
      .string()
      .min(3, "El SKU debe tener al menos 3 caracteres.")
      .max(40),
    warranty: z.string().max(60).optional().or(z.literal("")),
    price: z.coerce
      .number({ invalid_type_error: "Ingresa un número." })
      .min(0, "El precio no puede ser negativo."),
    previousPrice: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined || Number.isNaN(Number(val))
          ? undefined
          : Number(val),
      z.number().min(0, "El precio anterior no puede ser negativo.").optional()
    ),
    image: z.string().optional().or(z.literal("")),
    imageType: z.enum(
      imageTypes.map((i) => i.value) as unknown as readonly [
        Product["imageType"],
        ...Product["imageType"][]
      ],
      { required_error: "Selecciona un tipo de imagen." }
    ),
    available: z.boolean().default(true),
    inStock: z.boolean().default(true),
    featured: z.boolean().default(false),
    specifications: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    rating: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined || Number.isNaN(Number(val))
          ? 4.5
          : Number(val),
      z.number().min(0).max(5).optional()
    ),
    reviewsCount: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined || Number.isNaN(Number(val))
          ? 0
          : Math.round(Number(val)),
      z.number().min(0).int().optional()
    ),
  })
  .refine(
    (data) => {
      if (
        data.previousPrice === undefined ||
        data.previousPrice === null ||
        isNaN(data.previousPrice)
      ) {
        return true;
      }
      return data.previousPrice > data.price;
    },
    {
      path: ["previousPrice"],
      message:
        "El precio anterior (oferta) debe ser mayor que el precio actual.",
    }
  );

export type ProductFormValues = z.infer<typeof ProductFormSchema>;

export interface ProductFormProps {
  mode: "create" | "edit";
  initial?: Product;
  initialType?: CatalogType;
  initialCategory?: string;
}

function arrayFromText(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function textFromArray(arr?: string[]): string {
  if (!arr || arr.length === 0) return "";
  return arr.join("\n");
}

export function ProductForm({
  mode,
  initial,
  initialType,
  initialCategory,
}: ProductFormProps) {
  const router = useRouter();
  const { createProduct, updateProduct } = useCatalog();
  const [featuresText, setFeaturesText] = React.useState(() =>
    textFromArray(initial?.features)
  );
  const [specificationsText, setSpecificationsText] = React.useState(() =>
    textFromArray(initial?.specifications)
  );

  const defaultValues: Partial<ProductFormValues> = useMemo(() => {
    if (mode === "edit" && initial) {
      return {
        name: initial.name,
        description: initial.description,
        fullDescription: initial.fullDescription ?? "",
        category: initial.category,
        type: initial.type,
        brand: initial.brand,
        sku: initial.sku,
        warranty: initial.warranty ?? "",
        price: initial.price,
        previousPrice: initial.previousPrice,
        image: initial.image ?? "",
        imageType: initial.imageType,
        available: initial.available,
        inStock: initial.inStock,
        featured: initial.featured,
        rating: initial.rating,
        reviewsCount: initial.reviewsCount,
      };
    }
    const preferredType: CatalogType = initialType ?? "technology";
    const preferredCat =
      initialCategory &&
      (preferredType === "technology"
        ? TECHNOLOGY_CATEGORIES
        : LIBRARY_CATEGORIES
      ).includes(initialCategory)
        ? initialCategory
        : preferredType === "technology"
        ? "Redes"
        : "Libros";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return {
      name: "",
      description: "",
      fullDescription: "",
      category: preferredCat,
      type: preferredType,
      brand: preferredType === "technology" ? "Cisco" : "NovaBytex",
      sku:
        preferredType === "technology"
          ? `NB-TI-${randomSuffix}`
          : `NB-LIB-${randomSuffix}`,
      warranty:
        preferredType === "technology" ? "12 meses" : "Garantía de tienda",
      price: 0,
      previousPrice: undefined,
      image: "",
      imageType: preferredType === "technology" ? "switch" : "book",
      available: true,
      inStock: true,
      featured: false,
      rating: 4.8,
      reviewsCount: 0,
    };
  }, [mode, initial, initialType, initialCategory]);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: defaultValues as ProductFormValues,
    mode: "onTouched",
  });

  useEffect(() => {
    reset(defaultValues as ProductFormValues);
    setFeaturesText(textFromArray(initial?.features));
    setSpecificationsText(textFromArray(initial?.specifications));
  }, [defaultValues, reset, initial]);

  const activeType = watch("type") as CatalogType | undefined;
  const activeCategory = watch("category");
  const activeImageType = watch("imageType");
  const price = watch("price");
  const previousPrice = watch("previousPrice");
  const isTech = activeType === "technology";

  const categoriesForType = useMemo(() => {
    if (activeType) return getCategoriesForType(activeType);
    return getCategoriesForType("all");
  }, [activeType]);

  useEffect(() => {
    if (!activeType) return;
    if (!categoriesForType.includes(activeCategory)) {
      setValue("category", categoriesForType[0], {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [activeType, categoriesForType, activeCategory, setValue]);

  const imageTypesForType = useMemo(() => {
    if (!activeType) return imageTypes;
    return imageTypes.filter(
      (t) => t.group === activeType || t.group === "both"
    );
  }, [activeType]);

  useEffect(() => {
    if (!activeType) return;
    const valid = imageTypesForType.some((t) => t.value === activeImageType);
    if (!valid && imageTypesForType.length > 0) {
      setValue("imageType", imageTypesForType[0].value, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [activeType, imageTypesForType, activeImageType, setValue]);

  const onSubmit = async (values: ProductFormValues) => {
    const specs = arrayFromText(specificationsText) as never;
    const feats = arrayFromText(featuresText) as never;

    if (mode === "create") {
      const created = createProduct({
        name: values.name.trim(),
        description: values.description.trim(),
        fullDescription: values.fullDescription?.trim() ?? "",
        category: values.category,
        type: values.type,
        brand: values.brand.trim(),
        sku: values.sku.trim().toUpperCase(),
        warranty: values.warranty?.trim() ?? "",
        price: Number(values.price),
        previousPrice:
          typeof values.previousPrice === "number" && !isNaN(values.previousPrice)
            ? values.previousPrice
            : undefined,
        image: values.image ?? "",
        imageType: values.imageType,
        available: values.available,
        inStock: values.inStock,
        featured: values.featured,
        rating: typeof values.rating === "number" ? values.rating : 4.5,
        reviewsCount:
          typeof values.reviewsCount === "number" ? values.reviewsCount : 0,
        specifications: specs,
        features: feats,
      });
      if (created) {
        router.push(`/admin/productos/${created.id}?created=1`);
      }
      return;
    }

    if (mode === "edit" && initial) {
      const updated = updateProduct({
        id: initial.id,
        name: values.name.trim(),
        description: values.description.trim(),
        fullDescription: values.fullDescription?.trim() ?? "",
        category: values.category,
        type: values.type,
        brand: values.brand.trim(),
        sku: values.sku.trim().toUpperCase(),
        warranty: values.warranty?.trim() ?? "",
        price: Number(values.price),
        previousPrice:
          typeof values.previousPrice === "number" && !isNaN(values.previousPrice)
            ? values.previousPrice
            : undefined,
        image: values.image ?? "",
        imageType: values.imageType,
        available: values.available,
        inStock: values.inStock,
        featured: values.featured,
        rating: typeof values.rating === "number" ? values.rating : initial.rating,
        reviewsCount:
          typeof values.reviewsCount === "number"
            ? values.reviewsCount
            : initial.reviewsCount,
        specifications: specs,
        features: feats,
      });
      if (updated) {
        router.push(`/admin/productos?updated=1`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full relative flex flex-col pb-24 max-w-[1120px] mx-auto">
      {/* Page Header */}
      <div className="mb-6 space-y-1">
        <p className="text-sm font-semibold text-slate-900 leading-none">
          <span className="text-slate-500 font-normal">Productos</span>
          <span className="mx-1.5 text-slate-300 font-medium">/</span>
          <span>{mode === "create" ? "Nuevo producto" : "Editar producto"}</span>
        </p>
        <h1 className="text-[20px] font-sans font-bold text-slate-900 leading-tight">
          {mode === "create" ? "Nuevo producto" : "Editar producto"}
        </h1>
        <p className="text-xs text-slate-500">* Campo obligatorio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main Column */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm divide-y divide-slate-200">
          
          {/* Section 1: Tipo de catálogo */}
          <div className="p-6">
            <h2 className="text-[14px] font-semibold text-slate-900">Tipo de catálogo</h2>
            <p className="text-[13px] text-slate-500 mt-1 mb-4">Define en qué tienda se mostrará este producto.</p>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="flex bg-slate-100 p-1 rounded-md mb-2">
                  <button
                    type="button"
                    onClick={() => field.onChange("technology")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded text-sm font-medium transition-colors",
                      field.value === "technology" ? "bg-white text-blue-700 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Cpu className="w-4 h-4" /> Tecnología
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("library")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded text-sm font-medium transition-colors",
                      field.value === "library" ? "bg-white text-emerald-700 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <BookOpen className="w-4 h-4" /> Librería
                  </button>
                </div>
              )}
            />
            {errors.type?.message && <p className="text-[12px] text-rose-600 mt-1">{errors.type.message}</p>}
          </div>

          {/* Section 2: Información Básica */}
          <div className="p-6 space-y-4">
            <h2 className="text-[14px] font-semibold text-slate-900">Información básica</h2>
            <p className="text-[13px] text-slate-500 mt-1 mb-4">Datos principales para identificar el artículo.</p>
            
            <Field label="Nombre del producto" required error={errors.name?.message}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={cn("h-10 rounded-md bg-white border-slate-200 focus:ring-2 focus:ring-blue-500", errors.name && "border-rose-500")} />
                )}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Marca / Editorial" required error={errors.brand?.message}>
                <Controller name="brand" control={control} render={({ field }) => <Input {...field} className="h-10 rounded-md" />} />
              </Field>
              <Field label="SKU" required error={errors.sku?.message}>
                <Controller name="sku" control={control} render={({ field }) => <Input {...field} className="h-10 rounded-md font-mono" />} />
              </Field>
              <Field label="Categoría" required error={errors.category?.message}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesForType.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
            
            <Field label="Descripción" required error={errors.description?.message}>
              <Controller name="description" control={control} render={({ field }) => <Textarea {...field} rows={3} className="rounded-md" />} />
            </Field>
          </div>

          {/* Section 3: Especificaciones */}
          <div className="p-6 space-y-4">
            <h2 className="text-[14px] font-semibold text-slate-900">Especificaciones técnicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Características (Viñetas)" optional>
                <Textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="rounded-md font-mono text-xs" />
              </Field>
              <Field label="Ficha Técnica (Clave: Valor)" optional>
                <Textarea rows={4} value={specificationsText} onChange={(e) => setSpecificationsText(e.target.value)} className="rounded-md font-mono text-xs" />
              </Field>
            </div>
          </div>

          {/* Section 4: Precio e Inventario */}
          <div className="p-6 space-y-4">
            <h2 className="text-[14px] font-semibold text-slate-900">Precio e inventario</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Precio (S/)" required error={errors.price?.message}>
                <Controller name="price" control={control} render={({ field }) => (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">S/</span>
                    <Input {...field} type="number" step="0.01" className="h-10 pl-8 text-right tabular-nums rounded-md" />
                  </div>
                )} />
              </Field>
              <Field label="Precio anterior (S/)" optional error={errors.previousPrice?.message}>
                <Controller name="previousPrice" control={control} render={({ field }) => (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">S/</span>
                    <Input {...field} value={typeof field.value === "number" ? field.value : ""} type="number" step="0.01" className="h-10 pl-8 text-right tabular-nums rounded-md" />
                  </div>
                )} />
              </Field>
            </div>
            
            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Controller name="featured" control={control} render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
                <span className="text-sm font-medium text-slate-700">Destacado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Controller name="inStock" control={control} render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
                <span className="text-sm font-medium text-slate-700">En Stock</span>
              </label>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="sticky top-[calc(var(--topbar-h)+24px)] space-y-6">
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-slate-900">Imagen</h2>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUploader value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
            <Field label="O ilustración por defecto" required error={errors.imageType?.message}>
              <Controller
                name="imageType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 rounded-md text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageTypesForType.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-slate-900">Visibilidad</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <Controller name="available" control={control} render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
              <span className="text-sm font-medium text-slate-700">Visible en tienda</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 h-[56px] flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:pl-64">
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Cambios sin guardar
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-9"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Guardando…" : (mode === "create" ? "Guardar producto" : "Guardar cambios")}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
  className,
  required,
  optional,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[13px] font-medium normal-case text-slate-800 flex items-center gap-1">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </Label>
        {optional && (
          <span className="text-[10px] text-slate-400 normal-case">
            Opcional
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="text-[12px] text-slate-500 leading-snug">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] font-semibold text-rose-700 leading-snug flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

function ToggleField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl p-3 bg-white border border-slate-200">
      <div className="min-w-0">
        <p className="text-[12.5px] font-bold text-slate-900 leading-snug">
          {label}
        </p>
        {hint && (
          <p className="text-[11px] text-slate-500 leading-snug mt-1">
            {hint}
          </p>
        )}
        {error && (
          <p className="text-[11px] font-semibold text-rose-700 mt-1">
            {error}
          </p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

function CheckboxRow({
  label,
  name,
  control,
}: {
  label: string;
  name: "available" | "inStock" | "featured";
  control: ReturnType<typeof useForm<ProductFormValues>>["control"];
}) {
  return (
    <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white transition-colors cursor-pointer">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Checkbox
            checked={!!field.value}
            onCheckedChange={(v) => field.onChange(v === true)}
            className="mt-0.5"
          />
        )}
      />
      <span className="text-[12.5px] font-semibold text-slate-800 leading-snug">
        {label}
      </span>
    </label>
  );
}

function TypeCard({
  value,
  checked,
  title,
  description,
  icon: Icon,
  tone,
  onSelect,
}: {
  value: CatalogType;
  checked: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "blue" | "sage";
  onSelect: (val: CatalogType) => void;
}) {
  return (
    <div
      role="radio"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onSelect(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(value);
        }
      }}
      className={cn(
        "cursor-pointer relative flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200 select-none",
        checked
          ? tone === "blue"
            ? "border-blue-500 bg-blue-50/70 shadow-sm"
            : "border-library-sage bg-library-cream/60 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
          checked
            ? tone === "blue"
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
              : "bg-library-sage-foreground text-white border-library-sage-foreground shadow-md shadow-library-sage/30"
            : "bg-slate-100 text-slate-600 border-slate-200"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm font-black leading-none",
              checked ? "text-slate-900" : "text-slate-800"
            )}
          >
            {title}
          </p>
          {checked && (
            <Badge
              className={cn(
                "h-5 px-2 rounded-md text-[10.5px] font-bold border shrink-0",
                tone === "blue"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-library-sage-foreground text-white border-library-sage-foreground"
              )}
            >
              Seleccionado
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "text-[12px] leading-snug",
            checked ? "text-slate-600" : "text-slate-500"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default ProductForm;
 
