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

/**
 * Parses an uploaded .xlsx / .xls / .csv file and validates rows.
 * Permite seleccionar el catálogo de destino (library o technology) desde la interfaz
 * para no obligar a colocar la columna "Tipo" en el archivo Excel.
 */
export async function parseExcelProducts(
  file: File,
  targetCatalogType: ImportCatalogOption = "library"
): Promise<ParsedRowResult> {
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

    const name = String(getVal("nombre", "name", "producto", "item", "descripcion corta", "titulo") ?? "").trim();
    // Único campo estrictamente requerido para crear un producto
    if (!name) {
      errors.push({ row: rowNum, reason: "Fila omitida: falta el nombre del producto", data: row });
      return;
    }

    // 1. Tipo de catálogo:
    // Si en el modal se seleccionó "library" o "technology", se asigna directamente.
    // Si se seleccionó "auto", se busca en la columna o se deduce.
    let type: CatalogType = targetCatalogType === "technology" ? "technology" : "library";
    if (targetCatalogType === "auto") {
      const rawType = String(getVal("tipo", "type", "catalogo", "seccion") ?? "").trim().toLowerCase();
      if (
        rawType.includes("tech") ||
        rawType.includes("tec") ||
        rawType.includes("ti") ||
        rawType.includes("red") ||
        rawType.includes("serv")
      ) {
        type = "technology";
      } else {
        type = "library";
      }
    } else {
      type = targetCatalogType;
    }

    // 2. Categoría (Opcional: si está vacía, default según tipo)
    const rawCat = String(getVal("categor", "cat", "rubro", "clasificacion") ?? "").trim();
    const category = rawCat || (type === "library" ? "Papelería" : "Equipos");

    // 3. Precio (Opcional: si no está, default a 0)
    const rawPrice = getVal("precio", "price", "costo", "pvp", "monto");
    const numPrice = Number(String(rawPrice).replace(/[^0-9.]/g, ""));
    const price = isNaN(numPrice) ? 0 : Math.max(0, numPrice);

    // 4. Precio anterior (Opcional: para descuentos)
    const rawPrevPrice = getVal("precio anterior", "previous", "anterior", "antes", "rebaja");
    let previousPrice: number | undefined = undefined;
    if (rawPrevPrice !== undefined && rawPrevPrice !== "") {
      const parsedPrev = Number(String(rawPrevPrice).replace(/[^0-9.]/g, ""));
      if (!isNaN(parsedPrev) && parsedPrev > price) {
        previousPrice = parsedPrev;
      }
    }

    // 5. Marca / Editorial (Opcional: default "NovaBytex")
    const brand = String(getVal("marca", "brand", "editorial", "fabricante") ?? "").trim() || "NovaBytex";

    // 6. SKU (Opcional: si no viene se autogenera)
    const rawSku = String(getVal("sku", "código", "codigo", "cod") ?? "").trim();
    const prefix = type === "library" ? "LIB" : "TECH";
    const sku = rawSku || `NB-${prefix}-${Date.now().toString().slice(-4)}-${idx + 1}`;

    // 7. Garantía (Opcional)
    const warranty = String(getVal("garant", "warranty") ?? (type === "technology" ? "1 año" : "6 meses")).trim() || "Garantía de tienda";

    // 8. Descripción (Opcional: si está vacía, se usa el nombre)
    const rawDesc = String(getVal("descrip", "detalles", "detalle", "info") ?? "").trim();
    const description = rawDesc || `${name} - Catálogo NovaBytex`;

    // 9. En Stock (Opcional: default SI)
    const rawStock = String(getVal("en stock", "stock", "disponible", "cant", "cantidad") ?? "SI").trim().toLowerCase();
    const inStock = !(rawStock === "no" || rawStock === "0" || rawStock === "false" || rawStock === "agotado");

    // 10. Destacado (Opcional: default NO)
    const rawFeatured = String(getVal("destacado", "featured", "portada", "promocion") ?? "NO").trim().toLowerCase();
    const featured = rawFeatured === "si" || rawFeatured === "yes" || rawFeatured === "true" || rawFeatured === "1";

    // 11. Características (Opcional: frases separadas por coma)
    const rawFeatures = String(getVal("caracteristicas", "features", "detalles tecnicos", "especificaciones") ?? "");
    const features = rawFeatures
      ? rawFeatures.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // 12. Imagen (Opcional: ruta local /assets/... o URL web)
    const rawImage = String(
      getVal("imagen", "image", "foto", "url imagen", "foto url", "img", "picture", "link foto") ?? ""
    ).trim();

    // 13. Tipo de icono ilustrativo (Opcional: autodeducido por nombre si no hay foto)
    const rawImageType = String(getVal("tipo imagen", "imagetype", "icono") ?? "").trim().toLowerCase();
    let defaultImageType: Product["imageType"] = "book";
    if (rawImageType) {
      defaultImageType = rawImageType as Product["imageType"];
    } else if (type === "technology") {
      defaultImageType = category.toLowerCase().includes("serv") ? "server" : "switch";
    } else {
      const lower = (name + " " + category).toLowerCase();
      if (lower.includes("cuad") || lower.includes("libret")) defaultImageType = "notebook";
      else if (lower.includes("lapic") || lower.includes("bolig")) defaultImageType = "pen";
      else if (lower.includes("lapiz") || lower.includes("lápiz")) defaultImageType = "pencil";
      else if (lower.includes("plum") || lower.includes("marcad")) defaultImageType = "marker";
      else if (lower.includes("resalt")) defaultImageType = "highlighter";
      else if (lower.includes("agend")) defaultImageType = "agenda";
      else defaultImageType = "book";
    }

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
      imageType: defaultImageType,
      image: rawImage,
    });
  });

  return { valid, errors, rawCount: rawRows.length };
}
