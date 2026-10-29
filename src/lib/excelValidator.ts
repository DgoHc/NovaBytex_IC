/**
 * excelValidator.ts - Motor Central de Validación y Detección de Riesgos para Catálogo NovaBytex
 * 
 * Implementa clasificación de severidad (ERROR, DUPLICADO, AVISO),
 * detección exhaustiva de los 12 grupos de casos, sanitización de seguridad
 * y preparación para resolución de duplicados en panel lado a lado.
 */

import * as XLSX from "xlsx";
import type { CreateProductInput } from "../services/ProductService";
import type { CatalogType, Product } from "./products";
import {
  TECHNOLOGY_CATEGORIES,
  LIBRARY_CATEGORIES,
  ALL_CATEGORIES,
  getCategoriesForType,
} from "./products";

export type IssueSeverity = "ERROR" | "DUPLICADO" | "AVISO";

export interface ValidationIssue {
  id: string;
  code: string;
  severity: IssueSeverity;
  row: number; // 1-indexed (fila física del archivo)
  column: string; // Nombre de la columna en el Excel
  field: keyof CreateProductInput;
  rawValue: unknown;
  message: string;
  suggestedFix?: unknown;
  isAutoFixable?: boolean;
  meta?: Record<string, unknown>;
}

export type DuplicateAction =
  | "skip" // Omitir fila del Excel
  | "update_all" // Reemplazar todos los campos del producto existente
  | "update_price_stock" // Solo actualizar precio y disponibilidad de stock
  | "create_new" // Crear como producto nuevo con SKU/nombre diferenciados
  | "merge" // Fusión campo por campo
  | "delete"; // Eliminar fila del lote

export interface FieldDifference {
  field: string;
  label: string;
  storeValue: unknown;
  excelValue: unknown;
  priceDiffPercent?: number;
}

export interface DuplicateCollision {
  collisionType: "store_exact" | "store_fuzzy" | "store_sku" | "internal_exact" | "internal_fuzzy";
  targetProductId?: number;
  targetProduct?: Product;
  conflictingRow?: number;
  similarityPercent: number;
  differences: FieldDifference[];
  action: DuplicateAction;
  mergedFields?: Partial<CreateProductInput>;
}

export interface ValidatedRow {
  rowNumber: number;
  originalRow: Record<string, unknown>;
  product: CreateProductInput;
  status: "OK" | "AVISO" | "ERROR" | "DUPLICADO";
  issues: ValidationIssue[];
  duplicate?: DuplicateCollision;
  isIgnored?: boolean; // El usuario decidió ignorar los avisos de esta fila
}

export interface PriceMetrics {
  min: number;
  max: number;
  average: number;
  median: number;
  outliersCount: number;
}

export interface ValidationSummary {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  duplicateCount: number;
  sheetName: string;
  availableSheets: string[];
  issuesByCode: Record<string, number>;
  priceMetrics: PriceMetrics;
}

export interface ExcelValidationResult {
  success: boolean;
  fatalError?: string;
  summary: ValidationSummary;
  rows: ValidatedRow[];
  headers: string[];
  unrecognizedHeaders: string[];
}

export interface ValidationOptions {
  targetCatalogType: "library" | "technology" | "auto";
  existingProducts?: Product[];
  deletedIds?: Set<number>;
  maxRowsAllowed?: number;
  selectedSheet?: string;
  defaultInStock?: boolean;
}

// ============================================================================
// ALGORITMOS DE TEXTO, SEGURIDAD Y SIMILITUD
// ============================================================================

/**
 * Distancia de Levenshtein para medir cercanía entre dos cadenas
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // eliminación
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Calcula similitud de 0 a 100% entre dos cadenas de texto
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const str1 = normalizeComparisonText(s1);
  const str2 = normalizeComparisonText(s2);
  if (!str1 && !str2) return 100;
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 100;

  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(str1, str2);
  const similarity = ((maxLen - dist) / maxLen) * 100;
  return Math.round(similarity * 10) / 10;
}

/**
 * Normaliza texto para comparaciones estrictas (quita acentos, puntuación, mayúsculas y dobles espacios)
 */
export function normalizeComparisonText(text: string): string {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")     // Quitar caracteres especiales
    .replace(/\s+/g, " ")            // Reducir dobles espacios
    .trim();
}

/**
 * Convierte un texto a Formato Título (Primera Letra Mayúscula)
 */
