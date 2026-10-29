import * as XLSX from "xlsx";
import type { CreateProductInput } from "@/services/ProductService";
import type { CatalogType, Product } from "@/lib/products";
import {
  validateExcelBuffer,
  type ExcelValidationResult,
  type ValidatedRow,
  type ValidationIssue,
  type DuplicateAction,
  type DuplicateCollision,
} from "./excelValidator";

export type {
  ExcelValidationResult,
  ValidatedRow,
  ValidationIssue,
  DuplicateAction,
  DuplicateCollision,
};

export interface ParsedRowResult {
  valid: CreateProductInput[];
  errors: { row: number; reason: string; data?: Record<string, unknown> }[];
  rawCount: number;
  validation?: ExcelValidationResult;
}

const TEMPLATE_HEADERS = [
  "Nombre",
  "Tipo (technology / library)",
  "Categoría",
  "Precio (S/)",
  "Precio Anterior (opcional)",
  "Marca",
  "SKU",
  "Garantía",
  "En Stock (SI / NO)",
  "Destacado (SI / NO)",
  "Descripción",
  "Características (separadas por comas)",
  "Imagen (URL o ruta local, ej: /assets/libreria/cuaderno.png)",
];

const TEMPLATE_SAMPLE_ROWS = [
  [
    "Switch Cisco Catalyst 1000 24 Puertos Gigabit",
    "technology",
    "Switches",
    3450,
    3800,
    "Cisco",
    "NB-SW-CISCO-24G",
    "1 año",
    "SI",
    "SI",
    "Switch de red administrable capa 2 para entornos corporativos.",
    "24 puertos Gigabit, 4 enlaces SFP 1G, Administración web intuitiva, Silencioso sin ventilador",
  ],
  [
    "Servidor Dell PowerEdge R450 Xeon Silver",
    "technology",
    "Servidores",
    12890,
    13900,
    "Dell",
    "NB-SRV-DELL-R450",
    "3 años",
    "SI",
    "NO",
    "Servidor en rack 1U de doble socket para centros de datos y virtualización.",
    "Procesador Intel Xeon Silver 4314, 32GB RAM DDR4 ECC, 2x 480GB SSD SATA Enterprise, Fuente redundante",
  ],
  [
    "Cuaderno Moleskine Classic Tapa Dura Rayado",
    "library",
    "Cuadernos",
    95,
    115,
    "Moleskine",
    "NB-LIB-MOLE-01",
    "6 meses",
    "SI",
    "SI",
    "Cuaderno clásico de tapa dura con esquinas redondeadas y cierre elástico.",
    "Papel libre de ácido de 70 g/m², Bolsillo interior expandible, Cinta marcapáginas a juego",
  ],
  [
    "Set Bolígrafos Parker Jotter Original Acero",
    "library",
    "Escritura",
    145,
    170,
    "Parker",
    "NB-LIB-PARK-02",
    "1 año",
    "SI",
    "NO",
    "Ícono del diseño contemporáneo con cuerpo de acero inoxidable pulido.",
    "Tinta Quinkflow suave y continua, Clip en flecha distintivo Parker, Presentación en estuche prémium",
  ],
];

export type ImportCatalogOption = "library" | "technology" | "auto";

/**
 * Downloads an official NovaBytex Excel template (.xlsx)
 * Si se especifica el tipo (library o technology), la plantilla se adapta específicamente a ese catálogo.
 */
