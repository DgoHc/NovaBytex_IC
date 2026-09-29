"use client";

import React, { useRef, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X,
  Trash2,
  Layers,
  Cpu,
  BookOpen,
  ArrowRight,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  downloadExcelTemplate,
  exportProductsToExcel,
  parseExcelProducts,
  type ParsedRowResult,
} from "@/lib/excelHelper";
import type { CreateProductInput } from "@/services/ProductService";
import { cn } from "@/lib/utils";

interface ExcelManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "import" | "export";
}

export function ExcelManagerModal({
  open,
  onOpenChange,
  defaultTab = "import",
}: ExcelManagerModalProps) {
  const { products, bulkCreate } = useCatalog();
  const [activeTab, setActiveTab] = useState<"import" | "export">(defaultTab);

  // Import states
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedRowResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export states
  const [exportFilter, setExportFilter] = useState<"all" | "technology" | "library">("all");

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setParsing(true);
    try {
      const res = await parseExcelProducts(selectedFile);
      setParseResult(res);
    } catch {
      setParseResult({
        valid: [],
        errors: [{ row: 0, reason: "Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido." }],
        rawCount: 0,
      });
    } finally {
      setParsing(false);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearFile = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.valid.length === 0) return;
    bulkCreate(parseResult.valid);
    clearFile();
    onOpenChange(false);
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
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[24px] border-slate-200">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-bodoni text-2xl text-slate-900 tracking-tight">
                Gestor de Catálogo en Excel
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Carga masiva e importación/exportación de productos en hojas de cálculo .xlsx
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "import" | "export")}
          className="p-6 pt-3"
        >
          <TabsList className="h-11 rounded-xl bg-slate-100 p-1 w-full grid grid-cols-2 mb-5">
            <TabsTrigger
              value="import"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 mr-2 text-emerald-600" />
              Importar Archivo Excel
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Download className="w-3.5 h-3.5 mr-2 text-blue-600" />
              Exportar Catálogo
            </TabsTrigger>
          </TabsList>

          {/* TAB: IMPORT */}
          <TabsContent value="import" className="space-y-4 focus-visible:outline-none mt-0">
            {/* Template Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-950">
                    ¿No tienes la plantilla oficial?
                  </p>
                  <p className="text-[11px] text-blue-800/80 leading-snug">
                    Descarga el formato modelo con ejemplos para Tecnología y Librería.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadExcelTemplate}
                className="h-8 px-3 rounded-lg border-blue-200 bg-white text-blue-700 hover:bg-blue-50 text-xs font-semibold shrink-0"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Descargar Plantilla
              </Button>
            </div>

            {/* Drop Zone */}
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
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
                    Formatos admitidos: .xlsx, .xls o .csv (máximo 10 MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Info Bar */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    className="h-8 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Cambiar archivo
                  </Button>
                </div>

                {/* Parsing status */}
                {parsing && (
                  <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                    Analizando y validando filas del archivo...
                  </div>
                )}

                {/* Parse Results */}
                {parseResult && !parsing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {parseResult.valid.length > 0 && (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold px-2.5 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            {parseResult.valid.length} productos listos
                          </Badge>
                        )}
                        {parseResult.errors.length > 0 && (
                          <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-xs font-bold px-2.5 py-1">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                            {parseResult.errors.length} filas con error
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Total de filas leídas: {parseResult.rawCount}
                      </span>
                    </div>

                    {/* Errors List if any */}
                    {parseResult.errors.length > 0 && (
                      <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 text-xs text-rose-800 space-y-1 max-h-28 overflow-y-auto">
                        {parseResult.errors.map((err, i) => (
                          <p key={i}>
                            <strong>Fila {err.row}:</strong> {err.reason}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Preview Table */}
                    {parseResult.valid.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider sticky top-0">
                            <tr>
                              <th className="p-2.5 font-bold">Producto</th>
                              <th className="p-2.5 font-bold">Tipo</th>
                              <th className="p-2.5 font-bold">Categoría</th>
                              <th className="p-2.5 font-bold">SKU</th>
                              <th className="p-2.5 font-bold text-right">Precio</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {parseResult.valid.map((item, i) => (
                              <tr key={i} className="hover:bg-slate-50/80">
                                <td className="p-2.5 font-medium text-slate-900 max-w-[200px] truncate">
                                  {item.name}
                                </td>
                                <td className="p-2.5">
                                  <Badge
                                    className={cn(
                                      "text-[10px] font-bold px-1.5 py-0.5",
                                      item.type === "technology"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-library-sage/25 text-library-sage-foreground border-library-sage/50"
                                    )}
                                  >
                                    {item.type === "technology" ? "TI" : "Lib"}
                                  </Badge>
                                </td>
                                <td className="p-2.5 text-slate-600 truncate">
                                  {item.category}
                                </td>
                                <td className="p-2.5 font-mono text-slate-500 text-[11px]">
                                  {item.sku}
                                </td>
                                <td className="p-2.5 text-right font-bold text-slate-900">
                                  S/ {item.price.toLocaleString("es-PE")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={clearFile}
                    className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={!parseResult || parseResult.valid.length === 0}
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Confirmar e Importar {parseResult?.valid.length ?? 0} Productos
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB: EXPORT */}
          <TabsContent value="export" className="space-y-5 focus-visible:outline-none mt-0">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Selecciona qué catálogo deseas exportar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFilter("all")}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
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
                    "p-4 rounded-xl border text-left transition-all",
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
                    "p-4 rounded-xl border text-left transition-all",
                    exportFilter === "library"
                      ? "border-library-sage-foreground bg-library-sage-foreground text-white shadow-md"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  )}
                >
                  <BookOpen className="w-5 h-5 mb-2 opacity-80" />
                  <p className="text-sm font-bold">Librería &amp; Arte</p>
                  <p className={cn("text-xs mt-0.5", exportFilter === "library" ? "text-slate-200" : "text-slate-500")}>
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
                  Se generará una hoja Excel (.xlsx) con {exportCount} productos y todas sus columnas.
                </p>
              </div>
              <Button
                onClick={handleExport}
                className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Excel ({exportCount})
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
