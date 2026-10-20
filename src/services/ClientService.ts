export interface ClientOrder {
  id: string;
  date: string;
  itemsCount: number;
  total: number;
  discountApplied?: number;
  status: "Entregado" | "En preparación" | "En camino" | "Pendiente";
  itemsSummary: string;
}

export interface RegisteredClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "client" | "admin";
  avatar?: string;
  provider: "google" | "otp" | "password";
  registeredAt: string;
  purchasesCount: number;
  totalSpent: number;
  loyaltyDiscount: number; // Porcentaje de descuento acumulado (ej. 10%)
  maxDiscountPrice: number; // Precio tope del producto aplicable (ej. S/ 300)
  status: "active" | "inactive";
  recentOrders: ClientOrder[];
}

const STORAGE_KEY = "nova:registered_clients:v1";

export function calculateLoyalty(purchasesCount: number): {
  discount: number;
  maxPrice: number;
  level: "Bienvenida" | "Frecuente" | "Preferencial" | "VIP";
  nextTarget: number;
} {
  if (purchasesCount <= 0) {
    return { discount: 5, maxPrice: 150, level: "Bienvenida", nextTarget: 1 };
  }
  if (purchasesCount < 3) {
    return { discount: 10, maxPrice: 250, level: "Frecuente", nextTarget: 3 };
  }
  if (purchasesCount < 5) {
    return { discount: 15, maxPrice: 350, level: "Preferencial", nextTarget: 5 };
  }
  return { discount: 20, maxPrice: 500, level: "VIP", nextTarget: 10 };
}

export const INITIAL_CLIENTS: RegisteredClient[] = [
  {
    id: "cli-1",
    name: "Carlos Mendoza Torres",
    email: "carlos.mendoza@gmail.com",
    phone: "+51 976 541 230",
    role: "client",
    provider: "google",
    registeredAt: "2025-11-14T09:30:00.000Z",
    purchasesCount: 4,
    totalSpent: 1840,
    loyaltyDiscount: 15,
    maxDiscountPrice: 350,
    status: "active",
    recentOrders: [
      {
        id: "NB-ORD-8821",
        date: "2026-02-10",
        itemsCount: 3,
        total: 620,
        discountApplied: 10,
        status: "Entregado",
        itemsSummary: "Switch TP-Link 16p + 2 Bobinas Cat6",
      },
      {
        id: "NB-ORD-7419",
        date: "2026-01-18",
        itemsCount: 1,
        total: 1220,
        discountApplied: 10,
        status: "Entregado",
        itemsSummary: "Laptop HP ProBook 450",
      },
    ],
  },
  {
    id: "cli-2",
    name: "Mariana Rojas Valdivia",
    email: "mariana.rojas@outlook.com",
    phone: "+51 987 112 459",
    role: "client",
    provider: "otp",
    registeredAt: "2026-01-05T14:15:00.000Z",
    purchasesCount: 2,
    totalSpent: 395,
    loyaltyDiscount: 10,
    maxDiscountPrice: 250,
    status: "active",
    recentOrders: [
      {
        id: "NB-ORD-9104",
        date: "2026-02-28",
        itemsCount: 4,
        total: 215,
        discountApplied: 5,
        status: "Entregado",
        itemsSummary: "Cuadernos A5 Standford + Set Resaltadores Faber",
      },
      {
        id: "NB-ORD-8012",
        date: "2026-01-20",
        itemsCount: 2,
        total: 180,
        discountApplied: 5,
        status: "Entregado",
        itemsSummary: "Archivadores de Palanca + Papel Report A4",
      },
    ],
  },
  {
    id: "cli-3",
    name: "Ing. Jorge Alva Paredes",
    email: "jalva@corporativoalva.pe",
    phone: "+51 945 882 103",
    role: "client",
    provider: "password",
    registeredAt: "2025-10-20T11:00:00.000Z",
    purchasesCount: 6,
    totalSpent: 8750,
    loyaltyDiscount: 20,
    maxDiscountPrice: 500,
    status: "active",
    recentOrders: [
      {
        id: "NB-ORD-9530",
        date: "2026-03-01",
        itemsCount: 2,
        total: 4200,
        discountApplied: 15,
        status: "En camino",
        itemsSummary: "Firewall Fortinet FortiGate 60F + Soporte",
      },
    ],
  },
  {
    id: "cli-admin",
    name: "Administrador Nova Bytex",
    email: "admin@novabytexrj.com",
    phone: "+51 990 804 482",
    role: "admin",
    provider: "password",
    registeredAt: "2025-08-01T08:00:00.000Z",
    purchasesCount: 0,
    totalSpent: 0,
    loyaltyDiscount: 0,
    maxDiscountPrice: 0,
    status: "active",
    recentOrders: [],
  },
];

export const ClientService = {
  list(): RegisteredClient[] {
    if (typeof window === "undefined") return INITIAL_CLIENTS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
        return INITIAL_CLIENTS;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  findByEmail(email: string): RegisteredClient | undefined {
    const clients = ClientService.list();
    return clients.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  },

  findById(id: string): RegisteredClient | undefined {
    return ClientService.list().find((c) => c.id === id);
  },

  save(client: RegisteredClient): RegisteredClient {
    const current = ClientService.list();
    const existingIndex = current.findIndex(
      (c) => c.id === client.id || c.email.toLowerCase() === client.email.toLowerCase()
    );

    let updated: RegisteredClient[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...client };
    } else {
      updated = [client, ...current];
    }

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return client;
  },

  registerNew(input: {
    name: string;
    email: string;
    phone?: string;
    role?: "client" | "admin";
    provider: "google" | "otp" | "password";
  }): RegisteredClient {
    const existing = ClientService.findByEmail(input.email);
    if (existing) {
      return existing;
    }

    const { discount, maxPrice } = calculateLoyalty(0);
    const newClient: RegisteredClient = {
      id: `cli-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone || "",
      role: input.role || (input.email.includes("admin") ? "admin" : "client"),
      provider: input.provider,
      registeredAt: new Date().toISOString(),
      purchasesCount: 0,
      totalSpent: 0,
      loyaltyDiscount: discount,
      maxDiscountPrice: maxPrice,
      status: "active",
      recentOrders: [],
    };

    return ClientService.save(newClient);
  },
};