export function downloadExcelTemplate(targetType: ImportCatalogOption = "library") {
  const isLibrary = targetType === "library";
  const isTech = targetType === "technology";

  let headers: string[];
  let sampleRows: (string | number)[][];
  let fileName: string;

  if (isLibrary) {
    fileName = "plantilla_libreria_novabytex.xlsx";
    headers = [
      "Nombre",
      "Categoría",
      "Precio (S/)",
      "Precio Anterior (opcional)",
      "Marca",
      "SKU (opcional)",
      "Garantía (opcional)",
      "En Stock (SI / NO)",
      "Destacado (SI / NO)",
      "Descripción (opcional)",
      "Características (opcional)",
      "Imagen (URL o ruta local, opcional)",
    ];
    sampleRows = [
      [
        "Cuaderno Standford Cuadriculado 100 Hojas",
        "Cuadernos",
        8.5,
        10.0,
        "Standford",
        "NB-STD-100H",
        "3 meses",
        "SI",
        "SI",
        "Cuaderno clásico de tapa dura con esquinas reforzadas y anillado doble.",
        "100 hojas, Papel bond 75g, Cuadriculado 5mm, Tapa dura plastificada",
        "/assets/libreria/cuaderno-standford-100h.jpg",
      ],
      [
        "Archivador Palanca A4 Plastificado Lomo Ancho",
        "Archivadores",
        14.5,
        "",
        "Artesco",
        "NB-ART-A4",
        "6 meses",
        "SI",
        "NO",
        "Archivador corporativo de alta durabilidad para oficina y archivo central.",
        "Formato A4, Lomo 8cm, Mecanismo de palanca niquelado con cantoneras metálicas",
        "/assets/libreria/archivador-artesco-a4.jpg",
      ],
      [
        "Caja Bolígrafos Faber-Castell 033 Azul x50",
        "Escritura",
        38.0,
        45.0,
        "Faber-Castell",
        "NB-FC-033-AZ",
        "1 año",
        "SI",
        "SI",
        "Caja de 50 bolígrafos punta media para uso continuo en oficina y estudio.",
        "Tinta azul semi-gel, Punta de tungsteno 1.0mm, Cuerpo hexagonal antitranspirante",
        "/assets/libreria/boligrafos-faber-033.jpg",
      ],
    ];
  } else if (isTech) {
    fileName = "plantilla_tecnologia_novabytex.xlsx";
    headers = [
      "Nombre",
      "Categoría",
      "Precio (S/)",
      "Precio Anterior (opcional)",
      "Marca",
      "SKU (opcional)",
      "Garantía (opcional)",
      "En Stock (SI / NO)",
      "Destacado (SI / NO)",
      "Descripción (opcional)",
      "Características (opcional)",
      "Imagen (URL o ruta local, opcional)",
    ];
    sampleRows = [
      [
        "Switch Cisco Catalyst 1000 24 Puertos Gigabit",
        "Redes",
        3450,
        3800,
        "Cisco",
        "NB-SW-CISCO-24G",
        "1 año",
        "SI",
        "SI",
        "Switch de red administrable capa 2 para entornos corporativos.",
        "24 puertos Gigabit, 4 enlaces SFP 1G, Administración web intuitiva, Silencioso",
        "/assets/tech/switch-cisco-24p.jpg",
      ],
      [
        "Servidor Dell PowerEdge R450 Xeon Silver",
        "Servidores",
        12890,
        13900,
        "Dell",
        "NB-SRV-DELL-R450",
        "3 años",
        "SI",
        "NO",
        "Servidor en rack 1U de doble socket para centros de datos y virtualización.",
        "Intel Xeon Silver 4314, 32GB RAM DDR4 ECC, 2x 480GB SSD Enterprise, Fuente redundante",
        "/assets/tech/servidor-dell-r450.jpg",
      ],
    ];
  } else {
    fileName = "plantilla_productos_novabytex.xlsx";
    headers = TEMPLATE_HEADERS;
    sampleRows = TEMPLATE_SAMPLE_ROWS;
  }

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Anchos de columna cómodos
  ws["!cols"] = [
    { wch: 38 }, // Nombre
    { wch: 20 }, // Categoría o Tipo
    { wch: 14 }, // Precio
    { wch: 22 }, // Precio Anterior
    { wch: 16 }, // Marca
    { wch: 20 }, // SKU
    { wch: 16 }, // Garantía
    { wch: 18 }, // En Stock
    { wch: 18 }, // Destacado
    { wch: 45 }, // Descripción
    { wch: 50 }, // Características
    { wch: 40 }, // Imagen
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, isLibrary ? "Librería" : "Productos");
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports products to an Excel file (.xlsx)
 */
export function exportProductsToExcel(
  products: Product[],
  fileName = "catalogo_novabytex.xlsx"
) {
  const rows = products.map((p) => ({
    ID: p.id,
    Nombre: p.name,
    Tipo: p.type === "technology" ? "Tecnología" : "Librería",
    Categoría: p.category,
    "Precio (S/)": p.price,
    "Precio Anterior (S/)": p.previousPrice ?? "",
    Marca: p.brand,
    SKU: p.sku,
    Garantía: p.warranty,
    "En Stock": p.inStock ? "SI" : "NO",
    Activo: p.available ? "SI" : "NO",
    Destacado: p.featured ? "SI" : "NO",
    Imagen: p.image ?? "",
    Descripción: p.description,
    "Fecha Creación": p.createdAt ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 8 },  // ID
    { wch: 36 }, // Nombre
    { wch: 14 }, // Tipo
    { wch: 18 }, // Categoría
    { wch: 14 }, // Precio
    { wch: 18 }, // Precio anterior
    { wch: 16 }, // Marca
    { wch: 20 }, // SKU
    { wch: 14 }, // Garantía
    { wch: 10 }, // En Stock
    { wch: 10 }, // Activo
    { wch: 10 }, // Destacado
    { wch: 35 }, // Imagen
    { wch: 45 }, // Descripción
    { wch: 22 }, // Fecha
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Catálogo");
  XLSX.writeFile(wb, fileName);
}

function cleanPriceValue(val: unknown): number {
  if (typeof val === "number") return isNaN(val) ? 0 : Math.max(0, val);
  if (!val) return 0;
  let str = String(val).trim().replace(/[^0-9.,]/g, "");
  if (!str) return 0;
  if (str.includes(",") && !str.includes(".")) {
    str = str.replace(",", ".");
  } else if (str.includes(",") && str.includes(".")) {
    if (str.lastIndexOf(",") > str.lastIndexOf(".")) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Exporta el reporte de problemas, duplicados y advertencias a un archivo Excel (.xlsx)
 */
export function exportValidationReportToExcel(
  validation: ExcelValidationResult,
  fileName = "reporte_errores_importacion.xlsx"
) {
  const rows: Record<string, unknown>[] = [];
  validation.rows.forEach((row) => {
    if (row.issues.length === 0) return;
    row.issues.forEach((issue) => {
      rows.push({
        Fila: issue.row,
        Estado: row.status,
        Severidad: issue.severity,
        Columna: issue.column,
        Campo: issue.field,
        "Código de Problema": issue.code,
        "Valor Original": String(issue.rawValue ?? ""),
        "Corrección Sugerida": issue.suggestedFix !== undefined ? String(issue.suggestedFix) : "",
        "Mensaje Detallado": issue.message,
      });
    });
  });

  if (rows.length === 0) {
    rows.push({
      Resultado: "Sin problemas detectados",
      Detalle: "Todas las filas del archivo son 100% válidas y están listas para importar.",
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 8 },  // Fila
    { wch: 12 }, // Estado
    { wch: 14 }, // Severidad
    { wch: 20 }, // Columna
    { wch: 16 }, // Campo
    { wch: 24 }, // Código
    { wch: 30 }, // Valor Original
    { wch: 28 }, // Corrección
    { wch: 60 }, // Mensaje
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte de Validación");
  XLSX.writeFile(wb, fileName);
}

/**
 * Parses an uploaded .xlsx / .xls / .csv file using the enhanced excelValidator engine.
 */
export async function parseExcelProducts(
  file: File,
  targetCatalogType: ImportCatalogOption = "library",
  existingProducts: Product[] = []
): Promise<ParsedRowResult & { validation: ExcelValidationResult }> {
  const buffer = await file.arrayBuffer();
  const validation = await validateExcelBuffer(buffer, {
    targetCatalogType,
    existingProducts,
  });

  if (!validation.success) {
    return {
      valid: [],
      errors: [
        {
          row: 0,
          reason: validation.fatalError || "Error al procesar el archivo Excel.",
        },
      ],
      rawCount: 0,
      validation,
    };
  }

  // Las filas válidas para pre-cargar son aquellas sin error bloqueante
  const valid = validation.rows
    .filter((r) => r.status === "OK" || r.status === "AVISO")
    .map((r) => r.product);

  const errors = validation.rows
    .filter((r) => r.status === "ERROR")
    .map((r) => ({
      row: r.rowNumber,
      reason: r.issues.map((i) => i.message).join(" | "),
      data: r.originalRow,
    }));

  return {
    valid,
    errors,
    rawCount: validation.summary.totalRows,
    validation,
  };
}
