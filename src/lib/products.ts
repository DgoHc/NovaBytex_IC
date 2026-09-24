export type CatalogType = 'technology' | 'library';

export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  description: string;
  fullDescription: string;
  price: number;
  previousPrice?: number;
  image: string;
  inStock: boolean;
  available: boolean;
  featured: boolean;
  rating: number;
  reviewsCount: number;
  sku: string;
  warranty: string;
  specifications: string[];
  features: string[];
  imageType: 'switch' | 'server' | 'firewall' | 'laptop' | 'storage' | 'router' | 'accesspoint' | 'book' | 'notebook' | 'agenda' | 'pen' | 'marker' | 'highlighter' | 'pencil' | 'office' | 'desk' | 'school';
  type: CatalogType;
  createdAt: string;
}

export const TECHNOLOGY_CATEGORIES = ["Redes", "Servidores", "Seguridad", "Equipos", "Almacenamiento"];
export const LIBRARY_CATEGORIES = ["Papelería", "Cuadernos", "Archivadores", "Escritura", "Oficina", "Arte", "Accesorios", "Escolar"];
export const ALL_CATEGORIES = [...TECHNOLOGY_CATEGORIES, ...LIBRARY_CATEGORIES];

export const CUSTOM_CATEGORIES_KEY = "nova:custom_categories:v1";

export interface CustomCategory {
  name: string;
  type: CatalogType;
}

export function getStoredCustomCategories(): CustomCategory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCategory(category: CustomCategory): CustomCategory[] {
  const current = getStoredCustomCategories();
  if (current.some((c) => c.name.toLowerCase() === category.name.trim().toLowerCase())) {
    return current;
  }
  const next = [...current, { name: category.name.trim(), type: category.type }];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  return next;
}

