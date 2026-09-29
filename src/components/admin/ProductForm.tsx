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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 lg:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="h-9 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Volver
            </Button>
            <Badge
              className={cn(
                "h-6 px-3 rounded-xl text-[11px] font-bold border",
                mode === "create"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-library-sage/25 text-library-sage-foreground border-library-sage/50"
              )}
            >
              {mode === "create" ? "Nuevo producto" : "Editar producto"}
            </Badge>
          </div>
          <h1 className="font-bodoni text-3xl md:text-4xl tracking-tight text-slate-900 leading-[1.05]">
            {mode === "create"
              ? "Agregar producto al catálogo"
              : `Editar · ${initial?.name ?? ""}`}
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Completa la información básica del producto. Los campos con{" "}
            <span className="font-semibold text-slate-700">*</span> son
            obligatorios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              asChild
              className="h-11 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              <Link href={`/productos/${initial?.id}`} target="_blank">
                Ver en tienda
              </Link>
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-blue-800 text-white text-sm font-semibold shadow-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
              ? "Guardar producto"
              : "Guardar cambios"}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        <div className="lg:col-span-8 space-y-5 lg:space-y-6">
          <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <CardHeader className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 flex flex-row items-center justify-between">
              <div>
                <h2 className="font-bodoni text-xl text-slate-900 leading-none">
                  {isTech ? "Equipamiento TI & Conectividad" : "Información de Librería & Papelería"}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5">
                  {isTech
                    ? "Configura las propiedades de hardware, conectividad y soporte empresarial."
                    : "Configura el formato, materiales, encuadernación y detalles de librería."}
                </p>
              </div>
              <Badge
                className={cn(
                  "hidden sm:inline-flex text-[10.5px] font-bold border",
                  isTech
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-library-sage/25 text-library-sage-foreground border-library-sage/50"
                )}
              >
                {isTech ? "Catálogo TI" : "Catálogo Librería"}
              </Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Nombre del producto"
                  required
                  error={errors.name?.message}
                  className="md:col-span-2"
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={
                          isTech
                            ? "Ej. Switch Cisco Catalyst 1000 24 Puertos Gigabit"
                            : "Ej. Cuaderno Moleskine Classic Tapa Dura Rayado"
                        }
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500"
                      />
                    )}
                  />
                </Field>

                <Field
                  label="Tipo de catálogo"
                  required
                  hint="Define si este artículo se exhibe en la tienda de Tecnología o en Librería."
                  error={errors.type?.message}
                  className="md:col-span-2"
                >
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <div
                        role="radiogroup"
                        aria-label="Tipo de catálogo"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        <TypeCard
                          value="technology"
                          checked={field.value === "technology"}
                          title="Tecnología"
                          description="Hardware, redes, servidores y equipos TI corporativos."
                          icon={Cpu}
                          tone="blue"
                          onSelect={(v) => field.onChange(v)}
                        />
                        <TypeCard
                          value="library"
                          checked={field.value === "library"}
                          title="Librería"
                          description="Libros, cuadernos, agendas, arte y suministros de oficina."
                          icon={BookOpen}
                          tone="sage"
                          onSelect={(v) => field.onChange(v)}
                        />
                      </div>
                    )}
                  />
                </Field>

                <Field label="Categoría" required error={errors.category?.message}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesForType.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field
                  label={isTech ? "Marca / Fabricante TI" : "Marca / Editorial"}
                  required
                  error={errors.brand?.message}
                >
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={
                          isTech
                            ? "Ej. Cisco, Dell, Fortinet, HP, Ubiquiti, Mikrotik"
                            : "Ej. Moleskine, Parker, Faber-Castell, Norma, Santillana"
                        }
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500"
                      />
                    )}
                  />
                </Field>

                <Field label="SKU / Código Interno" required error={errors.sku?.message}>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={isTech ? "NB-SW-CISCO-24G" : "NB-LIB-MOLE-A5"}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 font-mono tracking-wide"
                      />
                    )}
                  />
                </Field>

                <Field
                  label={isTech ? "Garantía Oficial TI" : "Garantía o Respaldo"}
                  optional
                  error={errors.warranty?.message}
                >
                  <Controller
                    name="warranty"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={
                          isTech
                            ? "Ej. 12 meses oficial del fabricante + Soporte 24/7"
                            : "Ej. 6 meses por defectos de fábrica"
                        }
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500"
                      />
                    )}
                  />
                </Field>
              </div>

              <Field
                label="Descripción corta"
                required
                hint="Aparece en las tarjetas de producto y catálogo general."
                error={errors.description?.message}
              >
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={
                        isTech
                          ? "Ej. Switch administrable capa 2 con 24 puertos Gigabit PoE+ y 4 SFP para centros de datos."
                          : "Ej. Cuaderno cosido de tapa dura con 192 páginas rayadas y papel marfil de 90g."
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500"
                    />
                  )}
                />
              </Field>

              <Field
                label="Descripción detallada"
                optional
                hint="Información técnica completa, arquitectura, contenidos o recomendaciones."
                error={errors.fullDescription?.message}
              >
                <Controller
                  name="fullDescription"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder={
                        isTech
                          ? "Detalles de arquitectura de red, protocolos soportados, ventilación, compatibilidad rack..."
                          : "Detalles de encuadernación, gramaje de papel, acabados de cubierta, resistencia y técnicas recomendadas..."
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 leading-relaxed"
                    />
                  )}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label={
                    isTech
                      ? "Características de Hardware & Redes"
                      : "Características del Artículo & Acabado"
                  }
                  optional
                  hint="Se muestra como viñetas en la ficha del producto."
                >
                  <Textarea
                    rows={4}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    placeholder={
                      isTech
                        ? "- 24 puertos Gigabit 10/100/1000 Mbps\n- 4 enlaces SFP+ 10G para fibra\n- Capacidad de conmutación 128 Gbps\n- Fuentes de alimentación redundantes"
                        : "- Papel marfil de 90 g/m² libre de ácido\n- Tapa dura con esquinas redondeadas\n- Cierre con elástico y cinta marcapáginas\n- Bolsillo interior expandible"
                    }
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 font-mono text-[12.5px]"
                  />
                </Field>
                <Field
                  label={
                    isTech
                      ? "Ficha Técnica TI (Clave: Valor)"
                      : "Ficha Técnica / Medidas (Clave: Valor)"
                  }
                  optional
                  hint="Formato corto: Clave: Valor (uno por línea)."
                >
                  <Textarea
                    rows={4}
                    value={specificationsText}
                    onChange={(e) => setSpecificationsText(e.target.value)}
                    placeholder={
                      isTech
                        ? "Factor de Forma: Rack 1U 19\"\nMemoria RAM: 16 GB ECC\nAlmacenamiento: 2x 480GB SSD Enterprise\nConsumo Eléctrico: 65W máx."
                        : "Formato: A5 (14.8 x 21 cm)\nPáginas: 192 páginas rayadas\nGramaje: 90 g/m²\nEncuadernación: Cosido hilo smyth"
                    }
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 font-mono text-[12.5px]"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <CardHeader className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bodoni text-xl text-slate-900 leading-none">
                    Precios & Stock
                  </h2>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Define el precio de venta y disponibilidad.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Soles peruanos (PEN)
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Precio actual (S/)" required error={errors.price?.message}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 tabular-nums text-lg font-bold"
                      />
                    )}
                  />
                </Field>
                <Field
                  label="Precio anterior / Oferta (S/)"
                  optional
                  hint={
                    typeof previousPrice === "number" && previousPrice > 0
                      ? `Descuento aplicado ≈ ${Math.round(
                          ((previousPrice - Number(price ?? 0)) / previousPrice) * 100
                        )}%`
                      : "Solo si el producto cuenta con descuento. Debe ser mayor al precio actual."
                  }
                  error={errors.previousPrice?.message}
                >
                  <Controller
                    name="previousPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={
                          typeof field.value === "number" ? field.value : ""
                        }
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="Opcional"
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 tabular-nums"
                      />
                    )}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Puntuación inicial (0–5)" optional error={errors.rating?.message}>
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={
                          typeof field.value === "number" ? field.value : 4.5
                        }
                        type="number"
                        step="0.1"
                        min={0}
                        max={5}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 tabular-nums"
                      />
                    )}
                  />
                </Field>
                <Field label="Número de reseñas" optional error={errors.reviewsCount?.message}>
                  <Controller
                    name="reviewsCount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={
                          typeof field.value === "number" ? field.value : 0
                        }
                        type="number"
                        step={1}
                        min={0}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 tabular-nums"
                      />
                    )}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <ToggleField
                  label="Producto activo"
                  hint={
                    <span>
                      Si está <strong>desactivado</strong> no aparece en tienda.
                    </span>
                  }
                  error={errors.available?.message}
                >
                  <Controller
                    name="available"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </ToggleField>
                <ToggleField
                  label="Tiene stock"
                  hint="Indica si hay unidades disponibles."
                  error={errors.inStock?.message}
                >
                  <Controller
                    name="inStock"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </ToggleField>
                <ToggleField
                  label="Producto destacado"
                  hint="Aparece en zonas premium como el home."
                  error={errors.featured?.message}
                >
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </ToggleField>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-5 lg:space-y-6">
          <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <CardHeader className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
              <h2 className="font-bodoni text-xl text-slate-900 leading-none">
                Imagen del producto
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Sube la foto desde tu dispositivo o selecciona una ilustración temática.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />

              <Field
                label="Tipo de ilustración (fallback)"
                required
                hint={
                  isTech
                    ? "Ilustración corporativa para switches, servidores, firewalls, etc."
                    : "Ilustración para libros, cuadernos, agendas, plumas, etc."
                }
                error={errors.imageType?.message}
              >
                <Controller
                  name="imageType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {imageTypesForType.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <CardHeader className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
              <h2 className="font-bodoni text-xl text-slate-900 leading-none">
                Guarda rápido
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Todo cambio queda guardado en tu navegador.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="space-y-2 text-[12px] text-slate-500">
                <CheckboxRow
                  label="Mostrar producto en tienda"
                  name="available"
                  control={control}
                />
                <CheckboxRow
                  label="Marcar como disponible (en stock)"
                  name="inStock"
                  control={control}
                />
                <CheckboxRow
                  label="Incluir en destacados"
                  name="featured"
                  control={control}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-blue-800 text-white text-sm font-semibold shadow-sm disabled:opacity-60"
              >
                <Save className="w-4 h-4 mr-2" />
                {mode === "create" ? "Crear producto" : "Guardar cambios"}
              </Button>
              {isDirty && (
                <p className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  Tienes cambios sin guardar en el formulario.
                </p>
              )}
            </CardContent>
          </Card>
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
        <Label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 flex items-center gap-1">
          {label}
        </Label>
        {required && (
          <span className="text-[9.5px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded uppercase tracking-wider">
            Requerido
          </span>
        )}
        {optional && (
          <span className="text-[9.5px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded uppercase tracking-wider">
            Opcional
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="text-[11.5px] text-slate-500 leading-snug">{hint}</p>
      )}
      {error && (
        <p className="text-[11.5px] font-semibold text-rose-700 leading-snug">
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
