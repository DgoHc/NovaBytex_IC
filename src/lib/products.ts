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
  gallery?: string[];
  inStock: boolean;
  available: boolean;
  featured: boolean;
  rating: number;
  reviewsCount: number;
  sku: string;
  warranty: string;
  specifications: string[];
  features: string[];
  imageType: 'switch' | 'server' | 'firewall' | 'laptop' | 'storage' | 'router' | 'accesspoint' | 'book' | 'notebook' | 'agenda' | 'pen' | 'marker' | 'highlighter' | 'pencil' | 'office' | 'desk' | 'school' | 'software';
  type: CatalogType;
  techSubtype?: 'hardware' | 'license';
  createdAt: string;
}

export const HARDWARE_CATEGORIES = ["Redes", "Servidores", "Seguridad", "Equipos", "Almacenamiento"];
export const LICENSE_CATEGORIES = ["Licencias & Software", "Suscripciones Cloud", "Sistemas Operativos", "Seguridad & Antivirus"];
export const TECHNOLOGY_CATEGORIES = [...HARDWARE_CATEGORIES, ...LICENSE_CATEGORIES];
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
    available: false,
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
    available: false,
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
    available: false,
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
    available: false,
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
    available: false,
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
    available: false,
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
    available: false,
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
    available: false,
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
    name: "Papel Fotocopia Bond Report A4 75g (Caja x 5 Empaques)",
    category: "Papelería",
    brand: "Report",
    sku: "LIB-PAP-REP-75A4-CJ",
    warranty: "Garantía de calidad de fábrica",
    description: "Caja con 5 millares (2,500 hojas) de papel bond A4 75g.",
    fullDescription: "El papel bond Report A4 de 75g es el estándar corporativo preferido en oficinas y colegios del Perú. Producido con tecnología que minimiza atascos en impresoras láser, inkjet y fotocopiadoras de alta velocidad, garantizando impresiones nítidas en blanco y negro o color.",
    price: 85.0,
    previousPrice: 98.0,
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
      "Contenido: Caja con 5 empaques termosellados (2,500 hojas)",
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
    name: "Cuaderno Cuadriculado Stanford Colegial 100H (Pack x 5)",
    category: "Cuadernos",
    brand: "Stanford",
    sku: "LIB-CUA-STAN-100CX5",
    warranty: "Garantía contra defectos de imprenta",
    description: "Pack de 5 cuadernos cuadriculados de 100 hojas colegial.",
    fullDescription: "El cuaderno Stanford es el tradicional de las aulas y academias en el Perú. Sus hojas cuadriculadas con cuadrícula de 4.5 mm están impresas con líneas guías nítidas en papel bond blanco grueso que no traspasa la tinta de lapiceros ni plumones escolares.",
    price: 32.5,
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
      "Contenido: Pack x 5 cuadernos",
      "Hojas: 100 hojas bond cuadriculadas 65g",
      "Cuadrícula: 4.5 mm clásica",
      "Encuadernación: Doble grapa metálica reforzada",
      "Carátula: Cartulina dúplex plastificada con filtro UV"
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
    name: "Cuaderno Universitario Espiral A4 100 Hojas Stanford (Pack x 3)",
    category: "Cuadernos",
    brand: "Stanford",
    sku: "LIB-CUA-STAN-A4ESPX3",
    warranty: "Garantía de fabricante",
    description: "Pack de 3 cuadernos espiral A4 de 100 hojas Stanford.",
    fullDescription: "Diseñado para universitarios, técnicos y profesionales. Cuenta con anillado espiral metálico continuo que permite abrir 360 grados sin atascos, microperforado para arrancar hojas limpias y bolsillo de plástico transparente para documentos sueltos.",
    price: 25.5,
    previousPrice: 30.0,
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
      "Contenido: Pack x 3 cuadernos",
      "Hojas: 100 hojas bond de 75g cuadriculadas",
      "Encuadernación: Espiral metálico con cierre de seguridad",
      "Tapa: Cartón prensado duro con acabado mate y barniz sectorizado",
      "Bolsillo interior transparente porta-documentos"
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
    name: "Caja de Lapiceros Faber-Castell Trilux 032 Medium x 50 (Azul)",
    category: "Escritura",
    brand: "Faber-Castell",
    sku: "LIB-LAP-FC-TRILUX50",
    warranty: "Garantía de tinta indeleble",
    description: "Caja con 50 bolígrafos punta media 1.0 mm color azul.",
    fullDescription: "El bolígrafo más vendido y reconocido en todo el Perú. Su punta de carburo de tungsteno ofrece un trazo uniforme sin manchar ni gotear. Su forma triangular ergonómica permite escribir durante horas sin fatiga en la mano.",
    price: 48.0,
    previousPrice: 55.0,
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
      "Contenido: Caja con 50 bolígrafos",
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
    name: "Archivador de Palanca A4 Lomo Ancho Vinifan (Pack x 3)",
    category: "Archivadores",
    brand: "Vinifan",
    sku: "LIB-ARC-VIN-A4LAX3",
    warranty: "Garantía de mecanismo 1 año",
    description: "Pack de 3 archivadores A4 con lomo ancho de 8 cm.",
    fullDescription: "El archivador estándar para contabilidad, administración y archivo general en empresas peruanas. Fabricado en cartón prensado reforzado de gran resistencia, forrado en polipropileno lavable que no absorbe humedad ni grasa.",
    price: 31.5,
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
      "Contenido: 3 archivadores palanca A4",
      "Tamaño: A4 (32 x 28.5 cm)",
      "Lomo: Ancho de 80 mm (capacidad ~500 hojas bond)",
      "Mecanismo: Palanca niquelada con seguro compresor",
      "Protección: Cantoneras metálicas niqueladas en bordes inferiores"
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
    description: "Estuche de 6 resaltadores en tonos pastel punta bisel.",
    fullDescription: "Resaltadores premium que no fatigan la vista al estudiar o revisar documentos extensos. Su tinta a base de agua no traspasa las hojas finas de papel bond ni apuntes de lapicero, ofreciendo trazos limpios de 1, 2 y 5 mm.",
    price: 24.5,
    previousPrice: 28.0,
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
      "Colores: 6 tonos pastel",
      "Punta: Biselada de poliéster de 3 grosores",
      "Tinta: Base agua ecológica libre de solventes",
      "Presentación: Estuche plástico reutilizable"
    ],
    features: [
      "No mancha el reverso de la página",
      "No corre la tinta de bolígrafos",
      "Cuerpo ergonómico plano antirodadura",
      "Gran depósito de tinta para larga duración"
    ]
  },
  {
    id: 107,
    name: "Plumones para Pizarra Acrílica Artesco x 8 Colores + Mota",
    category: "Escritura",
    brand: "Artesco",
    sku: "LIB-PLU-ART-PIZ8",
    warranty: "Garantía de fábrica",
    description: "Set de 8 plumones de pizarra surtidos con mota imantada.",
    fullDescription: "Imprescindible en salas de reuniones corporativas, colegios e institutos. Tinta de secado rápido que se borra con facilidad usando franela o borrador de mota sin dejar sombras ni marcas residuales en la pizarra.",
    price: 28.0,
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
      "Contenido: 8 plumones + 1 mota magnética",
      "Punta: Redonda resistente de 3.0 mm",
      "Tinta: Alcohólica de bajo olor y secado ultra rápido"
    ],
    features: [
      "Colores intensos de alta visibilidad",
      "No deja manchas permanentes",
      "Tapa hermética con clip",
      "Libre de xileno y tolueno"
    ]
  },
  {
    id: 108,
    name: "Paquete de Fólderes Manila A4 con Faster Artesco x 50",
    category: "Oficina",
    brand: "Artesco",
    sku: "LIB-FOL-MAN-A4X50",
    warranty: "Garantía de calidad",
    description: "50 fólderes manila A4 con 50 broches faster metálicos.",
    fullDescription: "El fólder manila clásico utilizado para expedientes, trámites documentarios, licitaciones y legajos de personal en el Perú.",
    price: 25.0,
    previousPrice: 29.0,
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
      "Cantidad: 50 fólderes manila + 50 faster metálicos",
      "Tamaño: A4 estándar",
      "Material: Cartulina manila calibre 180 g/m²"
    ],
    features: [
      "Cartulina gruesa no quebradiza",
      "Broches faster niquelados anticorrosión",
      "Ideal para trámites y archivo"
    ]
  },
  {
    id: 109,
    name: "Caja de Marcadores Permanentes Sharpie Fine Point x 12 (Negro)",
    category: "Arte",
    brand: "Sharpie",
    sku: "LIB-MAR-SHA-FINE12",
    warranty: "Garantía de tinta 1 año",
    description: "Caja con 12 marcadores punta fina 1.0 mm tinta negra.",
    fullDescription: "El marcador permanente por excelencia en almacenes, logística y oficinas. Escribe de forma permanente sobre cualquier superficie no grasa, resistente al agua y a la decoloración solar.",
    price: 54.0,
    previousPrice: 62.0,
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
      "Tinta: Base alcohol indeleble permanente"
    ],
    features: [
      "Resistente a la intemperie y humedad",
      "Trazo negro intenso que no se decolora",
      "Secado ultra rápido"
    ]
  },
  {
    id: 110,
    name: "Pack Tacos Notas Adhesivas 3x3 Artesco Neon x 6 Unidades",
    category: "Oficina",
    brand: "Artesco",
    sku: "LIB-NOT-POST-3X3X6",
    warranty: "Garantía de adhesivo",
    description: "Pack de 6 tacos de 100 notas adhesivas de 76 x 76 mm.",
    fullDescription: "Ideales para recordatorios rápidos en pantallas, escritorios, agendas y carpetas.",
    price: 22.0,
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
      "Contenido: 6 tacos de 100 hojas c/u (600 hojas totales)",
      "Tamaño: 76 x 76 mm",
      "Colores neón de alta visibilidad"
    ],
    features: [
      "Se adhiere firmemente",
      "Despegado limpio sin manchas"
    ]
  },
  {
    id: 111,
    name: "Set Tijera de Oficina Acero Inoxidable 8\" + Cúter Metálico",
    category: "Accesorios",
    brand: "Artesco",
    sku: "LIB-TIJ-CUT-SET",
    warranty: "Garantía de filo 1 año",
    description: "Tijera de 8 pulgadas en acero más cúter metálico 18 mm.",
    fullDescription: "Diseñada para uso continuo en oficina y almacén. Corta fácilmente papel, cartón grueso, cintas adhesivas y telas con suavidad.",
    price: 20.0,
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
      "Tijera: 8 pulgadas en acero inoxidable",
      "Cúter: Metálico con cuchilla de 18 mm",
      "Uso rudo para almacén y oficina"
    ],
    features: [
      "Filo rectificado de larga duración",
      "Mango ergonómico antifatiga"
    ]
  },
  {
    id: 112,
    name: "Engrapadora Metálica de Oficina Pesada 24/6 + Perforador 2H",
    category: "Oficina",
    brand: "Artesco",
    sku: "LIB-ENG-PERF-KIT",
    warranty: "Garantía 1 año",
    description: "Engrapadora para 30 hojas, perforador y 1,000 grapas.",
    fullDescription: "Herramienta indispensable en escritorios administrativos. Mecanismo de acero templado con resorte de alta precisión que evita atascos de grapas.",
    price: 45.0,
    previousPrice: 52.0,
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
      "Engrapadora para 30 hojas bond",
      "Perforador metálico con guía A4/Carta",
      "Incluye caja de 1,000 grapas 26/6"
    ],
    features: [
      "Mecanismo anti-atasco",
      "Construcción 100% metálica pesada"
    ]
  },
  {
    id: 113,
    name: "Set Pluma Estilográfica & Bolígrafo Parker Jotter Premium",
    category: "Escritura",
    brand: "Parker",
    sku: "LIB-PAR-JOTT-SET",
    warranty: "Garantía oficial Parker de por vida",
    description: "Juego de pluma y bolígrafo Parker Jotter en estuche.",
    fullDescription: "El regalo y artículo de distinción ejecutiva por excelencia. Fabricado con cuerpo de acero inoxidable cepillado, clip icónico en forma de flecha y plumín de acero inoxidable con trazo medio perfecto para firmas y acuerdos.",
    price: 220.0,
    previousPrice: 250.0,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 84,
    imageType: 'pen',
    type: 'library',
    createdAt: "2025-09-22T10:00:00.000Z",
    specifications: [
      "Incluye: 1 Pluma estilográfica Parker + 1 Bolígrafo Parker Jotter",
      "Material: Acero inoxidable cepillado con detalles cromados",
      "Punta: Mediana (M) con flujo continuo Quink",
      "Presentación: Estuche original de regalo acolchado"
    ],
    features: [
      "Escritura suave e indeleble",
      "Icono de diseño profesional internacional",
      "Clip metálico flexible de máxima resistencia"
    ]
  },
  // ==============================================================
  // LICENCIAS Y SUSCRIPCIONES DIGITALES (14 PRODUCTOS NUEVOS)
  // ==============================================================
  {
    id: 201,
    name: "Adobe Acrobat PRO (Licencia Permanente)",
    category: "Licencias & Software",
    brand: "Adobe",
    sku: "LIC-ADOBE-ACROBAT-PERM",
    warranty: "Activación Digital Permanente Garantizada",
    description: "Licencia digital de por vida para Adobe Acrobat PRO. Edición avanzada de documentos PDF.",
    fullDescription: "Licencia permanente original para Adobe Acrobat PRO. Permite crear, editar, firmar, convertir y proteger archivos PDF con herramientas profesionales completas sin mensualidades.",
    price: 60.0,
    previousPrice: 85.0,
    image: "/assets/Licencias, subs/Adobe Acrobat PRO (Licencia Permanente) - 60.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 42,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Activación digital inmediata",
      "Licencia para 1 equipo",
      "Válido para Windows / MacOS",
      "Sin pagos recurrentes ni suscripción mensual"
    ],
    features: [
      "Edición de texto e imágenes en PDF",
      "Exportación a Word, Excel y PowerPoint",
      "Firma electrónica segura",
      "Protección por contraseña y censura"
    ]
  },
  {
    id: 202,
    name: "Adobe Acrobat PRO DC Windows (Preactivado)",
    category: "Licencias & Software",
    brand: "Adobe",
    sku: "LIC-ADOBE-DC-WIN",
    warranty: "Soporte de instalación garantizado",
    description: "Versión preactivada de Adobe Acrobat PRO DC lista para instalar en Windows.",
    fullDescription: "Adobe Acrobat PRO DC para entornos de trabajo Windows. Instalador preactivado con todas las funciones de edición y organización de PDF habilitadas.",
    price: 15.0,
    previousPrice: 25.0,
    image: "/assets/Licencias, subs/Adobe Acrobat PRO DC (Windows)  Preactivado - 15.00.jpg",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 18,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Compatible con Windows 10 y 11",
      "Instalación offline guiada",
      "Herramientas OCR completas",
      "Entrega inmediata por enlace digital"
    ],
    features: [
      "Edición de PDF fluida",
      "Combinar y organizar archivos",
      "Reconocimiento óptico de caracteres (OCR)"
    ]
  },
  {
    id: 203,
    name: "ESET NOD32 Internet Security",
    category: "Seguridad & Antivirus",
    brand: "ESET",
    sku: "LIC-ESET-IS",
    warranty: "Garantía oficial ESET por el periodo contratado",
    description: "Seguridad avanzada para navegación web, banca en línea y protección integral contra malware.",
    fullDescription: "ESET Internet Security brinda protección completa para tu vida digital: escudo contra ransomware, protección de banca online y firewall personal con consumo mínimo de recursos.",
    price: 65.0,
    previousPrice: 85.0,
    image: "/assets/Licencias, subs/Eset Nod32 internet Security - 65.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 65,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Licencia original activable en servidores de ESET",
      "Protección proactiva en tiempo real",
      "Firewall bidireccional y control parental",
      "Consumo ultraligero de memoria RAM"
    ],
    features: [
      "Banca y pagos seguros",
      "Protección contra botnets y redes maliciosas",
      "Antiphishing proactivo",
      "Escudo anti-ransomware"
    ]
  },
  {
    id: 204,
    name: "ESET NOD32 Antivirus x 1 Año",
    category: "Seguridad & Antivirus",
    brand: "ESET",
    sku: "LIC-ESET-NOD32-1Y",
    warranty: "1 Año de protección oficial",
    description: "El legendario antivirus rápido y liviano para gamers y profesionales por 12 meses.",
    fullDescription: "Protección galardonada que no ralentiza tu equipo. Incluye modo jugador para sesiones sin interrupciones y detección heurística líder en la industria.",
    price: 50.0,
    previousPrice: 70.0,
    image: "/assets/Licencias, subs/Eset Nod32 x 1año - 50.00.jpg",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 39,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Vigencia de 365 días",
      "1 Dispositivo con Windows",
      "Actualizaciones automáticas diarias de firmas de virus",
      "Soporte técnico directo"
    ],
    features: [
      "Antivirus y antispyware en tiempo real",
      "Exploración basada en la nube",
      "Bloqueador de exploits avanzado",
      "Bajo consumo de batería en laptops"
    ]
  },
  {
    id: 205,
    name: "Kaspersky Plus + VPN (1 Año / 1 PC)",
    category: "Seguridad & Antivirus",
    brand: "Kaspersky",
    sku: "LIC-KASP-PLUS-1Y",
    warranty: "Licencia oficial Kaspersky 12 meses",
    description: "Ciberseguridad de última generación con VPN ilimitada y optimizador de rendimiento del sistema.",
    fullDescription: "Kaspersky Plus ofrece defensa total contra virus, malware y troyanos, combinada con VPN ultrarrápida ilimitada para navegación privada y herramientas de limpieza del disco duro.",
    price: 75.0,
    previousPrice: 95.0,
    image: "/assets/Licencias, subs/kaspersky Plus VPN 1 año PC - 75.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 52,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "1 Año de vigencia para 1 PC",
      "VPN de velocidad ilimitada incluida",
      "Gestor de contraseñas premium",
      "Herramientas de optimización y limpieza de PC"
    ],
    features: [
      "Detección de amenazas en tiempo real",
      "Navegación web cifrada de grado bancario",
      "Comprobador de fugas de datos y credenciales",
      "Protección y bloqueo de webcam no autorizada"
    ]
  },
  {
    id: 206,
    name: "McAfee Total Protection (2 Años)",
    category: "Seguridad & Antivirus",
    brand: "McAfee",
    sku: "LIC-MCAFEE-2Y",
    warranty: "2 Años de garantía y soporte oficial",
    description: "Protección antivirus completa para dispositivos con firewall, destructor de archivos y protección web.",
    fullDescription: "McAfee Total Protection brinda seguridad premium durante 2 años contra virus, ransomware y amenazas en la web con una puntuación de protección del 100%.",
    price: 40.0,
    previousPrice: 65.0,
    image: "/assets/Licencias, subs/Mc Afee Total x 2 años - 40.00.jpg",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 31,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "2 Años completos de protección",
      "Instalación en PC / Laptop",
      "Firewall personal inteligente",
      "Actualizaciones continuas en la nube"
    ],
    features: [
      "Destructor de archivos confidenciales",
      "Protección de identidad y privacidad",
      "Asesor de navegación web segura"
    ]
  },
  {
    id: 207,
    name: "McAfee Protection Multidispositivo (5 Años)",
    category: "Seguridad & Antivirus",
    brand: "McAfee",
    sku: "LIC-MCAFEE-5Y",
    warranty: "5 Años de suscripción garantizada",
    description: "La máxima tranquilidad a largo plazo con 5 años de seguridad completa para tus equipos.",
    fullDescription: "Plan extendido de 5 años para despreocuparte de renovaciones antivirus. Defiende tus equipos contra el robo de identidad, malware y sitios web fraudulentos.",
    price: 80.0,
    previousPrice: 120.0,
    image: "/assets/Licencias, subs/Mc Afee x 5 años - 80.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 44,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Válido por 5 años (1825 días)",
      "Protección multidispositivo",
      "Consola de administración unificada",
      "Compatibilidad total Windows / Android"
    ],
    features: [
      "Seguridad galardonada en pruebas independientes",
      "Bloqueo inmediato de ransomware",
      "Gestor de contraseñas de alta seguridad"
    ]
  },
  {
    id: 208,
    name: "Microsoft 365 Personal (1TB Cloud - 1 PC/Mac)",
    category: "Suscripciones Cloud",
    brand: "Microsoft",
    sku: "SUB-MS365-1TB-1PC",
    warranty: "1 Año de suscripción oficial Microsoft",
    description: "Suscripción anual a Word, Excel, PowerPoint y 1000 GB (1TB) de almacenamiento en la nube OneDrive.",
    fullDescription: "Todo lo que necesitas para tu trabajo diario y estudio. Accede a las aplicaciones premium de Office con las últimas funciones de Inteligencia Artificial y sincronización automática en la nube.",
    price: 70.0,
    previousPrice: 95.0,
    image: "/assets/Licencias, subs/Microsoft 365 1TB 1PC - 70.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 88,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Suscripción oficial por 12 meses",
      "1 Usuario (1 PC/Mac + 1 Celular/Tablet)",
      "1 TB (1,000 GB) de almacenamiento OneDrive",
      "Actualizaciones automáticas a las últimas versiones"
    ],
    features: [
      "Aplicaciones completas: Word, Excel, PowerPoint, Outlook",
      "Seguridad avanzada contra ransomware en OneDrive",
      "Soporte técnico continuo directo de Microsoft"
    ]
  },
  {
    id: 209,
    name: "Nitro PRO PDF (Licencia Digital)",
    category: "Licencias & Software",
    brand: "Nitro",
    sku: "LIC-NITRO-PRO",
    warranty: "Licencia digital perpetua",
    description: "Software profesional líder para crear, editar, combinar y firmar archivos PDF de forma rápida.",
    fullDescription: "Alternativa potente y ligera a Adobe Acrobat. Permite transformar documentos escaneados en archivos editables mediante OCR, proteger con contraseña y firmar contratos digitales con facilidad.",
    price: 15.0,
    previousPrice: 28.0,
    image: "/assets/Licencias, subs/Nitro PRO - 15.00.jpg",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.6,
    reviewsCount: 22,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Licencia permanente sin mensualidad",
      "Activación directa en Windows",
      "Motor OCR de alta precisión para escaneos",
      "Interfaz estilo Microsoft Office intuitiva"
    ],
    features: [
      "Edición fluida de texto e imágenes en PDF",
      "Conversión precisa a Word, Excel y PowerPoint",
      "Comparación visual de versiones de documentos"
    ]
  },
  {
    id: 210,
    name: "Microsoft Office 2024 Profesional (Permanente)",
    category: "Licencias & Software",
    brand: "Microsoft",
    sku: "LIC-OFFICE-2024-PRO",
    warranty: "Activación Digital Permanente Oficial",
    description: "Licencia definitiva de Office 2024. Compra única para siempre sin suscripciones ni mensualidades.",
    fullDescription: "La versión más moderna y completa de Office para empresas y profesionales. Incluye Word 2024, Excel 2024, PowerPoint 2024, Outlook 2024 y Access 2024 con activación enlazable a tu equipo.",
    price: 50.0,
    previousPrice: 85.0,
    image: "/assets/Licencias, subs/Office 2024 Permanente - 50.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 97,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Licencia perpetua de por vida sin vencimiento",
      "Activación online oficial",
      "1 Equipo con Windows 10 u 11",
      "Todas las aplicaciones profesionales de escritorio"
    ],
    features: [
      "Word 2024, Excel 2024, PowerPoint 2024, Outlook 2024, Access 2024",
      "Nuevas fórmulas dinámicas y gráficos mejorados",
      "Modo oscuro optimizado y compatibilidad ODF 1.4"
    ]
  },
  {
    id: 211,
    name: "Office 365 Familia x 1 Año (1TB para 5 Dispositivos)",
    category: "Suscripciones Cloud",
    brand: "Microsoft",
    sku: "SUB-OFFICE365-5PC-1TB",
    warranty: "1 Año de suscripción multiusuario",
    description: "El plan más completo para hogares y oficinas pequeñas. Hasta 5 dispositivos con 1 TB de nube cada uno.",
    fullDescription: "Comparte todos los beneficios de Microsoft 365 con tu familia o equipo. Cada persona disfruta de 1 TB de almacenamiento independiente y las aplicaciones de Office en computadoras, tablets y teléfonos.",
    price: 120.0,
    previousPrice: 160.0,
    image: "/assets/Licencias, subs/Office 365 x 1 año con almacenamiento 1TB para 5PC - 120.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 64,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Vigencia 1 Año (365 días)",
      "Habilitado para hasta 5 dispositivos/cuentas",
      "1 TB de almacenamiento en la nube por usuario (5 TB en total)",
      "Seguridad avanzada Family Safety"
    ],
    features: [
      "Acceso a Word, Excel, PowerPoint, OneNote",
      "Almacenamiento masivo seguro",
      "Uso simultáneo sin interferencias"
    ]
  },
  {
    id: 212,
    name: "Office 365 x 1 Año sin Almacenamiento (5 Dispositivos)",
    category: "Suscripciones Cloud",
    brand: "Microsoft",
    sku: "SUB-OFFICE365-5PC-NO1TB",
    warranty: "1 Año de activación garantizada",
    description: "Plan económico de aplicaciones de Office para 5 equipos sin costo extra de almacenamiento cloud.",
    fullDescription: "Ideal para colegios, academias o pequeñas empresas que solo necesitan el paquete ofimático Office en sus máquinas sin contratar espacio adicional en la nube.",
    price: 35.0,
    previousPrice: 55.0,
    image: "/assets/Licencias, subs/Office 365 x 1 año sin almacenamiento para 5PC - 35.00.jpg",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 29,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Vigencia 12 meses",
      "Instalación en hasta 5 computadoras",
      "Actualizaciones mensuales incluidas",
      "Soporte multiidioma oficial"
    ],
    features: [
      "Word, Excel, PowerPoint y Access",
      "Activación directa por cuenta",
      "Excelente relación costo-beneficio"
    ]
  },
  {
    id: 213,
    name: "Windows 10 / 11 Pro & Home OEM (Activación Digital)",
    category: "Sistemas Operativos",
    brand: "Microsoft",
    sku: "LIC-WIN-OEM",
    warranty: "Garantía de activación digital de por vida",
    description: "Licencia digital genuina OEM para ensambladores y computadoras personales o de oficina.",
    fullDescription: "Activa Windows 10 Pro o Windows 11 Pro de manera legal y definitiva. Se enlaza al hardware de la placa madre y permite recibir todas las actualizaciones oficiales de seguridad de Microsoft.",
    price: 35.0,
    previousPrice: 50.0,
    image: "/assets/Licencias, subs/Win 10 11 PRO Home OEM - 35.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 110,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Licencia OEM vinculada a la placa madre",
      "32 y 64 bits",
      "Válida para Windows 10 y Windows 11",
      "Activación digital instantánea"
    ],
    features: [
      "BitLocker para cifrado de discos",
      "Escritorio remoto habilitado",
      "Hyper-V y Sandbox para virtualización",
      "Windows Defender integrado"
    ]
  },
  {
    id: 214,
    name: "Windows 10 / 11 Pro Retail (Transferible)",
    category: "Sistemas Operativos",
    brand: "Microsoft",
    sku: "LIC-WIN-RETAIL",
    warranty: "Licencia perpetua oficial Microsoft Retail",
    description: "Licencia Retail transferible. Si cambias de equipo o componentes, mantienes tu clave de activación.",
    fullDescription: "La máxima categoría de licencia para Windows. Permite ser transferida a una nueva computadora en el futuro si renuevas tu hardware, brindando la máxima inversión y durabilidad.",
    price: 50.0,
    previousPrice: 75.0,
    image: "/assets/Licencias, subs/Win 10 11 PRO Retail - 50.00.jpg",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 76,
    imageType: "software",
    type: "technology",
    techSubtype: "license",
    createdAt: "2026-10-20T10:00:00.000Z",
    specifications: [
      "Licencia Retail oficial transferible",
      "Soporte oficial directo de Microsoft",
      "Válida para instalaciones limpias y actualizaciones",
      "Multilenguaje mundial"
    ],
    features: [
      "Transferencia a nuevo hardware permitida",
      "Todas las funciones Pro corporativas",
      "Protección contra amenazas de red avanzadas"
    ]
  }
];
