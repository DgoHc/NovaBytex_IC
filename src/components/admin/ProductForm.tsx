"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Cpu,
  BookOpen,
  Plus,
  Trash2,
  X,
  Upload,
  ImageIcon,
  Sparkles,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Sun,
  Moon,
  Check,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImage } from "@/components/ui/ProductImage";
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
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres.")
      .max(80, "Máximo 80 caracteres recomendados."),
    description: z
      .string({ required_error: "La descripción es obligatoria." })
      .trim()
      .min(5, "La descripción debe tener al menos 5 caracteres.")
      .max(500, "Máximo 500 caracteres."),
    category: z.string({ required_error: "Selecciona una categoría." }).min(2, "Selecciona una categoría."),
    type: z.enum(["technology", "library"], {
      required_error: "Selecciona Tecnología o Librería.",
    }),
    brand: z
      .string()
      .trim()
      .min(2, "La marca debe tener al menos 2 caracteres.")
      .max(80, "Marca demasiado larga."),
    sku: z
      .string()
      .trim()
      .min(3, "El SKU debe tener al menos 3 caracteres.")
      .max(40, "SKU demasiado largo."),
    warranty: z.string().max(60).optional().or(z.literal("")),
    price: z.coerce
      .number({ invalid_type_error: "Ingresa un precio válido." })
      .min(0, "El precio no puede ser negativo."),
    previousPrice: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined || Number.isNaN(Number(val))
          ? undefined
          : Number(val),
      z.number().min(0, "El precio anterior no puede ser negativo.").optional()
    ),
    image: z.string().optional().or(z.literal("")),
    gallery: z.array(z.string()).optional(),
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
      message: "El precio anterior debe ser mayor que el precio actual para reflejar una oferta.",
    }
  );

export type ProductFormValues = z.infer<typeof ProductFormSchema>;

export interface ProductFormProps {
  mode: "create" | "edit";
  initial?: Product;
  initialType?: CatalogType;
  initialCategory?: string;
}

interface SpecItem {
  id: string;
  key: string;
  value: string;
}

interface FeatureItem {
  id: string;
  text: string;
}