export function toTitleCase(text: string): string {
  if (!text) return "";
  const smallWords = new Set(["de", "del", "la", "las", "el", "los", "en", "con", "y", "o", "a", "por", "para"]);
  return text
    .toLowerCase()
    .split(" ")
    .map((word, idx) => {
      if (word.length === 0) return "";
      // Siglas comunes mantenerlas en mayúsculas (A4, USB, SSD, RAM, SFP, LED, TI, PC)
      if (/^(a4|a3|usb|ssd|hdd|ram|sfp|led|ti|pc|cat6|utp|poe|dvd|hdmi|vga)$/i.test(word)) {
        return word.toUpperCase();
      }
      if (idx > 0 && smallWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Sanitiza contra ataques de Inyección de Fórmulas CSV/Excel (=, +, -, @, \t, \r)
 */
export function sanitizeFormulaInjection(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  const dangerousPrefixes = ["=", "+", "-", "@", "\t", "\r"];
  if (dangerousPrefixes.some((p) => trimmed.startsWith(p))) {
    // Si empieza con un operador de fórmula sospechoso pero es texto descriptivo
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Sanitiza etiquetas HTML o scripts maliciosos
 */
export function sanitizeHtml(value: string): string {
  if (!value) return "";
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Limpieza inteligente de precios numéricos con soporte para comas y puntos
 */
export function parsePriceWithDetails(val: unknown): {
  value: number;
  hasFormatIssue: boolean;
  originalText: string;
} {
  const originalText = String(val ?? "").trim();
  if (typeof val === "number") {
    return {
      value: isNaN(val) ? 0 : Math.round(Math.max(0, val) * 100) / 100,
      hasFormatIssue: false,
      originalText,
    };
  }

  if (!originalText) {
    return { value: 0, hasFormatIssue: false, originalText };
  }

  // Detectar si contenía prefijo monetario, comas o espacios
  const hasCurrency = /(s\/|\$|soles|usd)/i.test(originalText);
  let cleaned = originalText.replace(/[^0-9.,]/g, "");

  if (cleaned.includes(",") && !cleaned.includes(".")) {
    cleaned = cleaned.replace(",", ".");
  } else if (cleaned.includes(",") && cleaned.includes(".")) {
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  }

  const parsed = parseFloat(cleaned);
  const finalValue = isNaN(parsed) ? 0 : Math.round(Math.max(0, parsed) * 100) / 100;
  const hasFormatIssue = hasCurrency || originalText.includes(",") || originalText.includes(" ");

  return { value: finalValue, hasFormatIssue, originalText };
}

/**
 * Calcula la mediana de un conjunto de números
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].filter((v) => v > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

// Marcas conocidas para sugerir unificación de variantes
export const KNOWN_BRANDS: Record<string, string> = {
  "faber castell": "Faber-Castell",
  "faber-castell": "Faber-Castell",
  "fabercastell": "Faber-Castell",
  standford: "Standford",
  stanford: "Standford",
  artesco: "Artesco",
  cisco: "Cisco",
  dell: "Dell",
  hp: "HP",
  hewlettpackard: "HP",
  lenovo: "Lenovo",
  mikrotik: "MikroTik",
  ubiquiti: "Ubiquiti",
  fortinet: "Fortinet",
  apc: "APC",
  microsoft: "Microsoft",
  epson: "Epson",
  logitech: "Logitech",
  pilot: "Pilot",
  moleskine: "Moleskine",
  parker: "Parker",
  pelikan: "Pelikan",
  vinifan: "Vinifan",
  staedtler: "Staedtler",
  lamy: "Lamy",
};

/**
 * Busca si una marca coincide o se parece a una marca conocida
 */
export function findBrandStandard(brand: string): { standard: string; changed: boolean } {
  const norm = normalizeComparisonText(brand);
  if (!norm) return { standard: "NovaBytex", changed: false };
  if (KNOWN_BRANDS[norm]) {
    return { standard: KNOWN_BRANDS[norm], changed: KNOWN_BRANDS[norm] !== brand.trim() };
  }
  return { standard: toTitleCase(brand.trim()), changed: false };
}

/**
 * Busca la categoría oficial más cercana a la ingresada
 */
export function findClosestCategory(
  inputCat: string,
  catalogType: CatalogType
): { category: string; similarity: number; exact: boolean } {
  const available = getCategoriesForType(catalogType);
  const normInput = normalizeComparisonText(inputCat);

  // Coincidencia exacta o normalizada
  for (const cat of available) {
    if (normalizeComparisonText(cat) === normInput) {
      return { category: cat, similarity: 100, exact: true };
    }
  }

  // Búsqueda por similitud
  let bestMatch = available[0] ?? (catalogType === "library" ? "Papelería" : "Redes");
  let bestSim = 0;

  for (const cat of available) {
    const sim = calculateSimilarity(inputCat, cat);
    if (sim > bestSim) {
      bestSim = sim;
      bestMatch = cat;
    }
  }

  return { category: bestMatch, similarity: bestSim, exact: false };
}

// ============================================================================
// VALIDADOR PRINCIPAL DEL ARCHIVO EXCEL
// ============================================================================

export async function validateExcelBuffer(
  buffer: ArrayBuffer | Uint8Array,
  options: ValidationOptions
): Promise<ExcelValidationResult> {
  const {
    targetCatalogType = "library",
    existingProducts = [],
    deletedIds = new Set<number>(),
    maxRowsAllowed = 1500,
    selectedSheet,
    defaultInStock = true,
  } = options;

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellFormula: true, cellDates: true });
  } catch (err) {
    return {
      success: false,
      fatalError: "El archivo está dañado, corrupto o protegido con contraseña y no se pudo abrir.",
      summary: createEmptySummary(),
      rows: [],
      headers: [],
      unrecognizedHeaders: [],
    };
  }

  const availableSheets = workbook.SheetNames || [];
  if (availableSheets.length === 0) {
    return {
      success: false,
      fatalError: "El archivo no contiene ninguna hoja legible.",
      summary: createEmptySummary(),
      rows: [],
      headers: [],
      unrecognizedHeaders: [],
    };
  }

  const sheetName = selectedSheet && availableSheets.includes(selectedSheet)
    ? selectedSheet
    : availableSheets[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    return {
      success: false,
      fatalError: `No se pudo leer la hoja seleccionada "${sheetName}".`,
      summary: createEmptySummary(),
      rows: [],
      headers: [],
      unrecognizedHeaders: [],
    };
  }

  // Leer filas como objetos
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  if (rawRows.length === 0) {
    return {
      success: false,
      fatalError: `La hoja "${sheetName}" contiene encabezados pero no tiene ninguna fila de productos.`,
      summary: {
        ...createEmptySummary(),
        sheetName,
        availableSheets,
      },
      rows: [],
      headers: [],
      unrecognizedHeaders: [],
    };
  }

  if (rawRows.length > maxRowsAllowed) {
    return {
      success: false,
      fatalError: `El archivo contiene ${rawRows.length} filas, superando el límite máximo permitido de ${maxRowsAllowed} filas por lote. Divide el archivo para importarlo.`,
      summary: {
        ...createEmptySummary(),
        sheetName,
        availableSheets,
      },
      rows: [],
      headers: [],
      unrecognizedHeaders: [],
    };
  }

  // Detectar encabezados de la primera fila
  const firstRow = rawRows[0] || {};
  const detectedHeaders = Object.keys(firstRow);
  const recognizedHeaders = new Set<string>();

  // Helper para buscar columnas tolerantes
  const getCol = (row: Record<string, unknown>, ...aliases: string[]): { val: unknown; key: string } => {
    for (const alias of aliases) {
      for (const rowKey of Object.keys(row)) {
        if (rowKey.trim().toLowerCase().startsWith(alias.toLowerCase())) {
          recognizedHeaders.add(rowKey);
          return { val: row[rowKey], key: rowKey };
        }
      }
    }
    return { val: undefined, key: "" };
  };

  // Verificar si la columna obligatoria Nombre está presente
  const hasNameColumn = detectedHeaders.some((h) =>
    ["nombre", "name", "producto", "item", "titulo"].some((a) =>
      h.trim().toLowerCase().startsWith(a)
    )
  );

  if (!hasNameColumn) {
    return {
      success: false,
      fatalError: "No se encontró la columna obligatoria de Nombre del producto (ej: 'Nombre', 'Producto', 'Item').",
      summary: {
        ...createEmptySummary(),
        sheetName,
        availableSheets,
      },
      rows: [],
      headers: detectedHeaders,
      unrecognizedHeaders: detectedHeaders,
    };
  }

  const unrecognizedHeaders = detectedHeaders.filter((h) => !recognizedHeaders.has(h));

  // Mapa de productos existentes para detección de duplicados
  const storeMapByName = new Map<string, Product>();
  const storeMapBySku = new Map<string, Product>();

  for (const p of existingProducts) {
    const norm = normalizeComparisonText(p.name);
    if (norm) storeMapByName.set(norm, p);
    if (p.sku) storeMapBySku.set(p.sku.trim().toLowerCase(), p);
  }

  // Mapa de nombres dentro del mismo archivo para duplicados internos
  const internalMapByName = new Map<string, number>(); // normName -> rowNumber
  const internalMapBySku = new Map<string, number>();

  const validatedRows: ValidatedRow[] = [];
  const issuesByCode: Record<string, number> = {};
  const pricesCollected: number[] = [];

  const addIssue = (issuesList: ValidationIssue[], issue: ValidationIssue) => {
    issuesList.push(issue);
    issuesByCode[issue.code] = (issuesByCode[issue.code] || 0) + 1;
  };

  // ==========================================================================
  // ITERACIÓN Y VALIDACIÓN FILA POR FILA
  // ==========================================================================

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Fila física (1 = headers)
    const issues: ValidationIssue[] = [];

    // 1. NOMBRE (Grupo 3, 4, 11)
    const rawNameObj = getCol(row, "nombre", "name", "producto", "item", "titulo");
    const rawNameStr = String(rawNameObj.val ?? "");
    let cleanName = sanitizeHtml(sanitizeFormulaInjection(rawNameStr)).trim();
    // Quitar dobles espacios internos y saltos de línea
    cleanName = cleanName.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ");

    if (!cleanName || cleanName === "-" || cleanName.toLowerCase() === "n/a") {
      addIssue(issues, {
        id: `NAME_EMPTY-r${rowNum}`,
        code: "NAME_EMPTY",
        severity: "ERROR",
        row: rowNum,
        column: rawNameObj.key || "Nombre",
        field: "name",
        rawValue: rawNameObj.val,
        message: `Fila ${rowNum}: El nombre del producto es obligatorio y no puede estar vacío ni ser '-' o 'N/A'.`,
      });
    } else {
      if (cleanName.length < 3) {
        addIssue(issues, {
          id: `NAME_TOO_SHORT-r${rowNum}`,
          code: "NAME_TOO_SHORT",
          severity: "ERROR",
          row: rowNum,
          column: rawNameObj.key,
          field: "name",
          rawValue: rawNameStr,
          message: `Fila ${rowNum}: El nombre tiene solo ${cleanName.length} caracteres (mínimo 3).`,
        });
      } else if (cleanName.length > 80) {
        addIssue(issues, {
          id: `NAME_TOO_LONG-r${rowNum}`,
          code: "NAME_TOO_LONG",
          severity: "AVISO",
          row: rowNum,
          column: rawNameObj.key,
          field: "name",
          rawValue: rawNameStr,
          message: `Fila ${rowNum}: El nombre excede los 80 caracteres recomendados (${cleanName.length}/80). Podría cortarse en tarjetas pequeñas.`,
        });
      }

      // Detectar TODO EN MAYÚSCULAS
      if (cleanName.length > 5 && cleanName === cleanName.toUpperCase() && /[A-Z]/.test(cleanName)) {
        addIssue(issues, {
          id: `NAME_ALL_CAPS-r${rowNum}`,
          code: "NAME_ALL_CAPS",
          severity: "AVISO",
          row: rowNum,
          column: rawNameObj.key,
          field: "name",
          rawValue: rawNameStr,
          message: `Fila ${rowNum}: El nombre está completamente en MAYÚSCULAS. Se recomienda formato Título.`,
          suggestedFix: toTitleCase(cleanName),
          isAutoFixable: true,
        });
      }

      // Detectar si solo son números
      if (/^\d+$/.test(cleanName)) {
        addIssue(issues, {
          id: `NAME_NUMERIC_ONLY-r${rowNum}`,
          code: "NAME_NUMERIC_ONLY",
          severity: "ERROR",
          row: rowNum,
          column: rawNameObj.key,
          field: "name",
          rawValue: rawNameStr,
          message: `Fila ${rowNum}: El nombre contiene únicamente números. Parece un código SKU o código de barras en la columna equivocada.`,
        });
      }

      // Detectar si contiene precio dentro del nombre (ej: "Cuaderno S/ 6.50")
      if (/(s\/\.?\s*\d+|\$\s*\d+)/i.test(cleanName)) {
        addIssue(issues, {
          id: `NAME_CONTAINS_PRICE-r${rowNum}`,
          code: "NAME_CONTAINS_PRICE",
          severity: "AVISO",
          row: rowNum,
          column: rawNameObj.key,
          field: "name",
          rawValue: rawNameStr,
          message: `Fila ${rowNum}: El nombre incluye una mención de precio ('S/ ...'). El precio debe colocarse en su columna respectiva.`,
        });
      }
    }

    // 2. TIPO DE CATÁLOGO (Grupo 7)
    let catalogType: CatalogType = targetCatalogType === "technology" ? "technology" : "library";
    if (targetCatalogType === "auto") {
      const rawTypeObj = getCol(row, "tipo", "type", "catalogo", "seccion");
      const rawType = String(rawTypeObj.val ?? "").toLowerCase();
      if (rawType.includes("tech") || rawType.includes("tec") || rawType.includes("ti") || rawType.includes("red")) {
        catalogType = "technology";
      } else {
        catalogType = "library";
      }
    }

    // 3. CATEGORÍA (Grupo 7)
    const rawCatObj = getCol(row, "categor", "cat", "rubro", "clasificacion");
    const rawCatStr = String(rawCatObj.val ?? "").trim();
    let category = rawCatStr;

    if (!rawCatStr || rawCatStr === "-" || rawCatStr.toLowerCase() === "n/a") {
      const defaultCategory = catalogType === "library" ? "Papelería" : "Redes";
      addIssue(issues, {
        id: `CAT_EMPTY-r${rowNum}`,
        code: "CAT_EMPTY",
        severity: "AVISO",
        row: rowNum,
        column: rawCatObj.key || "Categoría",
        field: "category",
        rawValue: rawCatObj.val,
        message: `Fila ${rowNum}: Categoría no especificada. Se asignará '${defaultCategory}' por defecto.`,
        suggestedFix: defaultCategory,
        isAutoFixable: true,
      });
      category = defaultCategory;
    } else {
      const catCheck = findClosestCategory(rawCatStr, catalogType);
      if (!catCheck.exact) {
        if (catCheck.similarity >= 80) {
          addIssue(issues, {
            id: `CAT_TYPO_SUGGEST-r${rowNum}`,
            code: "CAT_TYPO_SUGGEST",
            severity: "AVISO",
            row: rowNum,
            column: rawCatObj.key,
            field: "category",
            rawValue: rawCatStr,
            message: `Fila ${rowNum}: Categoría '${rawCatStr}' no coincide exactamente. ¿Quisiste decir '${catCheck.category}'?`,
            suggestedFix: catCheck.category,
            isAutoFixable: true,
          });
          category = catCheck.category;
        } else {
          // Categoría nueva
          addIssue(issues, {
            id: `CAT_NEW_CREATED-r${rowNum}`,
            code: "CAT_NEW_CREATED",
            severity: "AVISO",
            row: rowNum,
            column: rawCatObj.key,
            field: "category",
            rawValue: rawCatStr,
            message: `Fila ${rowNum}: La categoría '${rawCatStr}' no existe en el catálogo. Se creará automáticamente como nueva categoría.`,
          });
          category = toTitleCase(rawCatStr);
        }
      } else {
        category = catCheck.category;
      }
    }

    // 4. PRECIO (Grupo 6)
    const rawPriceObj = getCol(row, "precio", "price", "costo", "pvp", "monto");
    const parsedPrice = parsePriceWithDetails(rawPriceObj.val);
    let finalPrice = parsedPrice.value;

    if (parsedPrice.hasFormatIssue && finalPrice > 0) {
      addIssue(issues, {
        id: `PRC_FORMAT_NORMALIZED-r${rowNum}`,
        code: "PRC_FORMAT_NORMALIZED",
        severity: "AVISO",
        row: rowNum,
        column: rawPriceObj.key || "Precio",
        field: "price",
        rawValue: rawPriceObj.val,
        message: `Fila ${rowNum}: El precio '${parsedPrice.originalText}' fue normalizado automáticamente a S/ ${finalPrice.toFixed(2)}.`,
        suggestedFix: finalPrice,
        isAutoFixable: true,
      });
    }

    if (finalPrice <= 0) {
      addIssue(issues, {
        id: `PRC_ZERO-r${rowNum}`,
        code: "PRC_ZERO",
        severity: "ERROR",
        row: rowNum,
        column: rawPriceObj.key || "Precio",
        field: "price",
        rawValue: rawPriceObj.val,
        message: `Fila ${rowNum}: El precio no puede ser 0, negativo o estar vacío. Un producto debe tener un valor de venta válido.`,
        suggestedFix: 1.0,
      });
    } else {
      pricesCollected.push(finalPrice);
    }

    // 5. PRECIO ANTERIOR (Grupo 6)
    const rawPrevPriceObj = getCol(row, "precio anterior", "previous", "anterior", "antes", "rebaja");
    let previousPrice: number | undefined = undefined;

    if (rawPrevPriceObj.val !== undefined && String(rawPrevPriceObj.val).trim() !== "") {
      const parsedPrev = parsePriceWithDetails(rawPrevPriceObj.val);
      if (parsedPrev.value > 0) {
        if (parsedPrev.value <= finalPrice) {
          addIssue(issues, {
            id: `PRC_PREV_LOWER-r${rowNum}`,
            code: "PRC_PREV_LOWER",
            severity: "AVISO",
            row: rowNum,
            column: rawPrevPriceObj.key,
            field: "previousPrice",
            rawValue: rawPrevPriceObj.val,
            message: `Fila ${rowNum}: El precio anterior (S/ ${parsedPrev.value}) debe ser mayor al precio actual (S/ ${finalPrice}) para reflejar una oferta. Se omitirá el descuento.`,
          });
        } else {
          previousPrice = parsedPrev.value;
        }
      }
    }

    // 6. MARCA (Grupo 7)
    const rawBrandObj = getCol(row, "marca", "brand", "editorial", "fabricante");
    const rawBrandStr = String(rawBrandObj.val ?? "").trim();
    let finalBrand = "NovaBytex";

    if (!rawBrandStr || rawBrandStr === "-" || rawBrandStr.toLowerCase() === "n/a") {
      finalBrand = catalogType === "library" ? "Standford" : "NovaBytex";
      addIssue(issues, {
        id: `BRD_EMPTY_DEFAULT-r${rowNum}`,
        code: "BRD_EMPTY_DEFAULT",
        severity: "AVISO",
        row: rowNum,
        column: rawBrandObj.key || "Marca",
        field: "brand",
        rawValue: rawBrandObj.val,
        message: `Fila ${rowNum}: Marca no especificada. Se asignará '${finalBrand}' por defecto.`,
        suggestedFix: finalBrand,
        isAutoFixable: true,
      });
    } else {
      const brandCheck = findBrandStandard(rawBrandStr);
      finalBrand = brandCheck.standard;
      if (brandCheck.changed) {
        addIssue(issues, {
          id: `BRD_UNIFIED-r${rowNum}`,
          code: "BRD_UNIFIED",
          severity: "AVISO",
          row: rowNum,
          column: rawBrandObj.key,
          field: "brand",
          rawValue: rawBrandStr,
          message: `Fila ${rowNum}: La marca '${rawBrandStr}' fue unificada a su denominación oficial '${finalBrand}'.`,
          suggestedFix: finalBrand,
          isAutoFixable: true,
        });
      }
    }

    // 7. SKU (Grupo 5)
    const rawSkuObj = getCol(row, "sku", "código", "codigo", "cod");
    let sku = String(rawSkuObj.val ?? "").trim();
    const prefix = catalogType === "library" ? "LIB" : "TI";

    if (!sku || sku === "-" || sku.toLowerCase() === "n/a") {
      sku = `NB-${prefix}-${Date.now().toString().slice(-4)}-${idx + 1}`;
      addIssue(issues, {
        id: `SKU_AUTOGENERATED-r${rowNum}`,
        code: "SKU_AUTOGENERATED",
        severity: "AVISO",
        row: rowNum,
        column: rawSkuObj.key || "SKU",
        field: "sku",
        rawValue: rawSkuObj.val,
        message: `Fila ${rowNum}: SKU no proporcionado. Se autogeneró '${sku}'.`,
        suggestedFix: sku,
      });
    }

    // 8. EN STOCK (Grupo 8)
    const rawStockObj = getCol(row, "en stock", "stock", "disponible", "cant", "cantidad");
    const rawStockStr = String(rawStockObj.val ?? "").trim().toLowerCase();
    let inStock = defaultInStock;

    if (!rawStockStr) {
      addIssue(issues, {
        id: `STK_DEFAULT_APPLIED-r${rowNum}`,
        code: "STK_DEFAULT_APPLIED",
        severity: "AVISO",
        row: rowNum,
        column: rawStockObj.key || "En Stock",
        field: "inStock",
        rawValue: rawStockObj.val,
        message: `Fila ${rowNum}: Campo de stock vacío. Se marcará como 'Disponible' (${defaultInStock ? "SÍ" : "NO"}) por defecto.`,
        suggestedFix: defaultInStock,
      });
    } else {
      if (["no", "0", "false", "agotado", "sin stock"].includes(rawStockStr)) {
        inStock = false;
      } else if (["si", "sí", "yes", "true", "1", "disponible", "en stock"].includes(rawStockStr)) {
        inStock = true;
      } else if (!isNaN(Number(rawStockStr))) {
        // Cantidad numérica: >0 es true, <=0 es false
        inStock = Number(rawStockStr) > 0;
      } else {
        addIssue(issues, {
          id: `STK_UNKNOWN_FORMAT-r${rowNum}`,
          code: "STK_UNKNOWN_FORMAT",
          severity: "AVISO",
          row: rowNum,
          column: rawStockObj.key,
          field: "inStock",
          rawValue: rawStockObj.val,
          message: `Fila ${rowNum}: Valor de stock '${rawStockObj.val}' no reconocido. Se asumirá 'Disponible' (SÍ).`,
          suggestedFix: true,
        });
      }
    }

    // 9. DESTACADO
    const rawFeatObj = getCol(row, "destacado", "featured", "portada", "promocion");
    const rawFeatStr = String(rawFeatObj.val ?? "").trim().toLowerCase();
    const featured = ["si", "sí", "yes", "true", "1"].includes(rawFeatStr);

    // 10. DESCRIPCIÓN (Grupo 11)
    const rawDescObj = getCol(row, "descrip", "detalles", "detalle", "info");
    let description = sanitizeHtml(sanitizeFormulaInjection(String(rawDescObj.val ?? ""))).trim();
    if (!description || description === "-" || description.toLowerCase() === "n/a") {
      description = `${cleanName} - Catálogo NovaBytex. Disponible en nuestra tienda.`;
      addIssue(issues, {
        id: `DESC_AUTOGENERATED-r${rowNum}`,
        code: "DESC_AUTOGENERATED",
        severity: "AVISO",
        row: rowNum,
        column: rawDescObj.key || "Descripción",
        field: "description",
        rawValue: rawDescObj.val,
        message: `Fila ${rowNum}: Descripción vacía. Se autogeneró una reseña descriptiva estándar.`,
      });
    }

    // 11. CARACTERÍSTICAS (Grupo 10)
    const rawFeatListObj = getCol(row, "caracteristicas", "features", "especificaciones");
    const rawFeatListStr = String(rawFeatListObj.val ?? "");
    const features = rawFeatListStr
      ? rawFeatListStr.split(",").map((s) => sanitizeHtml(s).trim()).filter(Boolean)
      : [];

    // 12. IMAGEN (Grupo 9)
    const rawImgObj = getCol(row, "imagen", "image", "foto", "url imagen", "foto url", "img");
    let rawImage = String(rawImgObj.val ?? "").trim();
    let hasValidImage = false;

    if (!rawImage || rawImage === "-" || rawImage.toLowerCase() === "n/a") {
      addIssue(issues, {
        id: `IMG_EMPTY_DEFAULT-r${rowNum}`,
        code: "IMG_EMPTY_DEFAULT",
        severity: "AVISO",
        row: rowNum,
        column: rawImgObj.key || "Imagen",
        field: "image",
        rawValue: rawImgObj.val,
        message: `Fila ${rowNum}: No tiene imagen. Se utilizará la ilustración visual temática del producto mientras no se suba una foto.`,
      });
      rawImage = "";
    } else {
      // Validar si es URL web o ruta local
      if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
        try {
          const url = new URL(rawImage);
          if (url.protocol !== "https:") {
            addIssue(issues, {
              id: `IMG_NOT_HTTPS-r${rowNum}`,
              code: "IMG_NOT_HTTPS",
              severity: "AVISO",
              row: rowNum,
              column: rawImgObj.key,
              field: "image",
              rawValue: rawImage,
              message: `Fila ${rowNum}: El enlace de imagen usa 'http://' en lugar de 'https://'. Podría ser bloqueado por políticas de contenido mixto.`,
              suggestedFix: rawImage.replace(/^http:\/\//i, "https://"),
            });
          }
          if (url.hostname.includes("drive.google.com") || url.hostname.includes("dropbox.com")) {
            addIssue(issues, {
              id: `IMG_PRIVATE_DRIVE-r${rowNum}`,
              code: "IMG_PRIVATE_DRIVE",
              severity: "AVISO",
              row: rowNum,
              column: rawImgObj.key,
              field: "image",
              rawValue: rawImage,
              message: `Fila ${rowNum}: El enlace parece ser de Google Drive o Dropbox. Asegúrate de que tenga permisos públicos de visualización directa.`,
            });
          }
          hasValidImage = true;
        } catch {
          addIssue(issues, {
            id: `IMG_INVALID_URL-r${rowNum}`,
            code: "IMG_INVALID_URL",
            severity: "ERROR",
            row: rowNum,
            column: rawImgObj.key,
            field: "image",
            rawValue: rawImage,
            message: `Fila ${rowNum}: La URL de la imagen '${rawImage}' no tiene un formato web válido.`,
          });
        }
      } else if (rawImage.startsWith("/assets/") || rawImage.startsWith("assets/")) {
        hasValidImage = true;
      } else {
        addIssue(issues, {
          id: `IMG_UNKNOWN_PATH-r${rowNum}`,
          code: "IMG_UNKNOWN_PATH",
          severity: "AVISO",
          row: rowNum,
          column: rawImgObj.key,
          field: "image",
          rawValue: rawImage,
          message: `Fila ${rowNum}: La ruta de imagen '${rawImage}' debe ser una URL (https://...) o una ruta en /assets/.`,
        });
      }
    }

    // 13. TIPO DE ILUSTRACIÓN (imageType)
    let defaultImageType: Product["imageType"] = "book";
    if (catalogType === "technology") {
      defaultImageType = category.toLowerCase().includes("serv") ? "server" : "switch";
    } else {
      const lower = (cleanName + " " + category).toLowerCase();
      if (lower.includes("cuad") || lower.includes("libret")) defaultImageType = "notebook";
      else if (lower.includes("lapic") || lower.includes("bolig")) defaultImageType = "pen";
      else if (lower.includes("lapiz") || lower.includes("lápiz")) defaultImageType = "pencil";
      else if (lower.includes("plum") || lower.includes("marcad")) defaultImageType = "marker";
      else if (lower.includes("resalt")) defaultImageType = "highlighter";
      else if (lower.includes("agend")) defaultImageType = "agenda";
      else defaultImageType = "book";
    }

    const normalizedProduct: CreateProductInput = {
      name: cleanName,
      type: catalogType,
      category,
      price: finalPrice,
      previousPrice,
      brand: finalBrand,
      sku,
      warranty: catalogType === "technology" ? "12 meses" : "Garantía de tienda",
      description,
      fullDescription: description,
      inStock,
      available: true,
      featured,
      rating: 4.8,
      reviewsCount: 0,
      specifications: [
        `Marca: ${finalBrand}`,
        `Categoría: ${category}`,
        `Garantía: ${catalogType === "technology" ? "12 meses" : "Garantía de tienda"}`,
      ],
      features,
      imageType: defaultImageType,
      image: rawImage,
    };

    // ========================================================================
    // DETECCIÓN DE DUPLICADOS (Grupo 5, Requerimiento A)
    // ========================================================================
    let duplicateCollision: DuplicateCollision | undefined = undefined;
    const normName = normalizeComparisonText(cleanName);
    const normSku = sku.trim().toLowerCase();

    // 5.1 Duplicado exacto dentro del mismo archivo
    if (normName && internalMapByName.has(normName)) {
      const prevRow = internalMapByName.get(normName)!;
      duplicateCollision = {
        collisionType: "internal_exact",
        conflictingRow: prevRow,
        similarityPercent: 100,
        differences: [],
        action: "skip",
      };
      addIssue(issues, {
        id: `DUP_INTERNAL_EXACT-r${rowNum}`,
        code: "DUP_INTERNAL_EXACT",
        severity: "DUPLICADO",
        row: rowNum,
        column: "Nombre",
        field: "name",
        rawValue: cleanName,
        message: `Fila ${rowNum}: Duplicado exacto de la Fila ${prevRow} dentro de este mismo archivo.`,
        meta: { conflictingRow: prevRow },
      });
    } else if (normSku && internalMapBySku.has(normSku)) {
      const prevRow = internalMapBySku.get(normSku)!;
      duplicateCollision = {
        collisionType: "internal_exact",
        conflictingRow: prevRow,
        similarityPercent: 100,
        differences: [],
        action: "skip",
      };
      addIssue(issues, {
        id: `DUP_INTERNAL_SKU-r${rowNum}`,
        code: "DUP_INTERNAL_SKU",
        severity: "DUPLICADO",
        row: rowNum,
        column: "SKU",
        field: "sku",
        rawValue: sku,
        message: `Fila ${rowNum}: El SKU '${sku}' ya está asignado en la Fila ${prevRow} de este archivo.`,
        meta: { conflictingRow: prevRow },
      });
    } else if (normName && storeMapByName.has(normName)) {
      // 5.2 Duplicado con producto existente en la tienda
      const existing = storeMapByName.get(normName)!;
      const diffs: FieldDifference[] = [];

      if (existing.price !== finalPrice) {
        const diffP = ((finalPrice - existing.price) / existing.price) * 100;
        diffs.push({
          field: "price",
          label: "Precio",
          storeValue: existing.price,
          excelValue: finalPrice,
          priceDiffPercent: Math.round(diffP * 10) / 10,
        });
      }
      if (existing.inStock !== inStock) {
        diffs.push({
          field: "inStock",
          label: "Disponibilidad",
          storeValue: existing.inStock ? "En Stock" : "Agotado",
          excelValue: inStock ? "En Stock" : "Agotado",
        });
      }
      if (existing.category !== category) {
        diffs.push({
          field: "category",
          label: "Categoría",
          storeValue: existing.category,
          excelValue: category,
        });
      }
      if (existing.brand !== finalBrand) {
        diffs.push({
          field: "brand",
          label: "Marca",
          storeValue: existing.brand,
          excelValue: finalBrand,
        });
      }

      duplicateCollision = {
        collisionType: "store_exact",
        targetProductId: existing.id,
        targetProduct: existing,
        similarityPercent: 100,
        differences: diffs,
        action: "update_price_stock", // Acción por defecto recomendada
      };

      addIssue(issues, {
        id: `DUP_STORE_EXACT-r${rowNum}`,
        code: "DUP_STORE_EXACT",
        severity: "DUPLICADO",
        row: rowNum,
        column: "Nombre",
        field: "name",
        rawValue: cleanName,
        message: `Fila ${rowNum}: Ya existe en la tienda como '${existing.name}' (ID #${existing.id}, SKU: ${existing.sku}).`,
        meta: {
          targetProductId: existing.id,
          targetProductName: existing.name,
          diffCount: diffs.length,
        },
      });
    } else if (normSku && storeMapBySku.has(normSku)) {
      // 5.3 Mismo SKU con producto existente
      const existing = storeMapBySku.get(normSku)!;
      duplicateCollision = {
        collisionType: "store_sku",
        targetProductId: existing.id,
        targetProduct: existing,
        similarityPercent: 100,
        differences: [
          {
            field: "name",
            label: "Nombre",
            storeValue: existing.name,
            excelValue: cleanName,
          },
        ],
        action: "update_all",
      };

      addIssue(issues, {
        id: `DUP_STORE_SKU-r${rowNum}`,
        code: "DUP_STORE_SKU",
        severity: "DUPLICADO",
        row: rowNum,
        column: "SKU",
        field: "sku",
        rawValue: sku,
        message: `Fila ${rowNum}: El SKU '${sku}' ya pertenece al producto '${existing.name}' (ID #${existing.id}) en la tienda.`,
        meta: { targetProductId: existing.id },
      });
    } else {
      // 5.4 Buscar duplicados casi iguales (Fuzzy Similarity >= 90%)
      for (const [storeNorm, existing] of storeMapByName.entries()) {
        const sim = calculateSimilarity(normName, storeNorm);
        if (sim >= 90) {
          duplicateCollision = {
            collisionType: "store_fuzzy",
            targetProductId: existing.id,
            targetProduct: existing,
            similarityPercent: sim,
            differences: [
              {
                field: "name",
                label: "Nombre",
                storeValue: existing.name,
                excelValue: cleanName,
              },
            ],
            action: "skip",
          };

          addIssue(issues, {
            id: `DUP_STORE_FUZZY-r${rowNum}`,
            code: "DUP_STORE_FUZZY",
            severity: "DUPLICADO",
            row: rowNum,
            column: "Nombre",
            field: "name",
            rawValue: cleanName,
            message: `Fila ${rowNum}: Nombre muy similar (${sim}%) a '${existing.name}' (ID #${existing.id}). ¿Es el mismo producto?`,
            meta: { targetProductId: existing.id, similarity: sim },
          });
          break;
        }
      }
    }

    // Registrar en mapas de duplicados internos
    if (normName) internalMapByName.set(normName, rowNum);
    if (normSku) internalMapBySku.set(normSku, rowNum);

    // Determinar estado de la fila
    let status: ValidatedRow["status"] = "OK";
    if (issues.some((i) => i.severity === "ERROR")) {
      status = "ERROR";
    } else if (issues.some((i) => i.severity === "DUPLICADO")) {
      status = "DUPLICADO";
    } else if (issues.some((i) => i.severity === "AVISO")) {
      status = "AVISO";
    }

    validatedRows.push({
      rowNumber: rowNum,
      originalRow: row,
      product: normalizedProduct,
      status,
      issues,
      duplicate: duplicateCollision,
    });
  });

  // ==========================================================================
  // DETECCIÓN DE PRECIOS ATÍPICOS (OUTLIERS)
  // ==========================================================================
  const priceMedian = calculateMedian(pricesCollected);
  let outliersCount = 0;

  if (priceMedian > 0 && pricesCollected.length >= 5) {
    validatedRows.forEach((row) => {
      const p = row.product.price;
      // Precios 10 veces mayores a la mediana o menores a 0.05x
      if (p > priceMedian * 10 || (p > 0 && p < priceMedian * 0.05)) {
        outliersCount++;
        addIssue(row.issues, {
          id: `PRC_OUTLIER-r${row.rowNumber}`,
          code: "PRC_OUTLIER",
          severity: "AVISO",
          row: row.rowNumber,
          column: "Precio",
          field: "price",
          rawValue: p,
          message: `Fila ${row.rowNumber}: El precio S/ ${p.toFixed(2)} es muy atípico respecto a la mediana del catálogo (Mediana: S/ ${priceMedian.toFixed(2)}). Verifica si hubo un error al escribirlo.`,
          meta: { median: priceMedian, ratio: p / priceMedian },
        });
        if (row.status === "OK") row.status = "AVISO";
      }
    });
  }

  // ==========================================================================
  // CONSOLIDADO DE MÉTRICAS Y RESUMEN
  // ==========================================================================
  const totalRows = validatedRows.length;
  const validCount = validatedRows.filter((r) => r.status === "OK").length;
  const warningCount = validatedRows.filter((r) => r.status === "AVISO").length;
  const errorCount = validatedRows.filter((r) => r.status === "ERROR").length;
  const duplicateCount = validatedRows.filter((r) => r.status === "DUPLICADO").length;

  const validPrices = pricesCollected.filter((p) => p > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  const avgPrice =
    validPrices.length > 0
      ? Math.round((validPrices.reduce((a, b) => a + b, 0) / validPrices.length) * 100) / 100
      : 0;

  return {
    success: true,
    summary: {
      totalRows,
      validCount,
      warningCount,
      errorCount,
      duplicateCount,
      sheetName,
      availableSheets,
      issuesByCode,
      priceMetrics: {
        min: minPrice,
        max: maxPrice,
        median: priceMedian,
        average: avgPrice,
        outliersCount,
      },
    },
    rows: validatedRows,
    headers: detectedHeaders,
    unrecognizedHeaders,
  };
}

function createEmptySummary(): ValidationSummary {
  return {
    totalRows: 0,
    validCount: 0,
    warningCount: 0,
    errorCount: 0,
    duplicateCount: 0,
    sheetName: "",
    availableSheets: [],
    issuesByCode: {},
    priceMetrics: {
      min: 0,
      max: 0,
      median: 0,
      average: 0,
      outliersCount: 0,
    },
  };
}
