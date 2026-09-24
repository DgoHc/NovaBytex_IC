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
export const LIBRARY_CATEGORIES = ["Libros", "Cuadernos", "Agendas", "Escritura", "Arte", "Oficina", "Escolar", "Accesorios"];
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
    name: "Cuaderno Profesional A5 Tapa Dura Premium",
    category: "Cuadernos",
    brand: "Moleskine",
    sku: "LIB-CUAD-A5-001",
    warranty: "Garantía contra defectos de fábrica 30 días",
    description: "Cuaderno de tapa dura con 240 hojas rayadas, papel ivory de 100gsm, cinta marcadora y bolsillo interior.",
    fullDescription: "Cuaderno estilo editorial premium, ideal para ejecutivos y profesionales que buscan una experiencia de escritura refinada. El papel ivory de alta densidad no traspasa tinta y es compatible con plumones finos y estilográficas.",
    price: 89,
    previousPrice: 119,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.8,
    reviewsCount: 124,
    imageType: 'notebook',
    type: 'library',
    createdAt: "2025-09-10T10:00:00.000Z",
    specifications: [
      "Formato A5 (14 x 21 cm)",
      "240 hojas rayadas de 100 gsm",
      "Tapa dura cartoné forrada en tela",
      "Cinta marcadora de satén color crema",
      "Bolsillo interior expandible en contraportada",
      "Elástico de cierre integrado",
      "Papel ivory sin blanquear ópticamente"
    ],
    features: [
      "Cierre con goma elástica para protección",
      "Borde de páginas teñido a la prensa",
      "Compatible con rotuladores y estilográficas",
      "Cinta de registro dobladiza para dos páginas"
    ]
  },
  {
    id: 102,
    name: "Agenda Ejecutiva 2026 Semanal A5 Cuero",
    category: "Agendas",
    brand: "Legacy",
    sku: "LIB-AGE-2026-001",
    warranty: "30 días contra defectos",
    description: "Agenda ejecutiva 2026 de cuero sintético premium con planificación semanal, calendarios y secciones de notas.",
    fullDescription: "Agenda de alta gama diseñada para profesionales y directivos. Incluye planificación diaria y semanal, mapas mundiales, convertidores de medidas, agenda de contactos y separadores de colores para una organización impecable.",
    price: 149,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 89,
    imageType: 'agenda',
    type: 'library',
    createdAt: "2025-09-11T10:00:00.000Z",
    specifications: [
      "Tamaño A5 (15.5 x 21.5 cm)",
      "Forro en cuero PU de grano premium",
      "Planificación Semanal Enero-Diciembre 2026",
      "Calendarios 2025/2026/2027",
      "Sección de contactos con 80 entradas",
      "6 separadores impresos con dorado",
      "Cinta marcadora de dos tonos"
    ],
    features: [
      "Esquinas metálicas protectoras",
      "Solapa con cierre magnético",
      "Ranura para bolígrafo integrada",
      "Bolsillo trasero para tarjetas y papeles"
    ]
  },
  {
    id: 103,
    name: "Set de Lapiceros Rollerball Premium x6 Colores",
    category: "Escritura",
    brand: "Parker",
    sku: "LIB-LAP-ROLL-006",
    warranty: "Garantía 1 año",
    description: "Set de 6 lapiceros rollerball con tinta de gel de secado rápido, punta 0.7mm y cuerpo metálico acabado mate.",
    fullDescription: "Colección de lapiceros de escritura premium que combina ergonomía profesional con una experiencia de escritura suave. La tinta de gel de secado ultra rápido evita manchones y ofrece un trazo uniforme y nítido.",
    price: 79,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 210,
    imageType: 'pen',
    type: 'library',
    createdAt: "2025-09-12T10:00:00.000Z",
    specifications: [
      "6 unidades: negro, azul, rojo, verde, morado, turquesa",
      "Punta de bola 0.7 mm trazo medio",
      "Tinta gel de secado ultra rápido",
      "Cuerpo metálico aluminio acabado mate",
      "Clip metálico resistente a la corrosión",
      "Ergonómico con agarre de goma antideslizante",
      "Recargas reemplazables disponibles"
    ],
    features: [
      "Trazo uniforme sin saltos",
      "No mancha ni traspasa el papel",
      "Ideal para uso diario y profesional",
      "Estuche presentación metálico"
    ]
  },
  {
    id: 104,
    name: "Libro Clean Architecture — Robert C. Martin",
    category: "Libros",
    brand: "Pearson",
    sku: "LIB-LIB-CA-001",
    warranty: "30 días",
    description: "Guía definitiva de arquitectura de software por el Tío Bob. Principios, patrones y prácticas para construir sistemas duraderos.",
    fullDescription: "Una obra de referencia obligatoria para desarrolladores y arquitectos de software. Aprende los principios SOLID, componentes, arquitecturas limpias, límites de arquitectura, políticas y reglas de negocio directamente de la leyenda Robert C. Martin (Uncle Bob).",
    price: 159,
    previousPrice: 189,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 342,
    imageType: 'book',
    type: 'library',
    createdAt: "2025-09-13T10:00:00.000Z",
    specifications: [
      "Tapa blanda edición española",
      "464 páginas impresas en offset",
      "Medidas: 17.5 x 24 cm",
      "Papel couché opaco 70 gsm",
      "ISBN: 978-0134494166",
      "Autor: Robert C. Martin",
      "Editorial: Pearson Education"
    ],
    features: [
      "Ejemplos prácticos en múltiples lenguajes",
      "Índice temático detallado",
      "Diagramas y esquemas a color",
      "Aplicable a cualquier stack tecnológico"
    ]
  },
  {
    id: 105,
    name: "Marcadores Permanentes Profesionales x12",
    category: "Arte",
    brand: "Sharpie",
    sku: "LIB-MAR-PERM-012",
    warranty: "30 días",
    description: "Set de 12 marcadores permanentes de punta fina, tinta indeleble, secado rápido y resistente al agua.",
    fullDescription: "Marcadores permanentes de calidad industrial que escriben prácticamente en cualquier superficie: papel, vidrio, plástico, metal, madera, cerámica y tela. Tinta de alta opacidad con tecnología de resistencia UV para usos de oficina, bodega y taller.",
    price: 59,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.6,
    reviewsCount: 178,
    imageType: 'marker',
    type: 'library',
    createdAt: "2025-09-14T10:00:00.000Z",
    specifications: [
      "12 marcadores de colores vivos",
      "Punta fina tipo aguja 1.0 mm",
      "Tinta permanente base alcohol",
      "Secado en menos de 3 segundos",
      "Resistente al agua y al desvanecimiento",
      "Escribe en casi cualquier superficie",
      "Bajo olor, certificado AP no tóxico"
    ],
    features: [
      "No se borra con ropa ni agua",
      "Cuerpo hexagonal antirrodadura",
      "Tinta con UV inhibitors",
      "Cierre hermético a prueba de secado"
    ]
  },
  {
    id: 106,
    name: "Resaltadores de Gel Suave x4 Pastel",
    category: "Arte",
    brand: "Stabilo",
    sku: "LIB-RES-GEL-004",
    warranty: "30 días",
    description: "Resaltadores de gel en tonos pastel que no traspasan el papel, con trazo suave y sin secar en uso prolongado.",
    fullDescription: "Sistema innovador de resaltado en gel. Su textura cremosa se desliza sin esfuerzo por el papel sin secarse ni rayar. Los colores pastel son suaves a la vista y permiten relectura cómoda. Ideal para estudio, lectura académica y apuntes.",
    price: 34,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 256,
    imageType: 'highlighter',
    type: 'library',
    createdAt: "2025-09-15T10:00:00.000Z",
    specifications: [
      "4 unidades: amarillo, verde, rosa, azul",
      "Formato gel en barra retractil",
      "Trazo ancho 5mm aplicable",
      "Duración aproximada 350 metros",
      "Libres de xileno y tolueno",
      "Apto para uso escolar diario",
      "No salpican ni gotean"
    ],
    features: [
      "No traspasa papel de 80 gsm",
      "No borra la escritura a tinta",
      "Retráctil sin necesidad de tapa",
      "Diseño ergonómico antifatiga"
    ]
  },
  {
    id: 107,
    name: "Organizador de Escritorio Bamboo 6 Compartimentos",
    category: "Oficina",
    brand: "NovaDesk",
    sku: "LIB-OFI-ORG-001",
    warranty: "6 meses",
    description: "Organizador de escritorio de bambú natural con 6 compartimentos para bolígrafos, tarjetas, clips y notas adhesivas.",
    fullDescription: "Pieza central de organización para tu puesto de trabajo. Fabricado en bambú sostenible de alta calidad, este organizador aúna calidez natural con la precisión de un mobiliario ejecutivo. Incluye ranura integrada para soporte de smartphone.",
    price: 129,
    previousPrice: 159,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 92,
    imageType: 'desk',
    type: 'library',
    createdAt: "2025-09-16T10:00:00.000Z",
    specifications: [
      "Material: Bambú macizo Moso",
      "Medidas: 25 x 16 x 11 cm",
      "6 compartimentos de diferentes tamaños",
      "Ranura integrada para smartphone hasta 7\"",
      "Acabado lijado a mano con barniz mate",
      "Base con fieltro protector antiarañazos",
      "Peso: 680 gramos"
    ],
    features: [
      "Bambú certificado FSC sostenible",
      "Resistente a la humedad",
      "Fácil limpieza con paño húmedo",
      "Diseño minimalista que combina con cualquier escritorio"
    ]
  },
  {
    id: 108,
    name: "Set Escolar Premium Completo Útiles Básicos",
    category: "Escolar",
    brand: "SchoolPro",
    sku: "LIB-ESC-SET-001",
    warranty: "30 días",
    description: "Kit escolar completo y organizado: cuadernos, lápices, borrador, tajalápiz, regla, resaltadores y más.",
    fullDescription: "Set integral diseñado para estudiantes de nivel primario/secundario que necesitan empezar el año con todo lo necesario. Piezas seleccionadas por su durabilidad, presentadas en un maletín de tela transparente para fácil visibilidad.",
    price: 99,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.5,
    reviewsCount: 145,
    imageType: 'school',
    type: 'library',
    createdAt: "2025-09-17T10:00:00.000Z",
    specifications: [
      "2 Cuadernos universitarios 200 hojas",
      "3 Lápices grafito HB de madera",
      "2 Bolígrafos tinta azul + 1 rojo",
      "1 Borrador blanco goma premium",
      "1 Tajalápiz de doble orificio",
      "1 Regla 30cm transparente flexible",
      "4 Resaltadores colores"
    ],
    features: [
      "Maletín transportador con cierre",
      "Productos sin PVC ni ftalatos",
      "Tinta no tóxica certificada",
      "Ideal para edades de 7 a 17 años"
    ]
  },
  {
    id: 109,
    name: "Lápices de Grafito Profesional 12 Grados HB-9H",
    category: "Arte",
    brand: "Faber-Castell",
    sku: "LIB-LAP-GRAF-012",
    warranty: "30 días",
    description: "Caja metálica de 12 lápices de grafito de grados profesionales para dibujo técnico, bocetos y sombreado artístico.",
    fullDescription: "Set profesional para dibujantes, arquitectos e ilustradores. Los lápices Faber-Castell Goldfaber cuentan con mina de grafito SV (Super-Vinculada) que resiste impactos y no se astilla al tajarse. Graduaciones de dureza precisas.",
    price: 49,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.9,
    reviewsCount: 187,
    imageType: 'pencil',
    type: 'library',
    createdAt: "2025-09-18T10:00:00.000Z",
    specifications: [
      "12 lápices: 9H, 8H, 7H, 6H, 5H, 4H, 3H, 2H, H, F, HB, B",
      "Mina SV Super-Vinculada anti-rotura",
      "Madera cedro reforestado de alta calidad",
      "Laca hexagonal sin barniz sobrante",
      "Caja metálica de lata con cierre a presión",
      "Marcado de dureza en cada lápiz",
      "Sin PFC, sin plomo ni cadmio"
    ],
    features: [
      "Trazo limpio y sin grumos",
      "Fácil de borrar",
      "Ideal para dibujo técnico y sombreado",
      "Estuche metálico reutilizable"
    ]
  },
  {
    id: 110,
    name: "Clip Magnético Premium + Portanotas Adhesivo",
    category: "Accesorios",
    brand: "OfficeTech",
    sku: "LIB-ACC-CLIP-001",
    warranty: "30 días",
    description: "Set combinado: 3 clips magnéticos de neodimio + 6 bloques de notas adhesivas translúcidas de colores.",
    fullDescription: "Accesorios esenciales para tu escritorio. Los clips magnéticos sujetan hojas gruesas sin perforarlas. Las notas adhesivas translúcidas permiten escribir y resaltar sin cubrir el texto original, perfectas para libros y documentos.",
    price: 29,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: false,
    rating: 4.4,
    reviewsCount: 68,
    imageType: 'office',
    type: 'library',
    createdAt: "2025-09-19T10:00:00.000Z",
    specifications: [
      "3 clips magnéticos de neodimio N52",
      "Capacidad de sujeción: hasta 45 hojas",
      "6 bloques de notas 50 hojas c/u = 300 notas",
      "Colores: amarillo, naranja, rosa, azul, verde, lavanda",
      "Medida notas: 75 x 75 mm",
      "Adhesivo reposicionable sin residuos",
      "Material PVC libre ftalatos"
    ],
    features: [
      "Clips no arrugan ni dañan el papel",
      "Notas translúcidas reutilizables",
      "Adhesivo de baja acidez no degrada el papel",
      "Compatible con todas las tintas y lápices"
    ]
  },
  {
    id: 111,
    name: "Libro Domain-Driven Design — Eric Evans",
    category: "Libros",
    brand: "Addison-Wesley",
    sku: "LIB-LIB-DDD-001",
    warranty: "30 días",
    description: "El libro fundacional de DDD. Técnicas para alinear diseño de software con complejidad del dominio empresarial.",
    fullDescription: "La obra maestra de Eric Evans que revolucionó el diseño de software empresarial. Descubre los bloques de construcción tácticos y estratégicos del DDD, incluyendo Aggregates, Entities, Value Objects, Repositories, Bounded Contexts y Context Maps.",
    price: 219,
    previousPrice: undefined,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 198,
    imageType: 'book',
    type: 'library',
    createdAt: "2025-09-20T10:00:00.000Z",
    specifications: [
      "Tapa dura edición de lujo",
      "560 páginas",
      "Medidas: 18 x 25 x 3.5 cm",
      "Peso: 1.1 kg",
      "ISBN: 978-0321125217",
      "Autor: Eric Evans",
      "Idioma: Español, editorial Traducción Oficial"
    ],
    features: [
      "Casos de estudio de proyectos reales",
      "Ejemplos en Java y C# traducibles a cualquier lenguaje",
      "Diagramas UML a color",
      "Marcadores de capítulos destacados"
    ]
  },
  {
    id: 112,
    name: "Cuaderno Inteligente Reutilizable Rocketbook A4",
    category: "Accesorios",
    brand: "Rocketbook",
    sku: "LIB-ACC-RB-001",
    warranty: "1 año",
    description: "Cuaderno reutilizable infinito con app de escaneo OCR y almacenamiento en nube (Google Drive, OneNote, Notion, Dropbox).",
    fullDescription: "El cuaderno del futuro. Escribe con cualquier bolígrafo de tinta de gel Pilot FriXion, escanea con la app móvil y sincroniza tus notas automáticamente con los servicios en la nube. Limpia las páginas con un paño húmedo y vuelve a empezar.",
    price: 179,
    previousPrice: 219,
    image: "",
    inStock: true,
    available: true,
    featured: true,
    rating: 4.7,
    reviewsCount: 132,
    imageType: 'notebook',
    type: 'library',
    createdAt: "2025-09-21T10:00:00.000Z",
    specifications: [
      "Tamaño A4 ejecutivo",
      "36 páginas microfibra reutilizables infinitas",
      "Cuadrícula puntada gris 5mm",
      "Incluye 1 bolígrafo Pilot FriXion",
      "Paño microfibra de limpieza incluido",
      "Cobertura OCR para texto buscable",
      "Integración con Google, Microsoft, Slack y más"
    ],
    features: [
      "Uso infinito: cientos de reutilizaciones por página",
      "Marcadores QR por página",
      "Marcas de 7 símbolos para envío rápido a nube",
      "Papel impermeable anti-rotura"
    ]
  }
];