export function ProductForm({
  mode,
  initial,
  initialType,
  initialCategory,
}: ProductFormProps) {
  const router = useRouter();
  const { createProduct, updateProduct } = useCatalog();

  // Dynamic Specs & Features State
  const [specsList, setSpecsList] = useState<SpecItem[]>(() => {
    if (initial?.specifications && initial.specifications.length > 0) {
      return initial.specifications.map((item, idx) => {
        const colonIdx = item.indexOf(":");
        if (colonIdx > 0) {
          return {
            id: `spec-${idx}-${Date.now()}`,
            key: item.slice(0, colonIdx).trim(),
            value: item.slice(colonIdx + 1).trim(),
          };
        }
        return {
          id: `spec-${idx}-${Date.now()}`,
          key: "Detalle",
          value: item.trim(),
        };
      });
    }
    return [
      { id: "spec-1", key: "Marca", value: initial?.brand || "" },
      { id: "spec-2", key: "Garantía", value: initial?.warranty || "6 meses" },
    ];
  });

  const [featuresList, setFeaturesList] = useState<FeatureItem[]>(() => {
    if (initial?.features && initial.features.length > 0) {
      return initial.features.map((item, idx) => ({
        id: `feat-${idx}-${Date.now()}`,
        text: item,
      }));
    }
    return [];
  });

  // Collapsible state for specs section (closed by default)
  const [specsOpen, setSpecsOpen] = useState(false);

  // Gallery Management
  const [galleryList, setGalleryList] = useState<string[]>(() => initial?.gallery || []);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [showGalleryUrlBox, setShowGalleryUrlBox] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement | null>(null);

  // Preview options state
  const [previewViewMode, setPreviewViewMode] = useState<"card" | "detail">("card");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [tabletPreviewOpen, setTabletPreviewOpen] = useState(false);

  // Offer chip state
  const [isOfferActive, setIsOfferActive] = useState(() => {
    return Boolean(
      initial?.previousPrice &&
      initial.previousPrice > initial.price
    );
  });

  const defaultValues: Partial<ProductFormValues> = useMemo(() => {
    if (mode === "edit" && initial) {
      return {
        name: initial.name,
        description: initial.description,
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
        : "Cuadernos";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return {
      name: "",
      description: "",
      category: preferredCat,
      type: preferredType,
      brand: preferredType === "technology" ? "Cisco" : "Standford",
      sku:
        preferredType === "technology"
          ? `NB-TI-${randomSuffix}`
          : `NB-LIB-${randomSuffix}`,
      warranty:
        preferredType === "technology" ? "12 meses" : "Garantía de tienda",
      price: 0,
      previousPrice: undefined,
      image: "",
      imageType: preferredType === "technology" ? "switch" : "notebook",
      available: true,
      inStock: true,
      featured: false,
      rating: 4.8,
      reviewsCount: 0,
    };
  }, [mode, initial, initialType, initialCategory]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: defaultValues as ProductFormValues,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(defaultValues as ProductFormValues);
  }, [defaultValues, reset]);

  // Prevent accidental navigation when form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Watched form values for live preview
  const watchedValues = watch();
  const activeType = watchedValues.type as CatalogType;
  const activeCategory = watchedValues.category;
  const activePrice = Number(watchedValues.price) || 0;
  const activePrevPrice = Number(watchedValues.previousPrice) || 0;
  const activeImage = watchedValues.image || "";
  const activeImageType = watchedValues.imageType || "switch";
  const activeFeatured = Boolean(watchedValues.featured);
  const activeInStock = watchedValues.inStock ?? true;
  const activeAvailable = watchedValues.available ?? true;

  const categoriesForType = useMemo(() => {
    if (activeType) return getCategoriesForType(activeType);
    return getCategoriesForType("all");
  }, [activeType]);

  // Sync category if type changes
  useEffect(() => {
    if (!categoriesForType.includes(activeCategory)) {
      setValue("category", categoriesForType[0], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [activeType, categoriesForType, activeCategory, setValue]);

  // Filter image illustrations for type
  const imageTypesForType = useMemo(() => {
    if (!activeType) return imageTypes;
    return imageTypes.filter(
      (t) => t.group === activeType || t.group === "both"
    );
  }, [activeType]);

  // Discount percentage calculation
  const calculatedDiscount = useMemo(() => {
    if (activePrevPrice > activePrice && activePrevPrice > 0) {
      return Math.round(((activePrevPrice - activePrice) / activePrevPrice) * 100);
    }
    return 0;
  }, [activePrice, activePrevPrice]);

  // Auto-generate SKU
  const handleGenerateSku = () => {
    const prefix = activeType === "technology" ? "NB-TI" : "NB-LIB";
    const rand = Math.floor(1000 + Math.random() * 9000);
    setValue("sku", `${prefix}-${rand}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Main Image Upload Handler
  const handleMainImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue("image", reader.result, { shouldDirty: true, shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Gallery Handlers
  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setGalleryList((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput("");
    setShowGalleryUrlBox(false);
  };

  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setGalleryList((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveGalleryItem = (idx: number) => {
    setGalleryList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveGalleryItem = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= galleryList.length) return;
    const newList = [...galleryList];
    const temp = newList[idx];
    newList[idx] = newList[targetIdx];
    newList[targetIdx] = temp;
    setGalleryList(newList);
  };

  // Specs Handlers
  const handleAddSpec = () => {
    setSpecsList((prev) => [
      ...prev,
      { id: `spec-${Date.now()}-${Math.random()}`, key: "", value: "" },
    ]);
  };

  const handleUpdateSpec = (id: string, field: "key" | "value", val: string) => {
    setSpecsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleRemoveSpec = (id: string) => {
    setSpecsList((prev) => prev.filter((s) => s.id !== id));
  };

  // Features Handlers
  const handleAddFeature = () => {
    setFeaturesList((prev) => [
      ...prev,
      { id: `feat-${Date.now()}-${Math.random()}`, text: "" },
    ]);
  };

  const handleUpdateFeature = (id: string, text: string) => {
    setFeaturesList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, text } : f))
    );
  };

  const handleRemoveFeature = (id: string) => {
    setFeaturesList((prev) => prev.filter((f) => f.id !== id));
  };

  // Submit Handler
  const onSubmit = async (values: ProductFormValues, overrideAvailable?: boolean) => {
    const formattedSpecs = specsList
      .map((s) => (s.key && s.value ? `${s.key.trim()}: ${s.value.trim()}` : (s.key || s.value).trim()))
      .filter(Boolean);

    const formattedFeatures = featuresList
      .map((f) => f.text.trim())
      .filter(Boolean);

    const isAvailable = overrideAvailable !== undefined ? overrideAvailable : values.available;

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      fullDescription: values.description.trim(),
      category: values.category,
      type: values.type,
      brand: values.brand.trim(),
      sku: values.sku.trim(),
      warranty: values.warranty?.trim() ?? "",
      price: Number(values.price),
      previousPrice:
        typeof values.previousPrice === "number" && !isNaN(values.previousPrice)
          ? values.previousPrice
          : undefined,
      image: values.image ?? "",
      gallery: galleryList,
      imageType: values.imageType,
      available: isAvailable,
      inStock: values.inStock,
      featured: values.featured,
      rating: typeof values.rating === "number" ? values.rating : 4.5,
      reviewsCount: typeof values.reviewsCount === "number" ? values.reviewsCount : 0,
      specifications: formattedSpecs,
      features: formattedFeatures,
    };

    if (mode === "create") {
      const created = createProduct(payload);
      if (created) {
        router.push(`/admin/productos?created=1`);
      }
      return;
    }

    if (mode === "edit" && initial) {
      const updated = updateProduct({ id: initial.id, ...payload });
      if (updated) {
        router.push(`/admin/productos?updated=1`);
      }
      return;
    }
  };

  // Reusable Live Preview Card
  const renderLivePreviewContent = () => {
    const isDark = previewTheme === "dark";
    const displayTitle = watchedValues.name?.trim() || "Nombre del producto";
    const displayCategory = watchedValues.category || "Categoría";
    const displayBrand = watchedValues.brand?.trim() || "NovaBytex";
    const displayDesc = watchedValues.description?.trim() || "Descripción del producto...";
    const isOutOfStock = !activeInStock;

    if (previewViewMode === "detail") {
      return (
        <div
          className={cn(
            "rounded-2xl p-4 sm:p-5 border transition-colors",
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-900"
          )}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/20">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold",
                isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"
              )}
            >
              {displayCategory}
            </Badge>
            <div className="flex items-center gap-1.5">
              {activeFeatured && (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Destacado
                </span>
              )}
              {isOutOfStock ? (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Agotado
                </span>
              ) : (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  En Stock
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <h4 className="font-bold text-base sm:text-lg leading-snug line-clamp-2">
              {displayTitle}
            </h4>
            <p className={cn("text-xs leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
              {displayDesc}
            </p>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl sm:text-2xl font-black tabular-nums">
              S/ {activePrice.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
            {calculatedDiscount > 0 && (
              <>
                <span className="text-xs line-through text-slate-400 tabular-nums">
                  S/ {activePrevPrice.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold text-rose-500 px-1.5 py-0.5 rounded bg-rose-500/10">
                  -{calculatedDiscount}%
                </span>
              </>
            )}
          </div>

          {featuresList.length > 0 && (
            <div className="pt-3 border-t border-slate-200/20 space-y-1.5">
              <p className={cn("text-[11px] font-bold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
                Características:
              </p>
              <ul className="space-y-1">
                {featuresList.slice(0, 3).map((f, i) => (
                  <li key={i} className="text-xs flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="truncate">{f.text || "Característica de ejemplo"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // Default "Card" view identical to public catalog
    return (
      <div
        className={cn(
          "w-full rounded-2xl overflow-hidden border p-3 transition-all flex flex-col justify-between gap-3 shadow-sm",
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : activeType === "library"
            ? "bg-white border-library-beige/60 text-slate-900"
            : "bg-white border-slate-200 text-slate-900"
        )}
      >
        {/* Aspect square image container */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center p-3 select-none shrink-0 border border-slate-100">
          {activeImage ? (
            <img
              src={activeImage}
              alt={displayTitle}
              className="w-full h-full object-contain"
            />
          ) : (
            <ProductImage
              type={activeImageType}
              name={displayTitle}
              className="w-full h-full bg-transparent border-0"
            />
          )}

          {/* Discount badge top-left */}
          {calculatedDiscount > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <span className="h-5 px-1.5 rounded text-[10px] font-black tracking-wide bg-rose-600 text-white shadow-xs inline-flex items-center justify-center">
                -{calculatedDiscount}%
              </span>
            </div>
          )}

          {/* Stock / Offer Badges top-right */}
          <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
            {activeFeatured && (
              <span className="h-5 px-1.5 rounded text-[9.5px] font-bold bg-blue-600 text-white shadow-xs inline-flex items-center justify-center">
                Destacado
              </span>
            )}
            {isOutOfStock && (
              <span className="h-5 px-1.5 rounded text-[9.5px] font-bold bg-slate-900/80 text-rose-300 border border-rose-500/40 shadow-xs inline-flex items-center justify-center">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="px-1 space-y-1.5 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium w-fit",
                isDark ? "bg-blue-500/10 text-blue-300" : "bg-slate-100 text-slate-600"
              )}
            >
              {displayCategory} · {displayBrand}
            </span>

            <h4
              className={cn(
                "font-semibold text-sm leading-snug line-clamp-2 min-h-[38px] text-left",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {displayTitle}
            </h4>

            <p
              className={cn(
                "text-xs leading-relaxed line-clamp-2 text-left",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              {displayDesc}
            </p>
          </div>

          {/* Card Footer: Price + Button */}
          <div
            className={cn(
              "pt-2 mt-auto flex items-center justify-between gap-2 border-t",
              isDark ? "border-slate-800" : "border-slate-100"
            )}
          >
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-bold text-base sm:text-lg tracking-tight tabular-nums">
                S/ {activePrice.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
              {calculatedDiscount > 0 && (
                <span className="text-[11px] font-semibold text-slate-400 line-through tabular-nums">
                  S/ {activePrevPrice.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                isDark ? "bg-blue-600 text-white" : "bg-slate-900 text-white"
              )}
            >
              +
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="w-full relative flex flex-col pb-28 max-w-[1280px] mx-auto text-slate-900"
    >
      {/* Header bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link
              href="/admin/productos"
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Productos
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">
              {mode === "create" ? "Nuevo Producto" : "Editar Producto"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === "create" ? "Crear nuevo producto" : `Editar: ${initial?.name}`}
          </h1>
        </div>

        {/* Tablet Live Preview Toggle Button (768px - 1199px) */}
        <div className="hidden md:flex xl:hidden items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTabletPreviewOpen(!tabletPreviewOpen)}
            className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            {tabletPreviewOpen ? "Ocultar vista previa" : "Ver vista previa en vivo"}
          </Button>
        </div>
      </div>

      {/* Tablet Collapsible Preview Container (768px - 1199px) */}
      {tabletPreviewOpen && (
        <div className="hidden md:block xl:hidden mb-6 p-5 bg-slate-100 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Vista previa en vivo del producto
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewTheme(previewTheme === "dark" ? "light" : "dark")}
                className="h-7 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1"
              >
                {previewTheme === "dark" ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                {previewTheme === "dark" ? "Claro" : "Oscuro"}
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewMode(previewViewMode === "card" ? "detail" : "card")}
                className="h-7 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                {previewViewMode === "card" ? "Ver Detalle" : "Ver Tarjeta"}
              </button>
            </div>
          </div>
          <div className="max-w-xs mx-auto">
            {renderLivePreviewContent()}
          </div>
        </div>
      )}

      {/* Main Grid: Form 65% / Lateral 35% */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* FORM COLUMN (Left) */}
        <div className="space-y-4">
          {/* SECCIÓN 1: TIPO DE CATÁLOGO (Segmented Control) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                1. Tipo de catálogo
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Selecciona en qué sección de la tienda aparecerá el producto.
              </p>
            </div>

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => field.onChange("technology")}
                    className={cn(
                      "flex items-center justify-center gap-2 h-11 md:h-10 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      field.value === "technology"
                        ? "bg-white text-blue-700 shadow-xs border border-slate-200/80 ring-2 ring-blue-500/10"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Cpu className="w-4 h-4 text-blue-600" />
                    Tecnología
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("library")}
                    className={cn(
                      "flex items-center justify-center gap-2 h-11 md:h-10 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      field.value === "library"
                        ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80 ring-2 ring-emerald-500/10"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Librería
                  </button>
                </div>
              )}
            />
          </section>

          {/* SECCIÓN 2: INFORMACIÓN BÁSICA */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                2. Información básica
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Datos descriptivos principales para identificar el artículo en el catálogo.
              </p>
            </div>

            {/* Nombre del producto */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="field-name"
                  className="text-[13px] font-medium text-slate-700 flex items-center gap-1"
                >
                  Nombre del producto <span className="text-rose-500 font-bold">*</span>
                </label>
                <span
                  className={cn(
                    "text-[12px] tabular-nums",
                    (watchedValues.name?.length || 0) > 80 ? "text-amber-600 font-semibold" : "text-slate-400"
                  )}
                >
                  {watchedValues.name?.length || 0}/80
                </span>
              </div>
              <input
                id="field-name"
                {...register("name")}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Ej. Cuaderno Standford Cuadriculado 100 Hojas"
                className={cn(
                  "w-full bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 h-11 text-[16px] md:h-10 md:text-[14px] px-3.5",
                  errors.name ? "border-rose-400 ring-2 ring-rose-500/10" : "border-slate-200"
                )}
              />
              {errors.name && (
                <p id="name-error" className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Marca y SKU (Pares en grid responsive) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Marca */}
              <div>
                <label
                  htmlFor="field-brand"
                  className="block text-[13px] font-medium text-slate-700 mb-1.5"
                >
                  Marca / Editorial <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  id="field-brand"
                  {...register("brand")}
                  aria-describedby={errors.brand ? "brand-error" : undefined}
                  placeholder="Ej. Standford, Cisco, Artesco..."
                  className={cn(
                    "w-full bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 h-11 text-[16px] md:h-10 md:text-[14px] px-3.5",
                    errors.brand ? "border-rose-400" : "border-slate-200"
                  )}
                />
                {errors.brand && (
                  <p id="brand-error" className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.brand.message}
                  </p>
                )}
              </div>

              {/* SKU con botón Autogenerar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="field-sku"
                    className="text-[13px] font-medium text-slate-700"
                  >
                    SKU (Código) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Autogenerar
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="field-sku"
                    {...register("sku")}
                    aria-describedby={errors.sku ? "sku-error" : undefined}
                    placeholder="Ej. NB-STD-100H"
                    className={cn(
                      "flex-1 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 h-11 text-[16px] md:h-10 md:text-[14px] px-3.5",
                      errors.sku ? "border-rose-400" : "border-slate-200"
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSku}
                    className="h-11 md:h-10 px-3 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
                  >
                    Generar
                  </Button>
                </div>
                {errors.sku && (
                  <p id="sku-error" className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            {/* Categoría y Garantía */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Categoría */}
              <div>
                <label
                  htmlFor="field-category"
                  className="block text-[13px] font-medium text-slate-700 mb-1.5"
                >
                  Categoría <span className="text-rose-500 font-bold">*</span>
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="field-category"
                        className="w-full bg-white border-slate-200 rounded-lg h-11 text-[16px] md:h-10 md:text-[14px] px-3.5 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20"
                      >
                        <SelectValue placeholder="Selecciona una categoría" />
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
                {errors.category && (
                  <p className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.category.message}
                  </p>
                )}
              </div>

              {/* Garantía */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="field-warranty"
                    className="text-[13px] font-medium text-slate-700"
                  >
                    Garantía
                  </label>
                  <span className="text-[12px] text-slate-500">Opcional</span>
                </div>
                <input
                  id="field-warranty"
                  {...register("warranty")}
                  placeholder="Ej. 6 meses, 1 año..."
                  className="w-full bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 h-11 text-[16px] md:h-10 md:text-[14px] px-3.5"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="field-desc"
                  className="text-[13px] font-medium text-slate-700 flex items-center gap-1"
                >
                  Descripción <span className="text-rose-500 font-bold">*</span>
                </label>
                <span
                  className={cn(
                    "text-[12px] tabular-nums",
                    (watchedValues.description?.length || 0) > 500 ? "text-rose-600 font-semibold" : "text-slate-400"
                  )}
                >
                  {watchedValues.description?.length || 0}/500
                </span>
              </div>
              <textarea
                id="field-desc"
                {...register("description")}
                rows={3}
                aria-describedby={errors.description ? "desc-error" : undefined}
                placeholder="Breve reseña del producto, aplicaciones y ventajas principales..."
                className={cn(
                  "w-full bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 min-h-[96px] p-3 text-[14px]",
                  errors.description ? "border-rose-400" : "border-slate-200"
                )}
              />
              {errors.description && (
                <p id="desc-error" className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.description.message}
                </p>
              )}
            </div>
          </section>

          {/* SECCIÓN 3: PRECIO E INVENTARIO */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                3. Precio e inventario
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Establece el precio en Soles (S/), descuentos y disponibilidad del stock.
              </p>
            </div>

            {/* Precios (Grid apilado en mobile <768px, horizontal en >=768px) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Precio Principal */}
              <div>
                <label
                  htmlFor="field-price"
                  className="block text-[13px] font-medium text-slate-700 mb-1.5"
                >
                  Precio (S/) <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-500 select-none pointer-events-none">
                    S/
                  </span>
                  <input
                    id="field-price"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    {...register("price")}
                    aria-describedby={errors.price ? "price-error" : undefined}
                    placeholder="0.00"
                    className={cn(
                      "w-full bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 h-11 text-[16px] md:h-10 md:text-[14px] pl-9 pr-3.5 text-left tabular-nums",
                      errors.price ? "border-rose-400" : "border-slate-200"
                    )}
                  />
                </div>
                {errors.price && (
                  <p id="price-error" className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.price.message}
                  </p>
                )}
              </div>

              {/* Precio Anterior / Oferta */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="field-prev-price"
                    className="text-[13px] font-medium text-slate-700"
                  >
                    Precio anterior (S/)
                  </label>
                  <span className="text-[12px] text-slate-500">Opcional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-500 select-none pointer-events-none">
                    S/
                  </span>
                  <input
                    id="field-prev-price"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    {...register("previousPrice")}
                    aria-describedby={errors.previousPrice ? "prev-price-error" : undefined}
                    placeholder="Precio tachado..."
                    className={cn(
                      "w-full bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 h-11 text-[16px] md:h-10 md:text-[14px] pl-9 pr-3.5 text-left tabular-nums",
                      errors.previousPrice ? "border-rose-400" : "border-slate-200"
                    )}
                  />
                </div>
                {calculatedDiscount > 0 && (
                  <p className="text-[12px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ahorro calculado: -{calculatedDiscount}% de descuento
                  </p>
                )}
                {errors.previousPrice && (
                  <p id="prev-price-error" className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.previousPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Stock Switch & Chips: Destacado / Oferta */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* En Stock Toggle */}
              <div className="flex items-center gap-3">
                <Controller
                  name="inStock"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="field-stock"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  )}
                />
                <label
                  htmlFor="field-stock"
                  className="text-[13px] font-semibold text-slate-800 cursor-pointer select-none"
                >
                  {activeInStock ? "En Stock (Disponible)" : "Agotado (Sin Stock)"}
                </label>
              </div>

              {/* Chips Interactivos: Destacado / Oferta */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setValue("featured", !activeFeatured, { shouldDirty: true })
                  }
                  className={cn(
                    "h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer",
                    activeFeatured
                      ? "bg-blue-50 border-blue-500 text-blue-800 shadow-xs ring-1 ring-blue-500"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Destacado
                  {activeFeatured && <Check className="w-3 h-3 text-blue-600 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !isOfferActive;
                    setIsOfferActive(next);
                    if (next && (!activePrevPrice || activePrevPrice <= activePrice)) {
                      // Proponer precio anterior calculado con 15% de aumento
                      const suggested = Number((activePrice > 0 ? activePrice * 1.2 : 50).toFixed(2));
                      setValue("previousPrice", suggested, { shouldDirty: true, shouldValidate: true });
                    } else if (!next) {
                      setValue("previousPrice", undefined, { shouldDirty: true });
                    }
                  }}
                  className={cn(
                    "h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer",
                    calculatedDiscount > 0 || isOfferActive
                      ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-1 ring-rose-500"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Tag className="w-3.5 h-3.5 text-rose-600" />
                  Oferta {calculatedDiscount > 0 ? `(-${calculatedDiscount}%)` : ""}
                  {(calculatedDiscount > 0 || isOfferActive) && <Check className="w-3 h-3 text-rose-600 ml-0.5" />}
                </button>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: ESPECIFICACIONES TÉCNICAS (Colapsable, cerrada por defecto) */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-all">
            <button
              type="button"
              onClick={() => setSpecsOpen(!specsOpen)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-slate-900">
                    4. Especificaciones técnicas
                  </h2>
                  <span className="text-[12px] text-slate-500 font-normal">
                    (Opcional)
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {featuresList.length} características · {specsList.length} datos de ficha técnica
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                {specsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {specsOpen && (
              <div className="p-6 pt-0 border-t border-slate-100 space-y-6 mt-2">
                {/* Lista Dinámica 1: Características (Viñetas) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-800">
                        Características principales (Viñetas)
                      </h3>
                      <p className="text-[12px] text-slate-500">
                        Una línea por cada ventaja destacada del producto.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddFeature}
                      className="h-8 px-2.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" /> Añadir
                    </Button>
                  </div>

                  {featuresList.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No hay características añadidas aún. Haz clic en «+ Añadir».
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {featuresList.map((f, index) => (
                        <div key={f.id} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 w-5 text-right select-none">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={f.text}
                            onChange={(e) => handleUpdateFeature(f.id, e.target.value)}
                            placeholder="Ej. 100 hojas cuadriculadas con papel de 75g"
                            className="flex-1 bg-white border border-slate-200 rounded-lg h-9 px-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(f.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar viñeta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista Dinámica 2: Ficha Técnica (Clave / Valor) */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-800">
                        Ficha técnica (Propiedad : Valor)
                      </h3>
                      <p className="text-[12px] text-slate-500">
                        Datos técnicos precisos (ej. Material: Cartón plastificado, Dimensiones: A4).
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSpec}
                      className="h-8 px-2.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" /> Añadir
                    </Button>
                  </div>

                  {specsList.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No hay especificaciones en la ficha técnica. Haz clic en «+ Añadir».
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {specsList.map((s, index) => (
                        <div key={s.id} className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
                          <input
                            type="text"
                            value={s.key}
                            onChange={(e) => handleUpdateSpec(s.id, "key", e.target.value)}
                            placeholder="Propiedad (ej: Material)"
                            className="bg-white border border-slate-200 rounded-lg h-9 px-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                          <input
                            type="text"
                            value={s.value}
                            onChange={(e) => handleUpdateSpec(s.id, "value", e.target.value)}
                            placeholder="Valor (ej: Plastificado A4)"
                            className="bg-white border border-slate-200 rounded-lg h-9 px-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(s.id)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar especificación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR COLUMN (Right, sticky at top 24px on desktop) */}
        <div className="space-y-4 xl:sticky xl:top-[24px]">
          {/* 1. VISTA PREVIA EN VIVO (Arriba) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" /> Vista previa en vivo
              </span>
              <div className="flex items-center gap-1.5">
                {/* Theme Toggle (Dark / Light) */}
                <button
                  type="button"
                  onClick={() => setPreviewTheme(previewTheme === "dark" ? "light" : "dark")}
                  title={`Cambiar a modo ${previewTheme === "dark" ? "claro" : "oscuro"}`}
                  className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {previewTheme === "dark" ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </button>

                {/* View Mode Toggle (Card / Detail) */}
                <button
                  type="button"
                  onClick={() => setPreviewViewMode(previewViewMode === "card" ? "detail" : "card")}
                  className="h-7 px-2 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {previewViewMode === "card" ? "Tarjeta" : "Detalle"}
                </button>
              </div>
            </div>

            <div className="pt-1">
              {renderLivePreviewContent()}
            </div>
          </div>

          {/* 2. IMAGEN PRINCIPAL (Dropzone accesible) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-slate-900">
                Imagen principal
              </label>
              <span className="text-[12px] text-slate-500">Opcional</span>
            </div>

            {/* Input nativo oculto */}
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleMainImageFile}
            />

            {activeImage ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 group">
                  <img
                    src={activeImage}
                    alt="Imagen previa"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("image", "", { shouldDirty: true })}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-xs"
                    title="Quitar imagen"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mainImageInputRef.current?.click()}
                  className="w-full h-9 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cambiar imagen
                </Button>
              </div>
            ) : (
              <div
                onClick={() => mainImageInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition-all space-y-2.5"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Arrastra tu imagen aquí
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG o WEBP (máx 5 MB)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Seleccionar imagen
                </Button>
              </div>
            )}

            {/* Select "Ilustración por defecto" SOLO si NO hay imagen subida */}
            {!activeImage && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[12px] font-medium text-slate-600 mb-1">
                  O ilustración gráfica por defecto:
                </label>
                <Controller
                  name="imageType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-white border-slate-200 rounded-lg h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {imageTypesForType.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-xs">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>

          {/* 3. GALERÍA DE FOTOS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900">
                  Galería de fotos
                </h3>
                <p className="text-[11px] text-slate-400">Ángulos y empaque.</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold whitespace-nowrap">
                {galleryList.length} {galleryList.length === 1 ? "foto" : "fotos"}
              </Badge>
            </div>

            {/* Input file de galería oculto */}
            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleGalleryFileUpload}
            />

            {/* Control único: Subir fotos */}
            <Button
              type="button"
              variant="outline"
              onClick={() => galleryFileInputRef.current?.click()}
              className="w-full h-9 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Subir fotos secundarias
            </Button>

            {/* Enlace para añadir por URL */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowGalleryUrlBox(!showGalleryUrlBox)}
                className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
              >
                {showGalleryUrlBox ? "Ocultar ingreso por URL" : "+ Añadir por URL directa"}
              </button>
            </div>

            {/* Caja de texto URL desplegable */}
            {showGalleryUrlBox && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-white border border-slate-200 rounded-lg h-8 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddGalleryUrl}
                  disabled={!galleryUrlInput.trim()}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Agregar
                </Button>
              </div>
            )}

            {/* Miniaturas de 56px */}
            {galleryList.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                {galleryList.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white group p-0.5 flex items-center justify-center shrink-0"
                  >
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {/* Botón eliminar */}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryItem(idx)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                    {/* Controles de reordenar */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 flex items-center justify-around opacity-0 group-hover:opacity-100 transition-opacity">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveGalleryItem(idx, "up")}
                          className="text-white hover:text-blue-300 p-0.5"
                          title="Mover a la izquierda"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {idx < galleryList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveGalleryItem(idx, "down")}
                          className="text-white hover:text-blue-300 p-0.5"
                          title="Mover a la derecha"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. VISIBILIDAD EN TIENDA */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-slate-900">
                Visible en tienda
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeAvailable ? "Los clientes pueden ver este producto." : "Oculto al público en tienda."}
              </p>
            </div>
            <Controller
              name="available"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-emerald-600 scale-90"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING BUTTON FOR PREVIEW (<768px) */}
      <div className="xl:hidden fixed bottom-20 right-4 z-30">
        <Button
          type="button"
          onClick={() => setMobilePreviewOpen(true)}
          className="h-11 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 text-xs font-bold active:scale-95 transition-transform"
        >
          <Eye className="w-4 h-4" />
          Vista previa en vivo
        </Button>
      </div>

      {/* MOBILE PREVIEW DIALOG (<768px) */}
      <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DialogContent className="max-w-sm p-4 rounded-2xl bg-white border-slate-200">
          <DialogHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" /> Vista previa en vivo
            </DialogTitle>
            <div className="flex items-center gap-1.5 mr-6">
              <button
                type="button"
                onClick={() => setPreviewTheme(previewTheme === "dark" ? "light" : "dark")}
                className="h-7 px-2 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1"
              >
                {previewTheme === "dark" ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                {previewTheme === "dark" ? "Claro" : "Oscuro"}
              </button>
            </div>
          </DialogHeader>
          <div className="py-2">
            {renderLivePreviewContent()}
          </div>
        </DialogContent>
      </Dialog>

      {/* BARRA STICKY INFERIOR DE ACCIONES */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-[64px] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </Link>
          {isDirty && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Cambios sin guardar
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Guardar Borrador (available: false) */}
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => onSubmit(data, false))}
            className="h-10 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            Guardar borrador
          </Button>

          {/* Publicar Producto (available: true) */}
          <Button
            type="button"
            disabled={isSubmitting || !isValid}
            onClick={handleSubmit((data) => onSubmit(data, true))}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {mode === "create" ? "Publicar producto" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