export function getCategoriesForType(type: CatalogType | "all"): string[] {
  const custom = getStoredCustomCategories();
  if (type === "technology") {
    const customTech = custom.filter((c) => c.type === "technology").map((c) => c.name);
    return Array.from(new Set([...TECHNOLOGY_CATEGORIES, ...customTech]));
  }
  if (type === "library") {
    const customLib = custom.filter((c) => c.type === "library").map((c) => c.name);
    return Array.from(new Set([...LIBRARY_CATEGORIES, ...customLib]));
  }
  const customAll = custom.map((c) => c.name);
  return Array.from(new Set([...ALL_CATEGORIES, ...customAll]));
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    name: "Switch Cisco Catalyst 9200L-48P-4G",
    category: "Redes",
    brand: "Cisco",
    sku: "C9200L-48P-4G-E",
    warranty: "Garantía limitada de por vida con soporte NBD",
    description: "Switch empresarial administrable de 48 puertos Gigabit PoE+ con 4 Uplinks SFP 1G.",
    fullDescription: "El Cisco Catalyst 9200L ofrece la potencia de la red sin fronteras con seguridad integrada, resiliencia PoE+ de 740W y capacidad de apilamiento StackWise-160. Ideal para sucursales y oficinas corporativas que requieren alta disponibilidad.",
    price: 8999,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 38,
    imageType: 'switch',
    type: 'technology',
    createdAt: "2025-08-01T10:00:00.000Z",
    specifications: [
      "48 puertos 10/100/1000 Ethernet PoE+ (Budget 740W)",
      "4 puertos Uplink SFP de 1Gbps",
      "Capacidad de conmutación: 104 Gbps",
      "Tasa de reenvío: 77.38 Mpps",
      "Soporte StackWise-160 (hasta 160 Gbps de ancho de banda)",
      "Fuente de alimentación redundante opcional (PWR-C5-600WAC)",
      "Licencia Cisco DNA Essentials incluida (3 años)"
    ],
    features: [
      "Administración centralizada con Cisco DNA Center",
      "Seguridad avanzada con cifrado MACsec de 128 bits",
      "Eficiencia energética EEE (Energy Efficient Ethernet)",
      "Diseño compacto para rack de 1RU"
    ]
  },
  {
    id: 2,
    name: "Servidor Dell PowerEdge R750 Rack 2U",
    category: "Servidores",
    brand: "Dell",
    sku: "PER750-XEON-64G",
    warranty: "3 Años ProSupport 24/7 NBD Onsite",
    description: "Servidor de 2 conectores de alto rendimiento para cargas de trabajo críticas y virtualización.",
    fullDescription: "El Dell PowerEdge R750 con procesadores Intel Xeon Scalable de 3ª generación es el servidor empresarial ideal para virtualización VMware/Hyper-V, bases de datos SQL/Oracle y analítica de datos a gran escala.",
    price: 25999,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 24,
    imageType: 'server',
    type: 'technology',
    createdAt: "2025-08-02T10:00:00.000Z",
    specifications: [
      "2x Procesadores Intel Xeon Gold 6330 (28 núcleos / 56 hilos a 2.0GHz)",
      "64 GB RAM DDR4 ECC Registered (Expandible a 8TB en 32 slots)",
      "2x 960GB SSD Enterprise NVMe + 4x 2.4TB SAS 10K RPM",
      "Controladora RAID PERC H755 Frontal con 8GB Cache NVRAM",
      "Fuentes redundantes Hot-Plug de 1400W 80 Plus Titanium",
      "iDRAC9 Enterprise con control remoto de consola HTML5",
      "4x Puertos 10GbE SFP+ + 2x Puertos 1GbE RJ45"
    ],
    features: [
      "Seguridad con Cryptographic Root of Trust y System Lockdown",
      "Optimizador térmico de flujo de aire asistido por IA",
      "Soporte para aceleración por GPUs doble ancho",
      "Chasis rackeable 2U con rieles deslizantes con brazo portacables"
    ]
  },
  {
    id: 3,
    name: "Firewall Fortinet FortiGate 100F NGFW",
    category: "Seguridad",
    brand: "Fortinet",
    sku: "FG-100F-BDL-950-36",
    warranty: "3 Años FortiCare Premium + FortiGuard UTP",
    description: "Firewall de próxima generación con protección SD-WAN segura integrada para medianas y grandes empresas.",
    fullDescription: "El FortiGate 100F combina firewall inspeccionado por hardware SPU ASIC SP5, IPS de 1 Gbps, antivirus en línea, inspección SSL profunda y conectividad SD-WAN de alto rendimiento en una solución rentable de 1U.",
    price: 12599,
    previousPrice: 14299,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.8,
    reviewsCount: 42,
    imageType: 'firewall',
    type: 'technology',
    createdAt: "2025-08-03T10:00:00.000Z",
    specifications: [
      "Rendimiento Firewall: 20 Gbps (latencia ultra baja 3 μs)",
      "Rendimiento IPS: 2.6 Gbps | NGFW: 1.6 Gbps | Threat Protection: 1 Gbps",
      "22 puertos Ethernet: 16x GE RJ45, 2x Shared Port, 4x SFP slots, 2x 10GE SFP+",
      "Procesadores dedicados de contenido y red SOC4",
      "Hasta 500 VPN Tunnels IPsec simultáneos",
      "Almacenamiento interno SSD de 64 GB para logs e inspección",
      "Fuentes de alimentación duales redundantes integradas"
    ],
    features: [
      "Security Fabric automatizado con aislamiento de amenazas",
      "Prevención de filtrado web impulsada por Inteligencia Artificial",
      "Filtrado DNS y reputación de IPs maliciosas en tiempo real",
      "Zero-Touch Provisioning para despliegues remotos rapidos"
    ]
  },
  {
    id: 4,
    name: "Laptop Lenovo ThinkPad X1 Carbon Gen 11",
    category: "Equipos",
    brand: "Lenovo",
    sku: "21HM005CLM",
    warranty: "3 Años Premier Support Onsite con cobertura accidental",
    description: "Ultrabook empresarial de fibra de carbono ligera de 1.12 kg con Intel Evo Core i7 de 13a Gen.",
    fullDescription: "Diseñada para ejecutivos y profesionales móviles, la ThinkPad X1 Carbon Gen 11 combina una pantalla táctil 2.8K OLED, teclado legendario resistente a derrames y seguridad biométrica con certificación militar MIL-STD-810H.",
    price: 9499,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 56,
    imageType: 'laptop',
    type: 'technology',
    createdAt: "2025-08-04T10:00:00.000Z",
    specifications: [
      "Procesador Intel Core i7-1365U vPro (10 núcleos, hasta 5.2 GHz)",
      "32 GB RAM LPDDR5 6400MHz integrada",
      "1 TB SSD M.2 NVMe PCIe 4.0 Opal 2.0 Cifrado",
      "Pantalla 14\" WUXGA (1920x1200) IPS Anti-reflejo 400 nits Low Power",
      "Gráficos Intel Iris Xe integrados",
      "Conectividad Wi-Fi 6E AX211 + Bluetooth 5.1 + Módem 4G LTE opcional",
      "Teclado retroiluminado en español con TrackPoint y Touchpad de vidrio"
    ],
    features: [
      "Camara FHD IR con obturador de privacidad ThinkShutter",
      "Lector de huella dactilar integrado en botón de encendido",
      "Audio Dolby Atmos con 4 micrófonos de cancelación de ruido por IA",
      "Batería de 57Wh con carga rápida (80% en 60 minutos)"
    ]
  },
  {
    id: 5,
    name: "Switch HP Aruba CX 6100 24G 4SFP+",
    category: "Redes",
    brand: "HP",
    sku: "JL678A",
    warranty: "Garantía de por vida limitada Aruba",
    description: "Switch administrable Layer 2+ de 24 Puertos Gigabit con 4 puertos de enlace ascendente 10G SFP+.",
    fullDescription: "La serie Aruba CX 6100 ofrece acceso simplificado y seguro con la arquitectura Aruba AOS-CX. Cuenta con análisis integrado en tiempo real y configuración basada en API REST para automatización de red moderna.",
    price: 5499,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 19,
    imageType: 'switch',
    type: 'technology',
    createdAt: "2025-08-05T10:00:00.000Z",
    specifications: [
      "24x Puertos 10/100/1000BASE-T RJ45",
      "4x Puertos 1G/10G SFP+ Uplinks para fibra óptica",
      "Capacidad de switching: 128 Gbps | Rendimiento: 95.2 Mpps",
      "Sistema operativo de grado empresarial Aruba AOS-CX",
      "Gestión en la nube con Aruba Central o Local por CLI / Web UI",
      "Consumo de energía eficiente silencioso (sin ventiladores)",
      "Soporte ACLs IPv4/IPv6, QoS y Snooping DHCP"
    ],
    features: [
      "Monitoreo proactivo con Aruba Network Analytics Engine (NAE)",
      "Configuración rápida vía Aruba CX Mobile App",
      "Flexibilidad de montaje en gabinete rack de 19 pulgadas",
      "Seguridad port-based IEEE 802.1X y MAC Authentication"
    ]
  },
  {
    id: 6,
    name: "Sistema de Almacenamiento Dell PowerStore 500T",
    category: "Almacenamiento",
    brand: "Dell",
    sku: "PSTORE-500T-NVME",
    warranty: "3 Años ProSupport Plus 4 Horas Onsite 24/7",
    description: "Almacenamiento All-Flash NVMe unificado para cargas de trabajo SAN y NAS de máxima velocidad.",
    fullDescription: "Dell PowerStore 500T ofrece rendimiento All-Flash con arquitectura centrada en datos, deduplicación y compresión sin impacto garantizada 4:1. Perfecto para consolidación de servidores, bases de datos y entornos multiprotocolo.",
    price: 48999,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 5.0,
    reviewsCount: 12,
    imageType: 'storage',
    type: 'technology',
    createdAt: "2025-08-06T10:00:00.000Z",
    specifications: [
      "Arquitectura Dual Active-Active Controller (2x Intel Xeon por nodo)",
      "Capacidad base: 25 TB All-Flash NVMe (Escalable a más de 1.2 PB efectivos)",
      "Soporte de protocolos Block (FC, iSCSI, NVMe-oF) y File (NFS, SMB)",
      "2x Puertos iSCSI/File de 25GbE Optical por controlador",
      "Compresión y Deduplicación en línea hardware-accelerated",
      "Protección de datos mediante Snapshots asíncronos y Replicación nativa",
      "Integración nativa con VMware vSphere vVols y Kubernetes CSI"
    ],
    features: [
      "Analítica predictiva de salud de almacenamiento con CloudIQ",
      "Migración de datos sin interrupciones desde plataformas legacy",
      "Arquitectura de contenedor modular AppsON para ejecutar VMs internas",
      "Chasis 2U con 25 bahías NVMe de 2.5 pulgadas"
    ]
  },
  {
    id: 7,
    name: "Access Point Ubiquiti UniFi U6 Pro Enterprise",
    category: "Redes",
    brand: "Ubiquiti",
    sku: "U6-PRO",
    warranty: "2 Años de garantía directa",
    description: "Access Point Wi-Fi 6 de banda dual y alto rendimiento para más de 300 clientes simultáneos.",
    fullDescription: "El UniFi U6 Pro es un punto de acceso Wi-Fi 6 (802.11ax) diseñado para entornos corporativos de alta densidad. Con tecnología 4x4 MU-MIMO en 5GHz y 2x2 en 2.4GHz, alcanza tasas agregadas de hasta 5.3 Gbps.",
    price: 1199,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 88,
    imageType: 'accesspoint',
    type: 'technology',
    createdAt: "2025-08-07T10:00:00.000Z",
    specifications: [
      "Tecnología Wi-Fi 6 (802.11ax) de doble banda",
      "Banda de 5 GHz: 4x4 MU-MIMO y OFDMA (Tasa de hasta 4.8 Gbps)",
      "Banda de 2.4 GHz: 2x2 MIMO (Tasa de hasta 573.5 Mbps)",
      "1x Puerto Ethernet 1 GbE RJ45 con soporte PoE+ 802.3at",
      "Carcasa con protección IP54 resistente al polvo y salpicaduras",
      "Gestión centralizada mediante UniFi Network Controller",
      "Soporte para más de 300 conexiones simultáneas"
    ],
    features: [
      "Aislamiento de tráfico de invitados y roaming rápido 802.11r/k/v",
      "Montaje elegante en techo o pared con kit incluido",
      "Monitoreo de espectro RF en tiempo real y optimización de canales",
      "Creación de portales cautivos personalizados con voucher y social login"
    ]
  },
  {
    id: 8,
    name: "Router Mikrotik CCR2004-16G-2S+ Cloud Core",
    category: "Redes",
    brand: "Mikrotik",
    sku: "CCR2004-16G-2S+",
    warranty: "2 Años de garantía",
    description: "Router de alto rendimiento de 16 puertos Gigabit con 2 puertos 10G SFP+ y procesador 64-bit Quad Core.",
    fullDescription: "Diseñado para proveedores de servicios e ISPs locales, el Mikrotik CCR2004 ofrece la mejor relación costo-rendimiento por núcleo. Cuenta con RouterOS v7 nivel 6, fuentes de alimentación dobles redundantes y gabinete rack de 1U.",
    price: 2899,
    previousPrice: 3199,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 31,
    imageType: 'router',
    type: 'technology',
    createdAt: "2025-08-08T10:00:00.000Z",
    specifications: [
      "Procesador Annapurna Labs AL32400 Quad Core 1.7 GHz ARM 64bit",
      "4 GB RAM DDR4 + 128 MB Almacenamiento NAND",
      "16x Puertos 10/100/1000 Mbit/s Ethernet RJ45",
      "2x Puertos 10G SFP+ para módulos transceptores de fibra",
      "Licencia RouterOS v7 Level 6 (BGP, OSPF, MPLS, WireGuard, IPsec)",
      "2x Fuentes de alimentación AC redundantes Hot-Swap (100-240V)",
      "Puerto de consola RJ45 para gestión fuera de banda"
    ],
    features: [
      "Rendimiento de enrutamiento wire-speed de hasta 15 Gbps",
      "Aceleración por hardware para túneles IPsec",
      "Monitoreo de temperatura, voltaje y velocidad de ventiladores",
      "Diseño de bajo consumo energético (Máx 48W)"
    ]
  },
  {
    id: 101,
    name: "Papel Fotocopia Bond Report A4 75g (Empaque 500 Hojas)",
    category: "Papelería",
    brand: "Report",
    sku: "LIB-PAP-REP-75A4",
    warranty: "Garantía de calidad de fábrica",
    description: "Paquete de 500 hojas de papel bond A4 de 75 gramos de alta blancura y absorción homogénea para impresoras y fotocopiadoras.",
    fullDescription: "El papel bond Report A4 de 75g es el estándar corporativo preferido en oficinas y colegios del Perú. Producido con tecnología que minimiza atascos en impresoras láser, inkjet y fotocopiadoras de alta velocidad, garantizando impresiones nítidas en blanco y negro o color.",
    price: 16.5,
    previousPrice: 19.0,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 320,
    imageType: 'office',
    type: 'library',
    createdAt: "2025-09-10T10:00:00.000Z",
    specifications: [
      "Tamaño: A4 estándar (210 x 297 mm)",
      "Gramaje: 75 g/m²",
      "Contenido: Empaque termosellado de 500 hojas",
      "Blancura: 98% ISO de alta reflectancia",
      "Uso: Fotocopiado, impresión láser e inyección de tinta",
      "Ecológico: Fabricado con pulpa de celulosa libre de cloro"
    ],
    features: [
      "Cero atascos en impresoras de alta demanda",
      "Excelente nitidez de texto y gráficos",
      "Secado rápido para impresiones a color",
      "Papel suave antideslumbrante para lectura cómoda"
    ]
  },
  {
    id: 102,
    name: "Cuaderno Cuadriculado Stanford Colegial 100 Hojas",
    category: "Cuadernos",
    brand: "Stanford",
    sku: "LIB-CUA-STAN-100C",
    warranty: "Garantía contra defectos de imprenta",
    description: "Cuaderno colegial cuadriculado de 100 hojas con carátula plastificada brillante, diseño ergonómico y grapas de seguridad.",
    fullDescription: "El cuaderno Stanford es el tradicional de las aulas y academias en el Perú. Sus hojas cuadriculadas con cuadrícula de 4.5 mm están impresas con líneas guías nítidas en papel bond blanco grueso que no traspasa la tinta de lapiceros ni plumones escolares.",
    price: 6.5,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.8,
    reviewsCount: 142,
    imageType: 'notebook',
    type: 'library',
    createdAt: "2025-09-11T10:00:00.000Z",
    specifications: [
      "Formato: Colegial estándar (16 x 21 cm)",
      "Hojas: 100 hojas bond cuadriculadas 65g",
      "Cuadrícula: 4.5 mm clásica",
      "Encuadernación: Doble grapa metálica reforzada",
      "Carátula: Cartulina dúplex plastificada con filtro UV",
      "Incluye: Carátula para datos personales, horario y stickers guías"
    ],
    features: [
      "Papel de alta resistencia a borradores",
      "Bordes redondeados de protección",
      "No se trasluce la tinta líquida",
      "Diseños modernos y sobrios para oficina y estudio"
    ]
  },
  {
    id: 103,
    name: "Cuaderno Universitario Espiral A4 100 Hojas Stanford",
    category: "Cuadernos",
    brand: "Stanford",
    sku: "LIB-CUA-STAN-A4ESP",
    warranty: "Garantía de fabricante",
    description: "Cuaderno espiral universitario tamaño A4 con hojas cuadriculadas de 75g y tapa dura plastificada de alta resistencia.",
    fullDescription: "Diseñado para universitarios, técnicos y profesionales. Cuenta con anillado espiral metálico continuo que permite abrir 360 grados sin atascos, microperforado para arrancar hojas limpias y bolsillo de plástico transparente para documentos sueltos.",
    price: 8.5,
    previousPrice: 10.5,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 215,
    imageType: 'notebook',
    type: 'library',
    createdAt: "2025-09-12T10:00:00.000Z",
    specifications: [
      "Formato: A4 universitario (21.5 x 28 cm)",
      "Hojas: 100 hojas bond de 75g cuadriculadas",
      "Encuadernación: Espiral metálico con cierre de seguridad",
      "Tapa: Cartón prensado duro con acabado mate y barniz sectorizado",
      "Bolsillo interior transparente porta-documentos",
      "Hojas microperforadas de fácil desprendimiento"
    ],
    features: [
      "Apertura plana total en 180° y 360°",
      "Papel grueso apto para resaltadores y plumas",
      "Separadores interiores removibles con pestaña",
      "Esquinas protegidas contra dobleces"
    ]
  },
  {
    id: 104,
    name: "Caja de Lapiceros Faber-Castell Trilux 032 Medium x 12 (Azul)",
    category: "Escritura",
    brand: "Faber-Castell",
    sku: "LIB-LAP-FC-TRILUX",
    warranty: "Garantía de tinta indeleble",
    description: "Caja de 12 bolígrafos clásicos de tinta indeleble suave con cuerpo triangular ergonómico antideslizante y punta metálica 1.0mm.",
    fullDescription: "El bolígrafo más vendido y reconocido en todo el Perú. Su punta de carburo de tungsteno ofrece un trazo uniforme sin manchar ni gotear. Su forma triangular ergonómica permite escribir durante horas sin fatiga en la mano.",
    price: 12.0,
    previousPrice: 15.0,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 450,
    imageType: 'pen',
    type: 'library',
    createdAt: "2025-09-13T10:00:00.000Z",
    specifications: [
      "Contenido: Caja con 12 bolígrafos",
      "Color de tinta: Azul intenso indeleble",
      "Punta: Mediana 1.0 mm de carburo de tungsteno",
      "Cuerpo: Triangular ergonómico antifatiga",
      "Tapa: Ventilada con clip de sujeción",
      "Rendimiento: Más de 1,500 metros de escritura fluida"
    ],
    features: [
      "Tinta no tóxica de secado inmediato",
      "No deja grumos ni mancha la mano",
      "Apto para firmas oficiales y exámenes",
      "Cuerpo translúcido que permite ver el nivel de tinta"
    ]
  },
  {
    id: 105,
    name: "Archivador de Palanca A4 Lomo Ancho Vinifan",
    category: "Archivadores",
    brand: "Vinifan",
    sku: "LIB-ARC-VIN-A4LA",
    warranty: "Garantía de mecanismo 1 año",
    description: "Archivador de palanca tamaño A4 con lomo ancho de 8 cm, cantoneras metálicas de protección y compresor niquelado de alta capacidad.",
    fullDescription: "El archivador estándar para contabilidad, administración y archivo general en empresas peruanas. Fabricado en cartón prensado reforzado de gran resistencia, forrado en polipropileno lavable que no absorbe humedad ni grasa.",
    price: 10.5,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 180,
    imageType: 'office',
    type: 'library',
    createdAt: "2025-09-14T10:00:00.000Z",
    specifications: [
      "Tamaño: A4 (32 x 28.5 cm)",
      "Lomo: Ancho de 80 mm (capacidad ~500 hojas bond)",
      "Mecanismo: Palanca niquelada con seguro compresor",
      "Protección: Cantoneras metálicas niqueladas en bordes inferiores",
      "Ojal metálico de extracción en lomo",
      "Tarjetero con etiqueta intercambiable en el lomo"
    ],
    features: [
      "Resistente al uso diario y manipulación continua",
      "Cierre de anillas de alta precisión",
      "Plastificado impermeable fácil de limpiar",
      "Ideal para archivo contable, legal y administrativo"
    ]
  },
  {
    id: 106,
    name: "Set de Resaltadores Faber-Castell Textliner 46 Pastel x 6",
    category: "Escritura",
    brand: "Faber-Castell",
    sku: "LIB-RES-FC-PASTEL",
    warranty: "Garantía de tinta 6 meses",
    description: "Estuche de 6 resaltadores en tonos pastel suaves a la vista, punta biselada para 3 anchos de trazo y tinta a base de agua.",
    fullDescription: "Resaltadores premium que no fatigan la vista al estudiar o revisar documentos extensos. Su tinta a base de agua no traspasa las hojas finas de papel bond ni apuntes de lapicero, ofreciendo trazos limpios de 1, 2 y 5 mm.",
    price: 18.5,
    previousPrice: 22.0,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 230,
    imageType: 'highlighter',
    type: 'library',
    createdAt: "2025-09-15T10:00:00.000Z",
    specifications: [
      "Colores: 6 tonos pastel (amarillo vainilla, rosa pastel, lila, menta, turquesa, durazno)",
      "Punta: Biselada de poliéster de 3 grosores (1 mm, 2 mm y 5 mm)",
      "Tinta: Base agua ecológica libre de solventes",
      "Presentación: Estuche plástico reutilizable",
      "Apto para papel bond, térmico de fax y fotocopias"
    ],
    features: [
      "No mancha el reverso de la página",
      "No corre la tinta de bolígrafos ni textos impresos",
      "Cuerpo ergonómico plano antirodadura",
      "Gran depósito de tinta para larga duración"
    ]
  },
  {
    id: 107,
    name: "Plumones para Pizarra Acrílica Artesco x 4 Colores Surtidos",
    category: "Escritura",
    brand: "Artesco",
    sku: "LIB-PLU-ART-PIZ",
    warranty: "Garantía de fábrica",
    description: "Pack de 4 plumones recargables de borrado en seco (negro, azul, rojo y verde) con punta redonda acrílica indeformable.",
    fullDescription: "Imprescindible en salas de reuniones corporativas, colegios e institutos. Tinta de secado rápido que se borra con facilidad usando franela o borrador de mota sin dejar sombras ni marcas residuales en la pizarra.",
    price: 14.0,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 112,
    imageType: 'marker',
    type: 'library',
    createdAt: "2025-09-16T10:00:00.000Z",
    specifications: [
      "Contenido: 4 unidades (negro, azul, rojo, verde)",
      "Punta: Redonda resistente de 3.0 mm",
      "Tinta: Alcohólica de bajo olor y secado ultra rápido",
      "Superficie: Pizarra blanca acrílica, vidrio y melamina no porosa",
      "Borrable: En seco con mota o paño suave"
    ],
    features: [
      "Colores intensos de alta visibilidad a distancia",
      "No deja manchas permanentes en la pizarra",
      "Tapa hermética con clip que previene secado",
      "Libre de xileno y tolueno"
    ]
  },
  {
    id: 108,
    name: "Paquete de Fólderes Manila A4 con Faster Artesco x 25",
    category: "Oficina",
    brand: "Artesco",
    sku: "LIB-FOL-MAN-A4X25",
    warranty: "Garantía de calidad",
    description: "Pack de 25 fólderes manila calibre grueso tamaño A4 con pestaña superior y juego de 25 broches faster metálicos.",
    fullDescription: "El fólder manila clásico utilizado para expedientes, trámites documentarios, licitaciones y legajos de personal en el Perú. Fabricado en cartulina manila pesada de 180 gramos que resiste el uso continuo en mesa de partes.",
    price: 15.0,
    previousPrice: 18.0,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 95,
    imageType: 'office',
    type: 'library',
    createdAt: "2025-09-17T10:00:00.000Z",
    specifications: [
      "Cantidad: 25 fólderes manila + 25 faster metálicos de 8 cm",
      "Tamaño: A4 estándar para hojas de 21 x 29.7 cm",
      "Material: Cartulina manila calibre 180 g/m²",
      "Pestaña: Superior escalonada para rotulación con marcador o etiqueta",
      "Perforación: Guías troqueladas para colocación precisa del faster"
    ],
    features: [
      "Cartulina gruesa no quebradiza",
      "Broches faster niquelados anticorrosión",
      "Ideal para trámites notariales, judiciales y administrativos",
      "Paquete sellado termoencogido"
    ]
  },
  {
    id: 109,
    name: "Caja de Marcadores Permanentes Sharpie Fine Point x 12 (Negro)",
    category: "Arte",
    brand: "Sharpie",
    sku: "LIB-MAR-SHA-FINE12",
    warranty: "Garantía de tinta 1 año",
    description: "Caja de 12 marcadores permanentes de punta fina con tinta indeleble de alta adherencia sobre cartón, plástico, metal y madera.",
    fullDescription: "El marcador permanente por excelencia en almacenes, logística y oficinas. Escribe de forma permanente sobre cualquier superficie no grasa, resistente al agua y a la decoloración solar. Certificado AP no tóxico.",
    price: 42.0,
    previousPrice: 48.0,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.9,
    reviewsCount: 168,
    imageType: 'marker',
    type: 'library',
    createdAt: "2025-09-18T10:00:00.000Z",
    specifications: [
      "Contenido: Caja x 12 unidades color negro",
      "Punta: Fina de fibra sintética 1.0 mm",
      "Tinta: Base alcohol indeleble permanente",
      "Secado: Menos de 2 segundos",
      "Superficies: Cartón corrugado, bolsas plásticas, cintas, madera, metal",
      "Certificación: AP no tóxico conforme a norma ASTM D-4236"
    ],
    features: [
      "Resistente a la intemperie y humedad",
      "Trazo negro intenso que no se decolora",
      "Cuerpo delgado fácil de manipular",
      "Imprescindible en empaque, rotulado y logística"
    ]
  },
  {
    id: 110,
    name: "Tacos de Notas Adhesivas 3x3 Artesco Neon x 400 Hojas",
    category: "Oficina",
    brand: "Artesco",
    sku: "LIB-NOT-POST-3X3",
    warranty: "Garantía de adhesivo",
    description: "Taco de notas autoadhesivas reposicionables en 4 colores neón brillantes (76 x 76 mm) que no dejan residuos al despegar.",
    fullDescription: "Ideales para recordatorios rápidos en pantallas, escritorios, agendas y carpetas. El adhesivo de alta calidad se pega y despega múltiples veces sin rasgar el papel ni dejar huella pegajosa.",
    price: 9.5,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 88,
    imageType: 'office',
    type: 'library',
    createdAt: "2025-09-19T10:00:00.000Z",
    specifications: [
      "Tamaño: 76 x 76 mm (3 x 3 pulgadas)",
      "Contenido: 400 hojas (4 bloques de 100 hojas)",
      "Colores: Amarillo neón, rosado fucsia, verde lima, naranja neón",
      "Gramaje: 75 g/m² bond coloreado en masa",
      "Adhesivo: Franja superior reposicionable al agua"
    ],
    features: [
      "Se adhiere firmemente a pantallas, escritorios y papel",
      "Despegado limpio sin manchas",
      "Colores de alto contraste imposibles de ignorar",
      "Compatible con lapiceros de gel, bolígrafos y lápiz"
    ]
  },
  {
    id: 111,
    name: "Tijera de Oficina Acero Inoxidable Artesco 7 Pulgadas",
    category: "Accesorios",
    brand: "Artesco",
    sku: "LIB-TIJ-ART-7PUL",
    warranty: "Garantía de filo 1 año",
    description: "Tijera de 7 pulgadas con hojas de acero inoxidable templado de filo duradero y mango ergonómico soft-touch para corte preciso.",
    fullDescription: "Diseñada para uso continuo en oficina y almacén. Corta fácilmente papel, cartón grueso, cintas adhesivas y telas con suavidad gracias a su tornillo central ajustable y mango con recubrimiento de goma antifatiga.",
    price: 7.5,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 135,
    imageType: 'desk',
    type: 'library',
    createdAt: "2025-09-20T10:00:00.000Z",
    specifications: [
      "Medida: 7 pulgadas (17.8 cm)",
      "Hojas: Acero inoxidable quirúrgico templado",
      "Mango: Polipropileno con inserción de caucho suave ergonómico",
      "Punta: Semi-roma de seguridad",
      "Uso: Ambidiestro"
    ],
    features: [
      "Filo rectificado de larga duración",
      "Corte limpio sin atascos en cinta adhesiva",
      "Agarre cómodo que evita ampollas o fatiga",
      "Resistente a la oxidación"
    ]
  },
  {
    id: 112,
    name: "Engrapadora Metálica de Oficina Artesco 24/6 + Caja de Grapas",
    category: "Oficina",
    brand: "Artesco",
    sku: "LIB-ENG-ART-246",
    warranty: "Garantía 1 año",
    description: "Engrapadora metálica de sobremesa para hasta 25 hojas bond, con base antideslizante, yunque giratorio y caja de 1000 grapas 26/6.",
    fullDescription: "Herramienta indispensable en escritorios administrativos. Mecanismo de acero templado con resorte de alta precisión que evita atascos de grapas. Su yunque giratorio permite tanto engrapado cerrado permanente como abierto temporal.",
    price: 19.5,
    previousPrice: 24.0,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 160,
    imageType: 'office',
    type: 'library',
    createdAt: "2025-09-21T10:00:00.000Z",
    specifications: [
      "Capacidad de grapado: Hasta 25 hojas de 75g",
      "Compatibilidad: Grapas 24/6 y 26/6",
      "Cuerpo: Chasis 100% de acero con recubrimiento esmaltado",
      "Base: Goma antideslizante protectora de mesas",
      "Mecanismo: Yunque de doble función (engrapado y clavado)",
      "Incluye: 1 caja de 1,000 grapas de alambre galvanizado 26/6"
    ],
    features: [
      "Mecanismo anti-atasco con resorte guiado",
      "Recarga rápida superior",
      "Construcción duradera de uso pesado",
      "Diseño compacto y elegante para escritorio"
    ]
  }
];
