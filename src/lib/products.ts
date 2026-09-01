export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  description: string;
  fullDescription: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewsCount: number;
  sku: string;
  warranty: string;
  specifications: string[];
  features: string[];
  imageType: 'switch' | 'server' | 'firewall' | 'laptop' | 'storage' | 'router' | 'accesspoint';
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
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 38,
    imageType: 'switch',
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
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewsCount: 24,
    imageType: 'server',
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
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewsCount: 42,
    imageType: 'firewall',
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
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 56,
    imageType: 'laptop',
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
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewsCount: 19,
    imageType: 'switch',
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
    inStock: true,
    featured: false,
    rating: 5.0,
    reviewsCount: 12,
    imageType: 'storage',
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
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 88,
    imageType: 'accesspoint',
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
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 31,
    imageType: 'router',
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
  }
];
