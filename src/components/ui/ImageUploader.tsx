"use client";

import React, { useRef, useState } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/contexts/CatalogContext";

const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  onError?: (error: string) => void;
  label?: string;
  description?: string;
  maxSizeMB?: number;
  accepted?: string[];
  aspect?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  onError,
  label = "Imagen del producto",
  description = `Formatos: JPG, PNG, WEBP, GIF · Máximo ${MAX_SIZE_MB} MB.`,
  maxSizeMB = MAX_SIZE_MB,
  accepted = ACCEPTED,
  aspect = "aspect-square",
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useCatalog();

  const notifyError = (msg: string) => {
    setError(msg);
    if (onError) onError(msg);
    pushToast({
      title: "Imagen no válida",
      description: msg,
      variant: "error",
    });
  };

  const clearError = () => {
    if (error) setError(null);
  };

  const validateAndRead = (file: File) => {
    clearError();
    if (!accepted.includes(file.type)) {
      notifyError(
        `Formato «${file.type}» no permitido. Usa JPG, PNG, WEBP o GIF.`
      );
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      notifyError(
        `La imagen supera los ${maxSizeMB} MB (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB).`
      );
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => {
      notifyError("Ocurrió un error al leer la imagen.");
    };
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result);
      clearError();
      pushToast({
        title: "Imagen lista",
        description: `Se cargó «${file.name}».`,
        variant: "success",
      });
    };
    reader.readAsDataURL(file);
  };

  const onFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    validateAndRead(file);
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
            {label}
          </label>
          <p className="text-[11.5px] text-slate-500 mt-1">{description}</p>
        </div>
      </div>

      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          value
            ? "border-library-sage/50 bg-library-cream/40"
            : dragActive
            ? "border-blue-500 bg-blue-50/60"
            : "border-slate-200 bg-slate-50/80 hover:border-blue-300 hover:bg-white"
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          onFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accepted.join(",")}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />

        <div
          className={cn(
            "w-full flex flex-col items-center justify-center",
            aspect
          )}
        >
          {value ? (
            <div className="relative w-full h-full">
              <img
                src={value}
                alt="Preview del producto"
                className="w-full h-full object-contain p-4"
                onError={() => {
                  setError("No se pudo mostrar la imagen.");
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onChange("");
                  clearError();
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-rose-700 hover:border-rose-200 hover:bg-white transition-colors"
                aria-label="Eliminar imagen"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-slate-700 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 border border-slate-200">
                  Vista previa · lista para guardar
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    inputRef.current?.click();
                  }}
                  className="h-9 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 text-xs font-semibold"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Cambiar
                </Button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer select-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="text-sm font-semibold text-slate-900">
                  Selecciona una imagen
                </p>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Arrastra el archivo aquí o haz click para explorar desde tu
                  dispositivo.
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white text-xs font-semibold transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Seleccionar imagen
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold text-rose-800 leading-snug">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
