"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  X,
  Trash2,
  Layers,
  Cpu,
  BookOpen,
  ArrowRight,
  Search,
  Sparkles,
  RefreshCw,
  Edit2,
  Check,
  ExternalLink,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  downloadExcelTemplate,
  exportProductsToExcel,
  parseExcelProducts,
  exportValidationReportToExcel,
  type ParsedRowResult,
  type ValidatedRow,
  type DuplicateAction,
  type ExcelValidationResult,
} from "@/lib/excelHelper";
import {
  toTitleCase,
  calculateSimilarity,
} from "@/lib/excelValidator";
import type { CreateProductInput } from "@/services/ProductService";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

interface ExcelManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "import" | "export";
}

type FilterStatus = "ALL" | "ERROR" | "DUPLICADO" | "AVISO" | "OK";

export function ExcelManagerModal({
  open,
  onOpenChange,
  defaultTab = "import",
}: ExcelManagerModalProps) {
  const { products, importBatch } = useCatalog();
  const [activeTab, setActiveTab] = useState<"import" | "export">(defaultTab);

  // Import states
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importCatalogType, setImportCatalogType] = useState<"library" | "technology">("library");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enriched Validation & Review State
  const [validationResult, setValidationResult] = useState<ExcelValidationResult | null>(null);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDuplicateRow, setSelectedDuplicateRow] = useState<ValidatedRow | null>(null);
  const [editingRowNumber, setEditingRowNumber] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CreateProductInput>>({});
  const [isImporting, setIsImporting] = useState(false);

  // Export states
  const [exportFilter, setExportFilter] = useState<"all" | "technology" | "library">("all");

  const handleFileChange = async (selectedFile: File, catalogType = importCatalogType) => {
    if (!selectedFile) return;

    // Validación de peso máximo 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("El archivo excede el tamaño máximo permitido de 10 MB.");
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    try {
      const res = await parseExcelProducts(selectedFile, catalogType, products);
      setValidationResult(res.validation);
      setRows(res.validation.rows || []);
      setFilterStatus("ALL");
      setSearchQuery("");
      setEditingRowNumber(null);
      setSelectedDuplicateRow(null);
    } catch {
      setValidationResult(null);
      setRows([]);
    } finally {
      setParsing(false);
    }
  };

  const handleCatalogTypeChange = (newType: "library" | "technology") => {
    setImportCatalogType(newType);
    if (file) {
      handleFileChange(file, newType);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      handleFileChange(dropped);
    }
  };

  const clearFile = () => {
    setFile(null);
    setValidationResult(null);
    setRows([]);
    setEditingRowNumber(null);
    setSelectedDuplicateRow(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filtrado de filas para la tabla de revisión
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const p = r.product;
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, filterStatus, searchQuery]);

  // Contadores dinámicos calculados del estado local
  const counts = useMemo(() => {
    return {
      total: rows.length,
      ok: rows.filter((r) => r.status === "OK").length,
      warning: rows.filter((r) => r.status === "AVISO").length,
      error: rows.filter((r) => r.status === "ERROR").length,
      duplicate: rows.filter((r) => r.status === "DUPLICADO").length,
    };
  }, [rows]);

  // Acción: Corregir todos los avisos automáticos
  const handleFixAllAutoWarnings = () => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.status !== "AVISO") return row;
        let p = { ...row.product };
        const remainingIssues = row.issues.filter((issue) => {
          if (issue.isAutoFixable && issue.suggestedFix !== undefined) {
            if (issue.field === "name") p.name = String(issue.suggestedFix);
            if (issue.field === "price") p.price = Number(issue.suggestedFix);
            if (issue.field === "category") p.category = String(issue.suggestedFix);
            if (issue.field === "brand") p.brand = String(issue.suggestedFix);
            return false; // problema resuelto
          }
          return true;
        });

        const newStatus =
          remainingIssues.length === 0
            ? "OK"
            : remainingIssues.some((i) => i.severity === "ERROR")
            ? "ERROR"
            : remainingIssues.some((i) => i.severity === "DUPLICADO")
            ? "DUPLICADO"
            : "AVISO";

        return {
          ...row,
          product: p,
          issues: remainingIssues,
          status: newStatus,
        };
      })
    );
  };

  // Acción: Asignar decisión a un duplicado específico
  const handleSetDuplicateAction = (rowNumber: number, action: DuplicateAction) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowNumber !== rowNumber || !r.duplicate) return r;
        return {
          ...r,
          duplicate: {
            ...r.duplicate,
            action,
          },
        };
      })
    );
    setSelectedDuplicateRow(null);
  };

  // Acción: Aplicar regla en bloque a todos los duplicados
  const handleApplyGlobalDuplicateAction = (action: DuplicateAction) => {
    setRows((prev) =>
      prev.map((r) => {
        if (!r.duplicate) return r;
        return {
          ...r,
          duplicate: {
            ...r.duplicate,
            action,
          },
        };
      })
    );
  };

  // Iniciar edición de una fila
  const handleStartEditRow = (row: ValidatedRow) => {
    setEditingRowNumber(row.rowNumber);
    setEditFormData({ ...row.product });
  };

  // Guardar edición de una fila
  const handleSaveRowEdit = (rowNumber: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowNumber !== rowNumber) return r;
        const updatedProduct: CreateProductInput = {
          ...r.product,
          ...editFormData,
          price: Number(editFormData.price) || 0,
        };

        // Revalidar errores básicos
        const remainingIssues = r.issues.filter(
          (i) => i.code !== "NAME_EMPTY" && i.code !== "PRC_ZERO"
        );
        if (!updatedProduct.name.trim()) {
          remainingIssues.push({
            id: `NAME_EMPTY-r${rowNumber}`,
            code: "NAME_EMPTY",
            severity: "ERROR",
            row: rowNumber,
            column: "Nombre",
            field: "name",
            rawValue: updatedProduct.name,
            message: "El nombre es obligatorio.",
          });
        }
        if (updatedProduct.price <= 0) {
          remainingIssues.push({
            id: `PRC_ZERO-r${rowNumber}`,
            code: "PRC_ZERO",
            severity: "ERROR",
            row: rowNumber,
            column: "Precio",
            field: "price",
            rawValue: updatedProduct.price,
            message: "El precio debe ser mayor a 0.",
          });
        }

        const newStatus =
          remainingIssues.some((i) => i.severity === "ERROR")
            ? "ERROR"
            : r.duplicate
            ? "DUPLICADO"
            : remainingIssues.length > 0
            ? "AVISO"
            : "OK";

        return {
          ...r,
          product: updatedProduct,
          issues: remainingIssues,
          status: newStatus,
        };
      })
    );
    setEditingRowNumber(null);
  };

  // Eliminar fila
  const handleDeleteRow = (rowNumber: number) => {
    setRows((prev) => prev.filter((r) => r.rowNumber !== rowNumber));
  };

  // Descargar reporte de errores Excel
  const handleDownloadErrorReport = () => {
    if (!validationResult) return;
    exportValidationReportToExcel({
      ...validationResult,
      rows,
    });
  };

  // Ejecución final de importación
  const handleConfirmBatchImport = async () => {
    if (counts.error > 0) {
      if (
        !confirm(
          `Existen ${counts.error} filas con errores bloqueantes que serán omitidas. ¿Deseas continuar e importar solo las filas válidas?`
        )
      ) {
        return;
      }
    }

    setIsImporting(true);
    try {
      importBatch(rows);
      clearFile();
      onOpenChange(false);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    let toExport = products;
    let fileName = "catalogo_novabytex.xlsx";
    if (exportFilter === "technology") {
      toExport = products.filter((p) => p.type === "technology");
      fileName = "catalogo_tecnologia_novabytex.xlsx";
    } else if (exportFilter === "library") {
      toExport = products.filter((p) => p.type === "library");
      fileName = "catalogo_libreria_novabytex.xlsx";
    }
    exportProductsToExcel(toExport, fileName);
  };

  const exportCount =
    exportFilter === "all"
      ? products.length
      : products.filter((p) => p.type === exportFilter).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[94vh] p-0 overflow-hidden rounded-[24px] border-slate-200 flex flex-col bg-white">
        <DialogHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-bodoni text-xl text-slate-900 tracking-tight">
                  Gestor de Importación y Validación Excel
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Carga masiva, auditoría inteligente de datos, prevención de duplicados y catálogo NovaBytex
                </DialogDescription>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "import" | "export")}
              className="w-auto"
            >
              <TabsList className="h-9 rounded-lg bg-slate-200/70 p-0.5">
                <TabsTrigger
                  value="import"
                  className="rounded-md text-xs font-semibold px-3 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Importar
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="rounded-md text-xs font-semibold px-3 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Exportar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* TAB: IMPORT */}
        {activeTab === "import" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!file ? (
              <div className="space-y-4 max-w-2xl mx-auto py-4">
                {/* Selector de Catálogo de Destino */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      ¿A qué catálogo pertenecen estos productos?
                    </label>
                    <span className="text-[11px] text-slate-400">
                      (No necesitas la columna &quot;Tipo&quot; en tu Excel)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleCatalogTypeChange("library")}
                      className={cn(
                        "flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        importCatalogType === "library"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      Catálogo de Librería
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCatalogTypeChange("technology")}
                      className={cn(
                        "flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        importCatalogType === "technology"
                          ? "bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Cpu className="w-4 h-4 text-blue-600" />
                      Catálogo de Tecnología
                    </button>
                  </div>
                </div>

                {/* Template Card */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-950">
                        Descargar plantilla modelo ({importCatalogType === "library" ? "Librería" : "Tecnología"})
                      </p>
                      <p className="text-[11px] text-blue-800/80 leading-snug">
                        Encabezados 100% compatibles y con ejemplos de prueba listos.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadExcelTemplate(importCatalogType)}
                    className="h-8 px-3 rounded-lg border-blue-200 bg-white text-blue-700 hover:bg-blue-50 text-xs font-semibold shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Plantilla Modelo
                  </Button>
                </div>

                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                      : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50/70"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileChange(f);
                    }}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Haz clic para seleccionar o arrastra tu archivo aquí
                    </p>
                    <p className="text-xs text-slate-400">
                      Soporta .xlsx, .xls o .csv (hasta 1,500 productos por lote)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Header Bar */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB · Hoja: &quot;
                        {validationResult?.summary.sheetName || "Principal"}&quot; ·{" "}
                        {counts.total} filas leídas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {counts.error > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadErrorReport}
                        className="h-8 px-2.5 rounded-lg border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Descargar Reporte Errores
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      className="h-8 px-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Cambiar archivo
                    </Button>
                  </div>
                </div>

                {parsing ? (
                  <div className="p-12 text-center text-xs text-slate-500 space-y-2 animate-pulse">
                    <RefreshCw className="w-6 h-6 mx-auto text-emerald-600 animate-spin" />
                    <p>Ejecutando auditoría de datos, detección de duplicados y reglas de negocio...</p>
                  </div>
                ) : (
                  <>
                    {/* Auditoría Superior: Contadores y Filtros */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                      {/* Píldoras de Filtro */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFilterStatus("ALL")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                            filterStatus === "ALL"
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          Todos ({counts.total})
                        </button>

                        <button
                          type="button"
                          onClick={() => setFilterStatus("OK")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                            filterStatus === "OK"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                          )}
                        >
                          <Check className="w-3 h-3 inline mr-1" />
                          Válidos ({counts.ok})
                        </button>

                        {counts.warning > 0 && (
                          <button
                            type="button"
                            onClick={() => setFilterStatus("AVISO")}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                              filterStatus === "AVISO"
                                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                            )}
                          >
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Avisos ({counts.warning})
                          </button>
                        )}

                        {counts.duplicate > 0 && (
                          <button
                            type="button"
                            onClick={() => setFilterStatus("DUPLICADO")}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                              filterStatus === "DUPLICADO"
                                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                : "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
                            )}
                          >
                            <GitCompare className="w-3 h-3 inline mr-1" />
                            Duplicados ({counts.duplicate})
                          </button>
                        )}

                        {counts.error > 0 && (
                          <button
                            type="button"
                            onClick={() => setFilterStatus("ERROR")}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                              filterStatus === "ERROR"
                                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                : "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100"
                            )}
                          >
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Errores ({counts.error})
                          </button>
                        )}
                      </div>

                      {/* Herramientas de corrección en bloque y búsqueda */}
                      <div className="flex items-center gap-2">
                        {counts.warning > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFixAllAutoWarnings}
                            className="h-8 px-2.5 rounded-lg border-amber-300 bg-amber-50/80 text-amber-900 hover:bg-amber-100 text-xs font-bold"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Corregir avisos automáticos
                          </Button>
                        )}

                        {counts.duplicate > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyGlobalDuplicateAction("update_price_stock")}
                            className="h-8 px-2.5 rounded-lg border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100 text-xs font-bold"
                            title="Para todos los duplicados: actualizar precio y stock, manteniendo el resto intacto"
                          >
                            <GitCompare className="w-3.5 h-3.5 mr-1 text-purple-600" />
                            Duplicados: Solo precio/stock
                          </Button>
                        )}

                        <div className="relative w-44">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                          <Input
                            placeholder="Buscar en lote..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 pr-2 text-xs bg-slate-50 border-slate-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tabla de Revisión Interactiva */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-xs">
                          <tr>
                            <th className="p-2.5 w-12 font-bold text-center">Fila</th>
                            <th className="p-2.5 w-24 font-bold">Estado</th>
                            <th className="p-2.5 font-bold">Producto</th>
                            <th className="p-2.5 w-28 font-bold">Categoría</th>
                            <th className="p-2.5 w-24 font-bold">Marca</th>
                            <th className="p-2.5 w-24 font-bold">SKU</th>
                            <th className="p-2.5 w-24 font-bold text-right">Precio</th>
                            <th className="p-2.5 w-24 font-bold text-center">Stock</th>
                            <th className="p-2.5 w-20 font-bold text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredRows.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                                No hay filas que coincidan con el filtro seleccionado.
                              </td>
                            </tr>
                          ) : (
                            filteredRows.map((row) => {
                              const isEditing = editingRowNumber === row.rowNumber;
                              const isDup = row.status === "DUPLICADO" && row.duplicate;

                              return (
                                <tr
                                  key={row.rowNumber}
                                  className={cn(
                                    "transition-colors",
                                    row.status === "ERROR"
                                      ? "bg-rose-50/40 hover:bg-rose-50/70"
                                      : row.status === "DUPLICADO"
                                      ? "bg-purple-50/40 hover:bg-purple-50/70"
                                      : row.status === "AVISO"
                                      ? "bg-amber-50/30 hover:bg-amber-50/60"
                                      : "hover:bg-slate-50/80"
                                  )}
                                >
                                  {/* Fila # */}
                                  <td className="p-2.5 text-center font-mono text-[11px] text-slate-400">
                                    {row.rowNumber}
                                  </td>

                                  {/* Estado Badge */}
                                  <td className="p-2.5">
                                    {row.status === "OK" && (
                                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold px-1.5 py-0.5">
                                        Listo
                                      </Badge>
                                    )}
                                    {row.status === "AVISO" && (
                                      <div title={row.issues.map((i) => i.message).join("\n")}>
                                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-1 cursor-help">
                                          <AlertTriangle className="w-3 h-3" />
                                          Aviso ({row.issues.length})
                                        </Badge>
                                      </div>
                                    )}
                                    {row.status === "DUPLICADO" && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedDuplicateRow(row)}
                                        className="cursor-pointer"
                                        title="Hacer clic para abrir panel de resolución lado a lado"
                                      >
                                        <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-1 hover:bg-purple-200">
                                          <GitCompare className="w-3 h-3 text-purple-700" />
                                          {row.duplicate?.action === "skip"
                                            ? "Omitir"
                                            : row.duplicate?.action === "update_price_stock"
                                            ? "Actualizar S/"
                                            : row.duplicate?.action === "update_all"
                                            ? "Actualizar"
                                            : "Duplicado"}
                                        </Badge>
                                      </button>
                                    )}
                                    {row.status === "ERROR" && (
                                      <div title={row.issues.map((i) => i.message).join("\n")}>
                                        <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-1 cursor-help">
                                          <AlertCircle className="w-3 h-3 text-rose-600" />
                                          Error ({row.issues.length})
                                        </Badge>
                                      </div>
                                    )}
                                  </td>

                                  {/* Nombre */}
                                  <td className="p-2.5 font-medium text-slate-900 max-w-[240px]">
                                    {isEditing ? (
                                      <Input
                                        value={editFormData.name ?? ""}
                                        onChange={(e) =>
                                          setEditFormData({ ...editFormData, name: e.target.value })
                                        }
                                        className="h-7 text-xs bg-white"
                                      />
                                    ) : (
                                      <div>
                                        <p className="truncate font-semibold">{row.product.name}</p>
                                        {row.issues.length > 0 && (
                                          <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                                            {row.issues[0].message}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Categoría */}
                                  <td className="p-2.5 text-slate-600 truncate max-w-[130px]">
                                    {isEditing ? (
                                      <Input
                                        value={editFormData.category ?? ""}
                                        onChange={(e) =>
                                          setEditFormData({ ...editFormData, category: e.target.value })
                                        }
                                        className="h-7 text-xs bg-white"
                                      />
                                    ) : (
                                      row.product.category
                                    )}
                                  </td>

                                  {/* Marca */}
                                  <td className="p-2.5 text-slate-600 truncate max-w-[110px]">
                                    {isEditing ? (
                                      <Input
                                        value={editFormData.brand ?? ""}
                                        onChange={(e) =>
                                          setEditFormData({ ...editFormData, brand: e.target.value })
                                        }
                                        className="h-7 text-xs bg-white"
                                      />
                                    ) : (
                                      row.product.brand
                                    )}
                                  </td>

                                  {/* SKU */}
                                  <td className="p-2.5 font-mono text-[11px] text-slate-500 truncate max-w-[110px]">
                                    {row.product.sku}
                                  </td>

                                  {/* Precio */}
                                  <td className="p-2.5 text-right font-bold text-slate-900">
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        step="0.10"
                                        value={editFormData.price ?? 0}
                                        onChange={(e) =>
                                          setEditFormData({ ...editFormData, price: Number(e.target.value) })
                                        }
                                        className="h-7 text-xs text-right w-20 ml-auto bg-white"
                                      />
                                    ) : (
                                      <span>S/ {row.product.price.toFixed(2)}</span>
                                    )}
                                  </td>

                                  {/* Stock */}
                                  <td className="p-2.5 text-center">
                                    {row.product.inStock ? (
                                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="En Stock" />
                                    ) : (
                                      <span className="inline-block w-2 h-2 rounded-full bg-slate-300" title="Agotado" />
                                    )}
                                  </td>

                                  {/* Acciones */}
                                  <td className="p-2.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {isEditing ? (
                                        <button
                                          type="button"
                                          onClick={() => handleSaveRowEdit(row.rowNumber)}
                                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                                          title="Guardar cambios"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditRow(row)}
                                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                          title="Editar fila"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {isDup && (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedDuplicateRow(row)}
                                          className="p-1 rounded text-purple-600 hover:bg-purple-100"
                                          title="Resolver duplicado lado a lado"
                                        >
                                          <GitCompare className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRow(row.rowNumber)}
                                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        title="Eliminar fila del lote"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Resumen Final y Botones de Importación */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100 bg-white">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <p>
                          <strong>Resumen:</strong> {counts.ok + counts.warning} válidos para crear/actualizar
                          {counts.duplicate > 0 && ` · ${counts.duplicate} duplicados resueltos`}
                          {counts.error > 0 && ` · ${counts.error} errores bloqueantes`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={clearFile}
                          className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold"
                        >
                          Cancelar
                        </Button>

                        <Button
                          onClick={handleConfirmBatchImport}
                          disabled={isImporting || rows.length === 0}
                          className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                        >
                          {isImporting ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                              Importando lote...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Confirmar e Importar ({counts.ok + counts.warning} Productos)
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: EXPORT */}
        {activeTab === "export" && (
          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Selecciona qué catálogo deseas exportar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFilter("all")}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all cursor-pointer",
                    exportFilter === "all"
                      ? "border-slate-900 bg-slate-900 text-white shadow-md"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  )}
                >
                  <Layers className="w-5 h-5 mb-2 opacity-80" />
                  <p className="text-sm font-bold">Todo el Catálogo</p>
                  <p className={cn("text-xs mt-0.5", exportFilter === "all" ? "text-slate-300" : "text-slate-500")}>
                    {products.length} productos
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFilter("technology")}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all cursor-pointer",
                    exportFilter === "technology"
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  )}
                >
                  <Cpu className="w-5 h-5 mb-2 opacity-80" />
                  <p className="text-sm font-bold">Tecnología TI</p>
                  <p className={cn("text-xs mt-0.5", exportFilter === "technology" ? "text-blue-100" : "text-slate-500")}>
                    {products.filter((p) => p.type === "technology").length} productos
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFilter("library")}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all cursor-pointer",
                    exportFilter === "library"
                      ? "border-emerald-700 bg-emerald-700 text-white shadow-md"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  )}
                >
                  <BookOpen className="w-5 h-5 mb-2 opacity-80" />
                  <p className="text-sm font-bold">Librería &amp; Papelería</p>
                  <p className={cn("text-xs mt-0.5", exportFilter === "library" ? "text-emerald-100" : "text-slate-500")}>
                    {products.filter((p) => p.type === "library").length} productos
                  </p>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Resumen de exportación
                </p>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Se generará una hoja Excel (.xlsx) con {exportCount} productos y todas sus columnas oficiales.
                </p>
              </div>
              <Button
                onClick={handleExport}
                className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Excel ({exportCount})
              </Button>
            </div>
          </div>
        )}

        {/* MODAL / PANEL DE COMPARACIÓN LADO A LADO PARA DUPLICADOS (REQUERIMIENTO A) */}
        {selectedDuplicateRow && selectedDuplicateRow.duplicate && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Resolución de Duplicado (Fila {selectedDuplicateRow.rowNumber})
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedDuplicateRow.duplicate.collisionType === "store_exact" && (
                        <span>Coincidencia exacta de nombre con un producto existente en tienda.</span>
                      )}
                      {selectedDuplicateRow.duplicate.collisionType === "store_fuzzy" && (
                        <span>
                          Similitud alta ({selectedDuplicateRow.duplicate.similarityPercent}%) con un producto de la tienda.
                        </span>
                      )}
                      {selectedDuplicateRow.duplicate.collisionType === "internal_exact" && (
                        <span>
                          Duplicado de la Fila {selectedDuplicateRow.duplicate.conflictingRow} dentro de este mismo archivo Excel.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDuplicateRow(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparación Lado a Lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                {/* Columna: En Tienda Actualmente */}
                <div className="space-y-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                      En tienda actualmente
                    </span>
                    {selectedDuplicateRow.duplicate.targetProduct && (
                      <Badge className="bg-slate-100 text-slate-700 text-[10px]">
                        ID #{selectedDuplicateRow.duplicate.targetProduct.id}
                      </Badge>
                    )}
                  </div>

                  {selectedDuplicateRow.duplicate.targetProduct ? (
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedDuplicateRow.duplicate.targetProduct.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Precio actual:</span>
                        <span className="font-bold text-slate-900">
                          S/ {selectedDuplicateRow.duplicate.targetProduct.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Categoría:</span>
                        <span className="text-slate-700">
                          {selectedDuplicateRow.duplicate.targetProduct.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Marca:</span>
                        <span className="text-slate-700">
                          {selectedDuplicateRow.duplicate.targetProduct.brand}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">SKU:</span>
                        <span className="font-mono text-slate-600">
                          {selectedDuplicateRow.duplicate.targetProduct.sku}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Disponibilidad:</span>
                        <span>
                          {selectedDuplicateRow.duplicate.targetProduct.inStock ? (
                            <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">En stock</Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-700 text-[10px]">Agotado</Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">
                      Colisión interna con la Fila {selectedDuplicateRow.duplicate.conflictingRow} de este archivo.
                    </p>
                  )}
                </div>

                {/* Columna: Nuevo desde el Excel */}
                <div className="space-y-3 bg-purple-50/50 p-3.5 rounded-lg border border-purple-200 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                    <span className="font-bold text-purple-900 uppercase text-[10px] tracking-wider">
                      Nuevo desde el Excel (Fila {selectedDuplicateRow.rowNumber})
                    </span>
                    <Badge className="bg-purple-100 text-purple-800 text-[10px]">Excel</Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedDuplicateRow.product.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Precio nuevo:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>S/ {selectedDuplicateRow.product.price.toFixed(2)}</span>
                        {selectedDuplicateRow.duplicate.targetProduct &&
                          selectedDuplicateRow.duplicate.targetProduct.price !==
                            selectedDuplicateRow.product.price && (
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded font-mono",
                                selectedDuplicateRow.product.price >
                                  selectedDuplicateRow.duplicate.targetProduct.price
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              )}
                            >
                              {selectedDuplicateRow.product.price >
                              selectedDuplicateRow.duplicate.targetProduct.price
                                ? "+"
                                : ""}
                              {(
                                ((selectedDuplicateRow.product.price -
                                  selectedDuplicateRow.duplicate.targetProduct.price) /
                                  selectedDuplicateRow.duplicate.targetProduct.price) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Categoría:</span>
                      <span className="text-slate-700">
                        {selectedDuplicateRow.product.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Marca:</span>
                      <span className="text-slate-700">
                        {selectedDuplicateRow.product.brand}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">SKU:</span>
                      <span className="font-mono text-slate-600">
                        {selectedDuplicateRow.product.sku}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Disponibilidad:</span>
                      <span>
                        {selectedDuplicateRow.product.inStock ? (
                          <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">En stock</Badge>
                        ) : (
                          <Badge className="bg-rose-50 text-rose-700 text-[10px]">Agotado</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones de Decisión */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700">
                  ¿Qué acción deseas tomar con este producto?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleSetDuplicateAction(selectedDuplicateRow.rowNumber, "update_price_stock")
                    }
                    className="h-10 text-xs font-bold justify-start px-3 border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-900"
                  >
                    <Check className="w-4 h-4 mr-2 text-purple-600 shrink-0" />
                    Actualizar solo Precio y Stock (Recomendado)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleSetDuplicateAction(selectedDuplicateRow.rowNumber, "update_all")
                    }
                    className="h-10 text-xs font-bold justify-start px-3 border-slate-200 hover:bg-slate-50 text-slate-800"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
                    Actualizar Todo (Reemplazar existente)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleSetDuplicateAction(selectedDuplicateRow.rowNumber, "skip")
                    }
                    className="h-10 text-xs font-bold justify-start px-3 border-slate-200 hover:bg-slate-50 text-slate-600"
                  >
                    <X className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                    Dejar el anterior (Omitir esta fila)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleSetDuplicateAction(selectedDuplicateRow.rowNumber, "create_new")
                    }
                    className="h-10 text-xs font-bold justify-start px-3 border-slate-200 hover:bg-slate-50 text-slate-800"
                  >
                    <Layers className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
                    Crear como producto nuevo independiente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
