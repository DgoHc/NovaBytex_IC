/**
 * test-excel-validator.mjs
 * Pruebas automatizadas para el motor de validación de Excel (Etapa 1).
 * Ejecutable directamente con: node scripts/test-excel-validator.mjs
 */

import * as XLSX from "xlsx";
import {
  validateExcelBuffer,
  calculateSimilarity,
  levenshteinDistance,
  toTitleCase,
  sanitizeFormulaInjection,
  parsePriceWithDetails,
  findBrandStandard,
  findClosestCategory,
} from "../src/lib/excelValidator.ts";

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${detail}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n🧪 Iniciando Suite de Pruebas: Motor de Validación de Excel...\n");

  // TEST 1: Algoritmos auxiliares de texto y seguridad
  console.log("📌 Grupo 1: Algoritmos de texto, seguridad y similitud");
  
  assert(
    calculateSimilarity("Cuaderno Standford A4", "Cuaderno Stanford A4") >= 90,
    "Similitud > 90% para typos de una letra (Standford vs Stanford)"
  );

  assert(
    calculateSimilarity("Switch Cisco 24p", "Servidor Dell PowerEdge") < 40,
    "Similitud baja para productos completamente diferentes"
  );

  assert(
    toTitleCase("CUADERNO STANDFORD A4 CUADRICULADO") === "Cuaderno Standford A4 Cuadriculado",
    "Conversión correcta a formato Título respetando siglas 'A4'"
  );

  assert(
    sanitizeFormulaInjection("=SUM(A1:A10)") === "'=SUM(A1:A10)",
    "Sanitización de inyección de fórmula con prefijo '='"
  );

  assert(
    sanitizeFormulaInjection("+12345") === "'+12345",
    "Sanitización de inyección de fórmula con prefijo '+'"
  );

  assert(
    findBrandStandard("faber castell").standard === "Faber-Castell" &&
    findBrandStandard("faber castell").changed === true,
    "Unificación de marca 'faber castell' a 'Faber-Castell'"
  );

  assert(
    findClosestCategory("escrítura ", "library").category === "Escritura",
    "Sugerencia de categoría oficial 'Escritura' ante typo con tildes y espacios"
  );

  const priceParsedComma = parsePriceWithDetails("6,50");
  assert(
    priceParsedComma.value === 6.5 && priceParsedComma.hasFormatIssue === true,
    "Normalización de precio con coma '6,50' a 6.50 con aviso de formato"
  );

  const priceParsedCurrency = parsePriceWithDetails("S/ 120.00");
  assert(
    priceParsedCurrency.value === 120 && priceParsedCurrency.hasFormatIssue === true,
    "Normalización de precio con moneda 'S/ 120.00' a 120"
  );

  // TEST 2: Validación de Excel completo en memoria con casos de prueba
  console.log("\n📌 Grupo 2: Validación de Hoja Excel con Casos de Borde");

  const testHeaders = [
    "Nombre del producto",
    "Marca",
    "SKU",
    "Categoría",
    "Descripción",
    "Precio (S/)",
    "Precio Anterior",
    "En Stock",
    "Imagen",
  ];

  const testRows = [
    // Fila 2: Válida perfecta
    [
      "Cuaderno Standford A4 84HJ Cuadriculado",
      "Standford",
      "NB-STD-001",
      "Cuadernos",
      "Cuaderno escolar clásico de 84 hojas cuadriculado.",
      "6.50",
      "8.00",
      "SI",
      "https://example.com/cuaderno.jpg",
    ],
    // Fila 3: Precio cero (ERROR: PRC_ZERO)
    [
      "Folder Manila A4 con Faster x25",
      "Vinifan",
      "NB-VIN-002",
      "Archivadores",
      "Folder manila de alta resistencia para oficina.",
      "0",
      "",
      "SI",
      "",
    ],
    // Fila 4: Nombre vacío (ERROR: NAME_EMPTY)
    [
      "",
      "Pilot",
      "NB-PLT-003",
      "Escritura",
      "Bolígrafo de tinta líquida.",
      "7.50",
      "",
      "SI",
      "",
    ],
    // Fila 5: Nombre todo en mayúsculas (AVISO: NAME_ALL_CAPS) + Marca con typo (AVISO: BRD_UNIFIED)
    [
      "PLUMON RESALTADOR FABER PASTEL",
      "faber castell",
      "NB-FBR-004",
      "Escritura",
      "Resaltador punta biselada colores pastel.",
      "S/ 4,80",
      "",
      "1",
      "",
    ],
    // Fila 6: Duplicado exacto interno de la Fila 2 (DUPLICADO: DUP_INTERNAL_EXACT)
    [
      "Cuaderno Standford A4 84HJ Cuadriculado",
      "Standford",
      "NB-STD-001",
      "Cuadernos",
      "Mismo cuaderno duplicado.",
      "6.50",
      "",
      "SI",
      "",
    ],
    // Fila 7: Precio atípico extremo (AVISO: PRC_OUTLIER) + URL no HTTPS (AVISO: IMG_NOT_HTTPS)
    [
      "Borrador Blanco Escolar",
      "Artesco",
      "NB-ART-005",
      "Papelería",
      "Borrador de miga de pan para lápiz.",
      "9500.00", // Atípico para categoría papelería
      "",
      "SI",
      "http://insecure-domain.com/borrador.png",
    ],
  ];

  // Crear archivo XLSX en buffer binario
  const ws = XLSX.utils.aoa_to_sheet([testHeaders, ...testRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Librería");
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

  // Simular productos existentes en la tienda para cotejo
  const existingProductsMock = [
    {
      id: 101,
      name: "Tijera Escolar Punta Roma 5 Pulgadas",
      sku: "NB-TIJ-101",
      category: "Papelería",
      brand: "Artesco",
      price: 4.5,
      inStock: true,
      available: true,
      featured: false,
      rating: 4.5,
      reviewsCount: 0,
      description: "Tijera segura para uso escolar.",
      fullDescription: "Tijera segura.",
      specifications: [],
      features: [],
      imageType: "school",
      image: "",
      type: "library",
      createdAt: new Date().toISOString(),
    },
  ];

  const result = await validateExcelBuffer(buffer, {
    targetCatalogType: "library",
    existingProducts: existingProductsMock,
  });

  assert(result.success === true, "Procesamiento exitoso del libro Excel");
  assert(result.rows.length === 6, `Cantidad de filas analizadas correcta (esperado 6, obtenido ${result.rows.length})`);

  // Fila 2: Válida
  const row2 = result.rows[0];
  assert(row2.status === "OK", "Fila 2 es válida (status OK)");
  assert(row2.product.name === "Cuaderno Standford A4 84HJ Cuadriculado", "Nombre limpio de Fila 2");
  assert(row2.product.price === 6.5, "Precio correcto de Fila 2");

  // Fila 3: Error de precio cero
  const row3 = result.rows[1];
  assert(row3.status === "ERROR", "Fila 3 tiene status ERROR por precio 0");
  assert(row3.issues.some((i) => i.code === "PRC_ZERO"), "Código PRC_ZERO detectado en Fila 3");

  // Fila 4: Error de nombre vacío
  const row4 = result.rows[2];
  assert(row4.status === "ERROR", "Fila 4 tiene status ERROR por nombre vacío");
  assert(row4.issues.some((i) => i.code === "NAME_EMPTY"), "Código NAME_EMPTY detectado en Fila 4");

  // Fila 5: Avisos de mayúsculas y marca
  const row5 = result.rows[3];
  assert(row5.status === "AVISO", "Fila 5 tiene status AVISO");
  assert(row5.issues.some((i) => i.code === "NAME_ALL_CAPS"), "Código NAME_ALL_CAPS detectado en Fila 5");
  assert(row5.issues.some((i) => i.code === "BRD_UNIFIED"), "Código BRD_UNIFIED detectado en Fila 5");
  assert(row5.product.brand === "Faber-Castell", "Marca corregida a 'Faber-Castell'");

  // Fila 6: Duplicado interno
  const row6 = result.rows[4];
  assert(row6.status === "DUPLICADO", "Fila 6 tiene status DUPLICADO");
  assert(row6.issues.some((i) => i.code === "DUP_INTERNAL_EXACT"), "Código DUP_INTERNAL_EXACT detectado en Fila 6");
  assert(row6.duplicate?.conflictingRow === 2, "Fila en conflicto identificada como Fila 2");

  // Fila 7: Precio atípico y URL HTTP
  const row7 = result.rows[5];
  assert(row7.issues.some((i) => i.code === "PRC_OUTLIER"), "Código PRC_OUTLIER detectado para S/ 9500 en papelería");
  assert(row7.issues.some((i) => i.code === "IMG_NOT_HTTPS"), "Código IMG_NOT_HTTPS detectado");

  // Resumen
  console.log("\n📊 Métricas del Resumen:");
  console.log(`   - Filas totales: ${result.summary.totalRows}`);
  console.log(`   - Válidas: ${result.summary.validCount}`);
  console.log(`   - Avisos: ${result.summary.warningCount}`);
  console.log(`   - Errores bloqueantes: ${result.summary.errorCount}`);
  console.log(`   - Duplicados: ${result.summary.duplicateCount}`);
  console.log(`   - Mediana de precio calculada: S/ ${result.summary.priceMetrics.median}`);

  assert(result.summary.errorCount === 2, "Conteo exacto de 2 errores bloqueantes");
  assert(result.summary.duplicateCount === 1, "Conteo exacto de 1 duplicado");
  assert(result.summary.validCount >= 1, "Al menos 1 fila 100% válida");

  console.log(`\n========================================`);
  console.log(`Resultado: ${passed} pasadas, ${failed} falladas`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Error fatal en pruebas:", err);
  process.exit(1);
});
