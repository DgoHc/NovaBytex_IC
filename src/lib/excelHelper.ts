import * as XLSX from "xlsx";
import type { CreateProductInput } from "@/services/ProductService";
import type { CatalogType, Product } from "@/lib/products";

export interface ParsedRowResult {
  valid: CreateProductInput[];
  errors: { row: number; reason: string; data?: Record<string, unknown> }[];
  rawCount: number;
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

/**
 * Downloads an official NovaBytex Excel template (.xlsx)
 */
export function downloadExcelTemplate() {
  const wsData = [TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE_ROWS];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for comfortable reading
  ws["!cols"] = [
    { wch: 38 }, // Nombre
    { wch: 25 }, // Tipo
    { wch: 18 }, // Categoría
    { wch: 14 }, // Precio
    { wch: 22 }, // Precio Anterior
    { wch: 16 }, // Marca
    { wch: 20 }, // SKU
    { wch: 14 }, // Garantía
    { wch: 18 }, // En Stock
    { wch: 18 }, // Destacado
    { wch: 45 }, // Descripción
    { wch: 50 }, // Características
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla Productos");
  XLSX.writeFile(wb, "plantilla_productos_novabytex.xlsx");
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
    { wch: 45 }, // Descripción
    { wch: 22 }, // Fecha
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Catálogo");
  XLSX.writeFile(wb, fileName);
}

/**
 * Parses an uploaded .xlsx / .xls / .csv file and validates rows.
 */
export async function parseExcelProducts(file: File): Promise<ParsedRowResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return { valid: [], errors: [{ row: 0, reason: "El archivo no contiene hojas legibles." }], rawCount: 0 };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  const valid: CreateProductInput[] = [];
  const errors: { row: number; reason: string; data?: Record<string, unknown> }[] = [];

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed header + data row

    // Helper to find a value by multiple possible header keys
    const getVal = (...keys: string[]): unknown => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.trim().toLowerCase().startsWith(k.toLowerCase())) {
            return row[rowKey];
          }
        }
      }
      return undefined;
    };

    const name = String(getVal("nombre", "name", "producto", "item") ?? "").trim();
    if (!name) {
      errors.push({ row: rowNum, reason: "Falta el nombre del producto", data: row });
      return;
    }

    const rawType = String(getVal("tipo", "type", "catalogo") ?? "").trim().toLowerCase();
    let type: CatalogType = "technology";
    if (
      rawType.includes("lib") ||
      rawType.includes("book") ||
      rawType.includes("papel") ||
      rawType.includes("cuaderno")
    ) {
      type = "library";
    } else if (
      rawType.includes("tech") ||
      rawType.includes("tec") ||
      rawType.includes("ti")
    ) {
      type = "technology";
    } else {
      // Default guess based on category if unspecified
      type = "technology";
    }

    const category = String(getVal("categor", "cat") ?? (type === "technology" ? "Switches" : "Libros")).trim();
    const rawPrice = getVal("precio", "price");
    const numPrice = Number(String(rawPrice).replace(/[^0-9.]/g, ""));
    const price = isNaN(numPrice) ? 0 : Math.max(0, numPrice);

    const rawPrevPrice = getVal("precio anterior", "previous", "anterior");
    let previousPrice: number | undefined = undefined;
    if (rawPrevPrice !== undefined && rawPrevPrice !== "") {
      const parsedPrev = Number(String(rawPrevPrice).replace(/[^0-9.]/g, ""));
      if (!isNaN(parsedPrev) && parsedPrev > price) {
        previousPrice = parsedPrev;
      }
    }

    const brand = String(getVal("marca", "brand") ?? "NovaBytex").trim() || "NovaBytex";
    const sku = String(getVal("sku", "código", "codigo") ?? `NB-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`).trim();
    const warranty = String(getVal("garant", "warranty") ?? (type === "technology" ? "1 año" : "6 meses")).trim();
    const description = String(getVal("descrip", "detalles") ?? `${name} - Garantía oficial NovaBytex`).trim();

    const rawStock = String(getVal("en stock", "stock", "disponible") ?? "SI").trim().toLowerCase();
    const inStock = !(rawStock === "no" || rawStock === "0" || rawStock === "false" || rawStock === "agotado");

    const rawFeatured = String(getVal("destacado", "featured") ?? "NO").trim().toLowerCase();
    const featured = rawFeatured === "si" || rawFeatured === "yes" || rawFeatured === "true" || rawFeatured === "1";

    const rawFeatures = String(getVal("caracteristicas", "features") ?? "");
    const features = rawFeatures
      ? rawFeatures.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const defaultImageType =
      type === "technology"
        ? (category.toLowerCase().includes("serv") ? "server" : "switch")
        : (category.toLowerCase().includes("cuad") ? "notebook" : "book");

    valid.push({
      name,
      type,
      category,
      price,
      previousPrice,
      brand,
      sku,
      warranty,
      description,
      fullDescription: description,
      inStock,
      available: true,
      featured,
      rating: 4.8,
      reviewsCount: 0,
      specifications: [
        `Marca: ${brand}`,
        `Categoría: ${category}`,
        `Garantía: ${warranty}`,
      ],
      features,
      imageType: defaultImageType as Product["imageType"],
      image: "",
    });
  });

  return { valid, errors, rawCount: rawRows.length };
}
