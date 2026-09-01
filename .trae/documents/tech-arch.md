
## 1. Architecture Design
```mermaid
flowchart TD
  A["Frontend (Next.js 15 App Router)"] --> B["Components"]
  A --> C["Services"]
  A --> D["Hooks"]
  A --> E["Use Cases"]
  B --> F["UI Components (Buttons, Cards, Navbar, etc.)"]
  C --> G["Supabase Integration"]
  G --> H["PostgreSQL DB"]
  G --> I["Auth"]
  G --> J["Storage"]
```

## 2. Technology Description
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + TailwindCSS + Shadcn UI + Framer Motion + React Hook Form + Zod + TanStack Query + Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions)
- **Arquitectura**: Clean Architecture, SOLID, DRY, KISS, Component Driven Design

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | Inicio (Landing) |
| /productos | Catálogo de productos |
| /productos/[id] | Detalle de producto |
| /servicios | Servicios |
| /nosotros | Nosotros |
| /contacto | Contacto |
| /admin | Panel Admin (Dashboard) |
| /admin/productos | CRUD Productos |
| /admin/categorias | CRUD Categorías |
| /admin/servicios | CRUD Servicios |
| /admin/banners | CRUD Banners |
| /admin/configuracion | Configuración |
| /admin/usuarios | CRUD Usuarios |

## 4. Data Model
```mermaid
erDiagram
  Categoria ||--o{ Producto : tiene
  Producto ||--o{ ProductoImagen : tiene
  Servicio {
    uuid id PK
    string nombre
    string descripcion
    string icono
    string imagen
  }
  Categoria {
    uuid id PK
    string nombre
    string slug
    text descripcion
  }
  Producto {
    uuid id PK
    uuid categoria_id FK
    string nombre
    string slug
    text descripcion
    text especificaciones
    string marca
    boolean destacado
    boolean en_stock
    decimal precio
  }
  ProductoImagen {
    uuid id PK
    uuid producto_id FK
    string url
    boolean principal
  }
  Banner {
    uuid id PK
    string titulo
    string subtitulo
    string imagen
    string link
    boolean activo
  }
  Usuario {
    uuid id PK
    string email
    string nombre
    string rol
  }
```
