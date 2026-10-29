"use client";

import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
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
  Cpu,
  BookOpen,
  ArrowRight,
  RefreshCw,
  GitCompare,
  Check,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  downloadExcelTemplate,
  exportProductsToExcel,
  parseExcelProducts,
  exportValidationReportToExcel,
  type ValidatedRow,
  type ExcelValidationResult,
  type DuplicateAction,
} from "@/lib/excelHelper";
import { cn } from "@/lib/utils";

interface ExcelManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "import" | "export";
}

type CatalogSelection = "library" | "technology";
type DuplicatePolicy = "update_existing" | "skip";

export function ExcelManagerModal({
  open,
  onOpenChange,
  defaultTab = "import",
}: ExcelManagerModalProps) {
  const { products, importBatch } = useCatalog();
  const [activeTab, setActiveTab] = useState<"import" | "export">(defaultTab);

  // Paso 1: Catálogo seleccionado
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogSelection>("library");

  // Paso 3: Estados de Dropzone
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Resultados de validación
  const [validationResult, setValidationResult] = useState<ExcelValidationResult | null>(null);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [duplicatePolicy, setDuplicatePolicy] = useState<DuplicatePolicy>("update_existing");
  const [isImporting, setIsImporting] = useState(false);

  // Pestaña Exportar
  const [exportFilter, setExportFilter] = useState<"all" | "technology" | "library">("all");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Sincronizar defaultTab si cambia
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Cierre seguro con tecla Escape (bloqueado durante importación)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isImporting) {
          onOpenChange(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isImporting, onOpenChange]);

  // Focus trap básico y scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalContainerRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Procesar archivo seleccionado
  const handleFileSelect = async (selectedFile: File, catalogType = selectedCatalog) => {
    if (!selectedFile) return;
    setUploadError(null);

    // Validación de peso máximo 10 MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("El archivo excede el tamaño máximo permitido de 10 MB. Reduce el peso o divide el lote.");
      return;
    }

    // Validación de extensión
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      setUploadError("Formato de archivo no admitido. Selecciona un archivo en formato .xlsx, .xls o .csv.");
      return;
    }

    setFile(selectedFile);
    setParsing(true);

    try {
      const res = await parseExcelProducts(selectedFile, catalogType, products);
      if (!res.validation.success && res.validation.fatalError) {
        setUploadError(res.validation.fatalError);
        setValidationResult(null);
        setRows([]);
      } else {
        setValidationResult(res.validation);
        // Configurar política de duplicados inicial
        const initialRows: ValidatedRow[] = (res.validation.rows || []).map((r) => {
          if (r.duplicate) {
            const act: DuplicateAction = duplicatePolicy === "update_existing" ? "update_price_stock" : "skip";
            return {
              ...r,
              duplicate: {
                ...r.duplicate,
                action: act,
              },
            };
          }
          return r;
        });
        setRows(initialRows);
      }
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Error al leer el archivo Excel. Verifica que no esté dañado ni protegido por contraseña."
      );
      setValidationResult(null);
      setRows([]);
    } finally {
      setParsing(false);
    }
  };

  // Cambio de catálogo
  const handleCatalogChange = (type: CatalogSelection) => {
    setSelectedCatalog(type);
    if (file) {
      handleFileSelect(file, type);
    }
  };

  // Manejo de Dropzone Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      handleFileSelect(dropped);
    }
  };

  // Limpiar archivo
  const handleClearFile = () => {
    setFile(null);
    setValidationResult(null);
    setRows([]);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cambio de política de duplicados
  const handleDuplicatePolicyChange = (policy: DuplicatePolicy) => {
    setDuplicatePolicy(policy);
    const act: DuplicateAction = policy === "update_existing" ? "update_price_stock" : "skip";
    setRows((prev) =>
      prev.map((r): ValidatedRow => {
        if (!r.duplicate) return r;
        return {
          ...r,
          duplicate: {
            ...r.duplicate,
            action: act,
          },
        };
      })
    );
  };

  // Métricas calculadas
  const counts = useMemo(() => {
    return {
      total: rows.length,
      ok: rows.filter((r) => r.status === "OK").length,
      warning: rows.filter((r) => r.status === "AVISO").length,
      error: rows.filter((r) => r.status === "ERROR").length,
      duplicate: rows.filter((r) => r.status === "DUPLICADO").length,
    };
  }, [rows]);

  const validCountToImport = counts.ok + counts.warning + (duplicatePolicy === "update_existing" ? counts.duplicate : 0);

  // Primeras 5 filas para vista previa
  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  // Descarga del reporte de errores
  const handleDownloadErrors = () => {
    if (!validationResult) return;
    exportValidationReportToExcel(
      {
        ...validationResult,
        rows,
      },
      `reporte_errores_${file?.name || "catalogo"}.xlsx`
    );
  };

  // Confirmar importación
  const handleConfirmImport = async () => {
    if (validCountToImport === 0 || isImporting) return;

    if (counts.error > 0) {
      const proceed = confirm(
        `Se omitirán ${counts.error} filas con errores bloqueantes y se importarán ${validCountToImport} productos válidos. ¿Deseas continuar?`
      );
      if (!proceed) return;
    }

    setIsImporting(true);
    try {
      importBatch(rows);
      handleClearFile();
      onOpenChange(false);
    } finally {
      setIsImporting(false);
    }
  };

  // Exportar productos
  const handleExport = () => {
    let toExport = products;
    let fileName = "catalogo_completo_novabytex.xlsx";
    if (exportFilter === "technology") {
      toExport = products.filter((p) => p.type === "technology");
      fileName = "catalogo_tecnologia_novabytex.xlsx";
    } else if (exportFilter === "library") {
      toExport = products.filter((p) => p.type === "library");
      fileName = "catalogo_libreria_novabytex.xlsx";
    }
    exportProductsToExcel(toExport, fileName);
  };

  const techCount = products.filter((p) => p.type === "technology").length;
  const libCount = products.filter((p) => p.type === "library").length;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="excel-modal-title"
      tabIndex={-1}
      ref={modalContainerRef}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Contenedor Principal del Modal */}
      <div
        className={cn(
          "w-full bg-white flex flex-col overflow-hidden text-slate-900 border border-slate-200/90 shadow-2xl transition-all duration-200",
          // >=768px: modal centrado, max-width 860px, max-height 90vh, rounded-2xl
          "sm:max-w-[860px] sm:max-h-[90vh] sm:rounded-2xl sm:my-auto",
          // <768px: pantalla completa (bottom sheet), bordes rectos abajo
          "h-full sm:h-auto max-h-screen rounded-t-2xl sm:rounded-b-2xl"
        )}
      >
        {/* ==================================================================== */}
        {/* CABECERA (Sticky, sin elementos cortados, botón X aislado)            */}
        {/* ==================================================================== */}
        <header className="sticky top-0 bg-white z-20 border-b border-slate-100 px-5 sm:px-6 pt-5 pb-3.5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            {/* Lado Izquierdo: Icono 40px + Título 20px semibold + Subtítulo 13px */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                style={{ width: 40, height: 40 }}
                className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/90 flex items-center justify-center shrink-0 shadow-2xs"
              >
                <FileSpreadsheet
                  size={20}
                  style={{ width: 20, height: 20 }}
                  className="w-5 h-5 text-blue-600 shrink-0"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="excel-modal-title"
                  className="text-[20px] font-semibold text-slate-900 tracking-tight leading-tight"
                >
                  Gestor de Importación y Validación Excel
                </h2>
                <p className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                  Carga masiva, auditoría inteligente de datos y catálogo NovaBytex
                </p>
              </div>
            </div>

            {/* Lado Derecho: Botón Cerrar (X, 18px icono, 32x32px aislado) */}
            <button
              type="button"
              onClick={() => !isImporting && onOpenChange(false)}
              disabled={isImporting}
              aria-label="Cerrar"
              style={{ width: 32, height: 32 }}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
                isImporting && "opacity-40 cursor-not-allowed"
              )}
            >
              <X size={18} style={{ width: 18, height: 18 }} className="w-[18px] h-[18px] shrink-0" />
            </button>
          </div>

          {/* Segmented Control / Tabs: 36px de alto, alineados a la izquierda bajo el título */}
          <div className="mt-3.5 flex items-center">
            <div
              style={{ height: 36 }}
              className="h-9 p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 inline-flex items-center gap-1"
            >
              <button
                type="button"
                onClick={() => setActiveTab("import")}
                style={{ height: 32 }}
                className={cn(
                  "h-8 px-3.5 rounded-md text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer",
                  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeTab === "import"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
                )}
              >
                <Upload size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Importar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("export")}
                style={{ height: 32 }}
                className={cn(
                  "h-8 px-3.5 rounded-md text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer",
                  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeTab === "export"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
                )}
              >
                <Download size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================================== */}
        {/* CUERPO DEL MODAL (Scroll interno, padding-top 24px)                  */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-6 pb-6 space-y-6">
          {activeTab === "import" ? (
            <div className="space-y-6">
              {/* ============================================================== */}
              {/* PASOS: Un solo contenedor con 3 pasos numerados                 */}
              {/* ============================================================== */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
                {/* ------------------------------------------------------------ */}
                {/* PASO 1: Elige el catálogo                                    */}
                {/* ------------------------------------------------------------ */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Círculo numerado de 24px */}
                    <div
                      style={{ width: 24, height: 24 }}
                      className="w-6 h-6 rounded-full bg-blue-600 text-white text-[12px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      1
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[14px] font-semibold text-slate-900">
                        Elige el catálogo
                      </span>
                      <span className="text-[12px] text-slate-600 font-normal">
                        (No necesitas la columna Tipo en tu Excel)
                      </span>
                    </div>
                  </div>

                  {/* Dos radio-cards de 56px de alto, iconos 20px, check en la seleccionada */}
                  {/* Mismo color para ambas: borde 2px azul de acento, fondo azul al 8% */}
                  <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Card Librería */}
                    <button
                      type="button"
                      onClick={() => handleCatalogChange("library")}
                      style={{ height: 56 }}
                      className={cn(
                        "h-[56px] px-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer text-left",
                        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
                        selectedCatalog === "library"
                          ? "border-2 border-blue-600 bg-blue-50/70 text-slate-900 font-semibold shadow-xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BookOpen
                          size={20}
                          style={{ width: 20, height: 20 }}
                          className="w-5 h-5 text-blue-600 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold leading-tight truncate">
                            Librería & Papelería
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Cuadernos, útiles, papelería escolar y oficina
                          </p>
                        </div>
                      </div>
                      <div
                        style={{ width: 18, height: 18 }}
                        className={cn(
                          "w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ml-2 border",
                          selectedCatalog === "library"
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {selectedCatalog === "library" && (
                          <Check size={12} style={{ width: 12, height: 12 }} strokeWidth={3} className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>

                    {/* Card Tecnología */}
                    <button
                      type="button"
                      onClick={() => handleCatalogChange("technology")}
                      style={{ height: 56 }}
                      className={cn(
                        "h-[56px] px-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer text-left",
                        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
                        selectedCatalog === "technology"
                          ? "border-2 border-blue-600 bg-blue-50/70 text-slate-900 font-semibold shadow-xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Cpu
                          size={20}
                          style={{ width: 20, height: 20 }}
                          className="w-5 h-5 text-blue-600 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold leading-tight truncate">
                            Tecnología TI
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Redes, servidores, software y licencias
                          </p>
                        </div>
                      </div>
                      <div
                        style={{ width: 18, height: 18 }}
                        className={cn(
                          "w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ml-2 border",
                          selectedCatalog === "technology"
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {selectedCatalog === "technology" && (
                          <Check size={12} style={{ width: 12, height: 12 }} strokeWidth={3} className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Línea vertical conectora */}
                <div className="w-0.5 h-4 bg-slate-200 ml-3" />

                {/* ------------------------------------------------------------ */}
                {/* PASO 2: Descarga la plantilla                                */}
                {/* ------------------------------------------------------------ */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ width: 24, height: 24 }}
                      className="w-6 h-6 rounded-full bg-blue-600 text-white text-[12px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      2
                    </div>
                    <span className="text-[14px] font-semibold text-slate-900">
                      Descarga la plantilla
                    </span>
                  </div>

                  <div className="pl-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-900 leading-tight">
                          Descargar plantilla de {selectedCatalog === "library" ? "Librería & Papelería" : "Tecnología TI"}
                        </p>
                        <p className="text-[12px] text-slate-500 mt-1 leading-normal">
                          <span className="font-semibold text-slate-700">Columnas obligatorias:</span> Nombre del producto, Categoría, Precio (S/).
                          <br className="hidden sm:inline" />
                          <span className="text-slate-400"> Opcionales: Marca, SKU, Descripción, Stock, etc.</span>
                        </p>
                      </div>

                      {/* Botón secundario outline de 36px de alto con icono de 16px */}
                      <button
                        type="button"
                        onClick={() => downloadExcelTemplate(selectedCatalog)}
                        style={{ height: 36 }}
                        className={cn(
                          "h-9 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
                          "text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0 transition-colors shadow-2xs w-full sm:w-auto",
                          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                        )}
                      >
                        <Download size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Descargar plantilla</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Línea vertical conectora */}
                <div className="w-0.5 h-4 bg-slate-200 ml-3" />

                {/* ------------------------------------------------------------ */}
                {/* PASO 3: Sube tu archivo (Dropzone interactiva)                */}
                {/* ------------------------------------------------------------ */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ width: 24, height: 24 }}
                      className="w-6 h-6 rounded-full bg-blue-600 text-white text-[12px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      3
                    </div>
                    <span className="text-[14px] font-semibold text-slate-900">
                      Sube tu archivo
                    </span>
                  </div>

                  <div className="pl-8">
                    {/* Input invisible */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                      }}
                    />

                    {/* Estado: Error */}
                    {uploadError && (
                      <div className="mb-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-900 flex items-start gap-3">
                        <AlertCircle size={18} style={{ width: 18, height: 18 }} className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-rose-950">No se pudo procesar el archivo</p>
                          <p className="mt-0.5 text-rose-800 leading-relaxed">{uploadError}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadError(null);
                              fileInputRef.current?.click();
                            }}
                            className="mt-2 inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                          >
                            Reintentar con otro archivo
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Estado: Archivo cargado */}
                    {file && !parsing ? (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={{ width: 36, height: 36 }}
                            className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200"
                          >
                            <FileCheck size={18} style={{ width: 18, height: 18 }} className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {(file.size / 1024).toFixed(1)} KB · Hoja: &quot;
                              {validationResult?.summary.sheetName || "Principal"}&quot; · {counts.total} filas leídas
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ height: 32 }}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            Cambiar
                          </button>
                          <button
                            type="button"
                            onClick={handleClearFile}
                            style={{ width: 32, height: 32 }}
                            title="Quitar archivo"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={15} style={{ width: 15, height: 15 }} className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      </div>
                    ) : parsing ? (
                      /* Estado: Validando con barra de progreso */
                      <div className="p-6 rounded-xl border border-blue-200 bg-blue-50/50 text-center space-y-3">
                        <RefreshCw size={24} style={{ width: 24, height: 24 }} className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                        <div className="space-y-1">
                          <p className="text-[13.5px] font-semibold text-blue-950">
                            Validando archivo y analizando 12 reglas...
                          </p>
                          <p className="text-[11.5px] text-blue-800/80">
                            Verificando columnas obligatorias, detección de duplicados, normalización de precios y categorías.
                          </p>
                        </div>
                        <div className="h-1.5 w-full max-w-md mx-auto bg-blue-200/60 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
                        </div>
                      </div>
                    ) : (
                      /* Estado: Reposo / Arrastrando (Dropzone) */
                      <div
                        tabIndex={0}
                        role="button"
                        aria-label="Arrastra tu archivo aquí o presiona Enter para seleccionar"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={cn(
                          // Max height 200px en desktop, 140px en mobile
                          "max-h-[200px] min-h-[140px] rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
                          isDragging
                            ? "border-2 border-solid border-blue-600 bg-blue-50/70 scale-[0.99]"
                            : "border-2 border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-400"
                        )}
                      >
                        {/* Icono de 40px centrado */}
                        <div
                          style={{ width: 40, height: 40 }}
                          className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs"
                        >
                          <Upload size={20} style={{ width: 20, height: 20 }} className="w-5 h-5 text-blue-600" />
                        </div>

                        {/* Título 15px semibold */}
                        <p className="text-[15px] font-semibold text-slate-800 leading-tight">
                          <span className="hidden sm:inline">Arrastra tu archivo aquí o haz clic para explorar</span>
                          <span className="sm:hidden">Toca para seleccionar un archivo</span>
                        </p>

                        {/* Reglas 13px */}
                        <p className="text-[13px] text-slate-500">
                          .xlsx, .xls o .csv · hasta 1,500 productos · máx. 10 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* RESULTADO DE VALIDACIÓN (Chips, Duplicados, Vista Previa)       */}
              {/* ============================================================== */}
              {rows.length > 0 && !parsing && (
                <div className="space-y-4">
                  {/* Resumen con Chips */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Válidos */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check size={14} style={{ width: 14, height: 14 }} className="w-3.5 h-3.5 text-emerald-600" />
                        {counts.ok} filas válidas
                      </span>

                      {/* Advertencias */}
                      {counts.warning > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle size={14} style={{ width: 14, height: 14 }} className="w-3.5 h-3.5 text-amber-600" />
                          {counts.warning} advertencias
                        </span>
                      )}

                      {/* Duplicados */}
                      {counts.duplicate > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <GitCompare size={14} style={{ width: 14, height: 14 }} className="w-3.5 h-3.5 text-purple-600" />
                          {counts.duplicate} duplicados
                        </span>
                      )}

                      {/* Errores */}
                      {counts.error > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle size={14} style={{ width: 14, height: 14 }} className="w-3.5 h-3.5 text-rose-600" />
                          {counts.error} errores
                        </span>
                      )}
                    </div>

                    {/* Botón secundario outline de 36px: Descargar reporte de errores */}
                    {counts.error > 0 && (
                      <button
                        type="button"
                        onClick={handleDownloadErrors}
                        style={{ height: 36 }}
                        className={cn(
                          "h-9 px-3 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700",
                          "text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0",
                          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
                        )}
                      >
                        <Download size={15} style={{ width: 15, height: 15 }} className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Descargar reporte de errores</span>
                      </button>
                    )}
                  </div>

                  {/* Selector Radio: Omitir duplicados / Actualizar existentes */}
                  {counts.duplicate > 0 && (
                    <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-purple-950">
                          Se detectaron {counts.duplicate} productos que ya existen en la tienda
                        </p>
                        <p className="text-[11.5px] text-purple-800/80 mt-0.5">
                          Elige cómo debe procesar el sistema los productos duplicados:
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 select-none">
                          <input
                            type="radio"
                            name="duplicate-policy"
                            value="update_existing"
                            checked={duplicatePolicy === "update_existing"}
                            onChange={() => handleDuplicatePolicyChange("update_existing")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Actualizar existentes (Precio y Stock)</span>
                        </label>

                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 select-none">
                          <input
                            type="radio"
                            name="duplicate-policy"
                            value="skip"
                            checked={duplicatePolicy === "skip"}
                            onChange={() => handleDuplicatePolicyChange("skip")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Omitir duplicados</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Tabla de Vista Previa de las Primeras 5 Filas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800">
                        Vista previa de datos (Primeras 5 filas)
                      </p>
                      {rows.length > 5 && (
                        <span className="text-[11.5px] text-slate-500">
                          Mostrando las primeras 5 de {rows.length} filas analizadas
                        </span>
                      )}
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10.5px] tracking-wider">
                            <tr>
                              <th className="px-3.5 py-2.5 w-14 text-center">Fila</th>
                              <th className="px-3.5 py-2.5">Producto / SKU</th>
                              <th className="px-3 py-2.5">Categoría</th>
                              <th className="px-3 py-2.5">Precio</th>
                              <th className="px-3 py-2.5 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {previewRows.map((row) => {
                              const hasError = row.status === "ERROR";
                              const hasWarning = row.status === "AVISO";
                              const isDuplicate = row.status === "DUPLICADO";

                              return (
                                <tr
                                  key={row.rowNumber}
                                  className={cn(
                                    "transition-colors",
                                    hasError ? "bg-rose-50/30" : hasWarning ? "bg-amber-50/20" : "hover:bg-slate-50/50"
                                  )}
                                >
                                  {/* Columna Fila */}
                                  <td className="px-3.5 py-2.5 text-center font-mono font-medium text-slate-500">
                                    {row.rowNumber}
                                  </td>

                                  {/* Columna Producto / SKU */}
                                  <td className="px-3.5 py-2.5 min-w-[200px]">
                                    <p className="font-semibold text-slate-900 leading-snug truncate" title={row.product.name}>
                                      {row.product.name || <span className="text-rose-500 italic font-normal">[Nombre vacío]</span>}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                      {row.product.brand} · SKU {row.product.sku}
                                    </p>
                                  </td>

                                  {/* Columna Categoría */}
                                  <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                                    {row.product.category}
                                  </td>

                                  {/* Columna Precio */}
                                  <td className="px-3 py-2.5 whitespace-nowrap tabular-nums font-semibold text-slate-900">
                                    S/ {row.product.price.toFixed(2)}
                                  </td>

                                  {/* Columna Estado con efecto Parallax/Hover desplegado */}
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                    <div className="relative inline-block group">
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer shadow-2xs transition-transform duration-200 group-hover:-translate-y-0.5",
                                          hasError
                                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                                            : hasWarning
                                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                                            : isDuplicate
                                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                        )}
                                      >
                                        {hasError ? (
                                          <AlertCircle size={13} style={{ width: 13, height: 13 }} />
                                        ) : hasWarning ? (
                                          <AlertTriangle size={13} style={{ width: 13, height: 13 }} />
                                        ) : isDuplicate ? (
                                          <GitCompare size={13} style={{ width: 13, height: 13 }} />
                                        ) : (
                                          <Check size={13} style={{ width: 13, height: 13 }} />
                                        )}
                                        {row.status}
                                      </span>

                                      {/* Tarjeta flotante Parallax con los motivos de la advertencia/error */}
                                      {row.issues.length > 0 && (
                                        <div
                                          className={cn(
                                            "absolute right-0 bottom-full mb-2 w-80 max-w-[85vw] p-3 rounded-xl bg-slate-900 text-white text-left shadow-2xl z-50",
                                            "pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100",
                                            "transform transition-all duration-200 ease-out translate-y-1 group-hover:-translate-y-1.5"
                                          )}
                                        >
                                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 pb-1.5 border-b border-slate-700/80 mb-2">
                                            Detalle de la Fila {row.rowNumber}
                                          </p>
                                          <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                                            {row.issues.map((issue) => (
                                              <div key={issue.id} className="text-[11px] leading-relaxed">
                                                <div className="flex items-center gap-1.5">
                                                  <span
                                                    className={cn(
                                                      "px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase",
                                                      issue.severity === "ERROR"
                                                        ? "bg-rose-500/20 text-rose-300"
                                                        : issue.severity === "DUPLICADO"
                                                        ? "bg-purple-500/20 text-purple-300"
                                                        : "bg-amber-500/20 text-amber-300"
                                                    )}
                                                  >
                                                    {issue.severity}
                                                  </span>
                                                  <span className="font-semibold text-slate-200">
                                                    Columna {issue.column}:
                                                  </span>
                                                </div>
                                                <p className="text-slate-300 mt-0.5 pl-1">{issue.message}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================================================================ */
            /* PESTAÑA: EXPORTAR CATÁLOGO                                       */
            /* ================================================================ */
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Selecciona qué catálogo deseas exportar a Excel
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Se generará un archivo .xlsx con todas las columnas estándar de NovaBytex.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label
                    onClick={() => setExportFilter("all")}
                    className={cn(
                      "p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                      exportFilter === "all"
                        ? "border-2 border-blue-600 bg-blue-50/70 font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet size={18} style={{ width: 18, height: 18 }} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Todos los productos</p>
                        <p className="text-[11px] text-slate-500">Tecnología TI y Librería combinados</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">
                      {products.length} items
                    </span>
                  </label>

                  <label
                    onClick={() => setExportFilter("technology")}
                    className={cn(
                      "p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                      exportFilter === "technology"
                        ? "border-2 border-blue-600 bg-blue-50/70 font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Cpu size={18} style={{ width: 18, height: 18 }} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Solo Tecnología TI</p>
                        <p className="text-[11px] text-slate-500">Hardware, redes, licencias y servidores</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">
                      {techCount} items
                    </span>
                  </label>

                  <label
                    onClick={() => setExportFilter("library")}
                    className={cn(
                      "p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                      exportFilter === "library"
                        ? "border-2 border-blue-600 bg-blue-50/70 font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} style={{ width: 18, height: 18 }} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Solo Librería & Papelería</p>
                        <p className="text-[11px] text-slate-500">Cuadernos, papelería, útiles de oficina</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">
                      {libCount} items
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    style={{ height: 40 }}
                    className={cn(
                      "w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs",
                      "inline-flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer",
                      "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                    )}
                  >
                    <Download size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-white" />
                    <span>Descargar catálogo en Excel (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* FOOTER (Barra sticky inferior)                                       */}
        {/* ==================================================================== */}
        <footer className="sticky bottom-0 bg-white border-t border-slate-100 px-5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 z-20 shrink-0">
          <button
            type="button"
            onClick={() => !isImporting && onOpenChange(false)}
            disabled={isImporting}
            className={cn(
              "h-11 sm:h-10 px-4 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
              isImporting && "opacity-40 cursor-not-allowed"
            )}
          >
            Cancelar
          </button>

          {activeTab === "import" && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validCountToImport === 0 || isImporting}
              className={cn(
                "h-11 sm:h-10 px-5 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all shadow-xs inline-flex items-center justify-center gap-2",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500",
                validCountToImport > 0 && !isImporting
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              )}
            >
              {isImporting ? (
                <>
                  <RefreshCw size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-white animate-spin" />
                  <span>Importando productos...</span>
                </>
              ) : (
                <>
                  <Check size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-white" />
                  <span>
                    {validCountToImport > 0
                      ? `Importar ${validCountToImport} productos`
                      : "Importar productos"}
                  </span>
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default ExcelManagerModal;
