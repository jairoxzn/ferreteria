# Ferretería Pro · Sistema de Inventario

Sistema profesional de gestión de inventario para ferreterías. Diseñado con tecnologías modernas para uso real en producción.

## Stack tecnológico

- **Framework**: Next.js 15 (App Router) + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 3.4 + Shadcn/ui (estilo *new-york*)
- **DB**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: Auth.js v5 (NextAuth) — Credentials + JWT
- **Validación**: Zod + React Hook Form
- **Estado**: Zustand
- **Animaciones**: Framer Motion
- **Gráficas**: Recharts
- **Iconos**: Lucide React
- **Notificaciones**: Sonner
- **Imágenes**: Almacenamiento local / Vercel Blob (configurable en Fase 2)

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma
npm run db:generate

# 3. Aplicar schema a la DB de Neon
npm run db:push

# 4. Sembrar datos de ejemplo (usuarios, categorías, productos)
npm run db:seed

# 5. Iniciar dev server
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Credenciales de prueba (creadas por el seed)

| Rol       | Email                      | Contraseña     |
|-----------|----------------------------|----------------|
| Admin     | admin@ferreteria.com       | admin123       |
| Vendedor  | vendedor@ferreteria.com    | vendedor123    |
| Almacén   | almacen@ferreteria.com     | almacen123     |

## Generar AUTH_SECRET

Antes de producción genera un secret real:

```bash
openssl rand -base64 32
```

Reemplaza el valor en `.env.local` → `AUTH_SECRET=...`

## Scripts disponibles

| Script          | Descripción                                  |
|-----------------|----------------------------------------------|
| `dev`           | Servidor de desarrollo                       |
| `build`         | Build de producción (genera Prisma + Next)   |
| `start`         | Servidor de producción                       |
| `lint`          | ESLint                                       |
| `format`        | Formatear con Prettier                       |
| `db:generate`   | Generar Prisma Client                        |
| `db:push`       | Sincronizar schema con DB (sin migraciones)  |
| `db:migrate`    | Crear y aplicar migración                    |
| `db:studio`     | Abrir Prisma Studio                          |
| `db:seed`       | Sembrar datos de ejemplo                     |

## Estructura del proyecto

```
ferreteria/
├── prisma/
│   ├── schema.prisma           # Modelos: User, Product, Sale, Inventory, etc.
│   └── seed.ts                 # Datos iniciales
├── src/
│   ├── app/
│   │   ├── (auth)/             # Grupo público: login
│   │   ├── (dashboard)/        # Grupo protegido
│   │   │   ├── dashboard/      # Página principal con stats
│   │   │   ├── productos/      # CRUD productos (Fase 2)
│   │   │   ├── ventas/         # POS (Fase 2)
│   │   │   └── ...
│   │   ├── api/auth/[...nextauth]/  # Endpoint Auth.js
│   │   ├── layout.tsx          # Root (providers, fuente, theme)
│   │   ├── globals.css         # Tokens CSS + dark mode
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── actions/                # Server Actions
│   │   ├── auth.ts             # Login con NextAuth
│   │   └── dashboard.ts        # Queries del dashboard
│   ├── components/
│   │   ├── ui/                 # Shadcn primitives
│   │   ├── layout/             # Sidebar, Navbar, ThemeToggle
│   │   ├── dashboard/          # Cards, gráficas, alertas
│   │   ├── forms/              # LoginForm, etc.
│   │   └── providers/          # ThemeProvider, SessionProvider
│   ├── hooks/                  # Custom hooks
│   ├── lib/
│   │   ├── prisma.ts           # Cliente Prisma (singleton)
│   │   ├── utils.ts            # cn(), formatCurrency, formatDate
│   │   ├── constants.ts        # APP_NAME, ROLES, etc.
│   │   └── validations/        # Schemas Zod
│   ├── stores/                 # Zustand stores
│   └── types/                  # next-auth.d.ts
├── auth.ts                     # Configuración Auth.js v5
├── auth.config.ts              # Edge-compatible config
├── middleware.ts               # Protección de rutas
├── tailwind.config.ts
├── components.json             # Shadcn config
└── next.config.mjs
```

## Roadmap

### ✅ Fase 1 (Actual) — Fundación
- [x] Esquema Prisma completo (12 modelos)
- [x] Autenticación con roles (Admin, Vendedor, Almacén)
- [x] Middleware de protección de rutas
- [x] Layout con sidebar colapsable + navbar
- [x] Dark mode persistente
- [x] Dashboard con stats, gráficas, alertas, movimientos
- [x] Página de login profesional con diseño industrial
- [x] Sistema de tipografía, paleta y tokens

### 🚧 Fase 2 — Catálogo y Operaciones
- [ ] CRUD Productos (con subida de imágenes)
- [ ] CRUD Categorías
- [ ] CRUD Proveedores y Clientes
- [ ] Inventario: entradas, salidas, kardex
- [ ] Alertas de stock mínimo automatizadas

### 🚧 Fase 3 — Ventas y Caja
- [ ] POS con carrito dinámico
- [ ] Escáner QR de productos
- [ ] Múltiples métodos de pago (Efectivo, Tarjeta, Yape, Plin)
- [ ] Generación de boletas/tickets PDF
- [ ] Apertura y cierre de caja
- [ ] Arqueo automático

### 🚧 Fase 4 — Reportes y Analítica
- [ ] Reportes filtrables por fechas
- [ ] Exportación a PDF y Excel
- [ ] Dashboards avanzados por rol

## Deploy a Vercel

1. **Push del repositorio a GitHub.**
2. En Vercel: *New Project* → conecta el repo.
3. Configura las variables de entorno (copia de `.env.local`):
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `AUTH_SECRET` (genera uno nuevo con `openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`
   - `NEXTAUTH_URL=https://tu-dominio.vercel.app`
4. Vercel ejecutará automáticamente `prisma generate && next build`.
5. Después del primer deploy, ejecuta una sola vez localmente:
   ```bash
   DATABASE_URL="..." npm run db:push
   DATABASE_URL="..." npm run db:seed
   ```

## Seguridad

- Contraseñas hasheadas con **bcryptjs** (10 rounds).
- Sesiones JWT firmadas con `AUTH_SECRET`.
- Cookies `HttpOnly` y `Secure` en producción.
- Middleware bloquea rutas protegidas a usuarios sin sesión.
- Validación con Zod en cliente y servidor.
- Prisma sanitiza SQL automáticamente.

## Paleta de colores (Industrial)

- **Amarillo industrial** `#FACC15` — Acción primaria
- **Negro** `#0A0A0A` — Sidebar, header oscuro
- **Gris oscuro** `#171717 / #262626` — Backgrounds
- **Azul profesional** `#2563EB` — Acentos analíticos
- **Blanco** — Contenido en light mode

## Licencia

Privado / Comercial.
