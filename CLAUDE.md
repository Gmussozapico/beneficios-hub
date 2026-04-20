# Perksly — Guía de proyecto para Claude

> Este archivo es la fuente de verdad del proyecto. **Actualízalo cada vez que se hagan cambios estructurales, de stack, de despliegue o de funcionalidades.**

---

## Descripción

**Perksly** es una plataforma SaaS que centraliza descuentos y beneficios de tarjetas de banco, compañías de telefonía y tarjetas de retail chilenas. Los usuarios crean una cuenta, agregan sus proveedores (bancos, telefonías, retail) y ven todos sus beneficios en un solo lugar, filtrados por categoría, tipo y día de la semana.

- **Repo GitHub:** `Gmussozapico/perksly`
- **URL Frontend:** https://frontend-production-d411.up.railway.app
- **URL Backend API:** https://backend-production-84219.up.railway.app
- **Proyecto Railway:** `positive-upliftment`
- **Demo:** `demo@perksly.app` / `demo1234`

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express 4 |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL (Railway) / SQLite (local dev) |
| Auth | JWT (7 días) + bcryptjs |
| Frontend | React 18 + Vite 5 |
| Estilos | Tailwind CSS 3 |
| Iconos | lucide-react |
| HTTP client | axios |
| Router | react-router-dom v6 |

---

## Estructura de archivos

```
beneficios-hub/
├── CLAUDE.md                   ← este archivo
├── .gitignore
├── README.md
├── railway.json                ← config de build para Railway
├── start.sh                    ← inicia backend + frontend en dev
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── Procfile
│   ├── prisma/
│   │   ├── schema.prisma       ← modelos: User, Provider, ProviderCategory, Benefit, UserProvider
│   │   └── seed.js             ← 5 categorías, 16 proveedores, 40 beneficios, 1 usuario demo
│   └── src/
│       ├── index.js            ← servidor Express, CORS, helmet, morgan
│       ├── prismaClient.js     ← instancia singleton de Prisma
│       ├── middleware/
│       │   └── auth.js         ← verifica JWT, añade req.userId
│       └── routes/
│           ├── auth.js         ← POST /register, POST /login, GET /me
│           ├── providers.js    ← GET /providers, GET /providers/categories, GET /providers/:id
│           ├── benefits.js     ← GET /benefits (filtros: providerId, category, type, search)
│           └── user.js         ← rutas autenticadas de usuario (ver abajo)
│
└── frontend/
    ├── index.html              ← título "Perksly", favicon.svg
    ├── package.json
    ├── vite.config.js          ← proxy /api → localhost:3001 en dev
    ├── tailwind.config.js
    ├── public/
    │   └── favicon.svg         ← ícono "P" gradiente indigo/violeta
    └── src/
        ├── main.jsx
        ├── App.jsx             ← BrowserRouter + AuthProvider + rutas protegidas
        ├── index.css           ← utilidades Tailwind custom (.card, .btn-primary, .text-gradient, etc.)
        ├── context/
        │   └── AuthContext.jsx ← estado de auth global, instancia axios (`api`), JWT en localStorage
        ├── components/
        │   ├── Navbar.jsx      ← sticky, responsive, menú usuario
        │   ├── BenefitCard.jsx ← tarjeta de beneficio con tipo, descuento, términos expandibles
        │   ├── ProviderCard.jsx← logo Clearbit/Google + letra fallback, botón agregar/quitar
        │   └── ProviderSelector.jsx ← buscador de proveedores con filtro por categoría
        └── pages/
            ├── Landing.jsx     ← hero, proveedores, features, cómo funciona, testimonios, CTA
            ├── Login.jsx       ← form + botón demo (demo@perksly.app / demo1234)
            ├── Register.jsx
            ├── Dashboard.jsx   ← stats, "Beneficios para hoy", beneficios recientes, mis proveedores
            ├── MyBenefits.jsx  ← tabs días de semana + filtros tipo/categoría/búsqueda
            └── Explore.jsx     ← explorador de proveedores por categoría
```

---

## Modelos de base de datos (Prisma)

```prisma
User            — id, email, password, name, createdAt, updatedAt
ProviderCategory — id, name, slug, icon (emoji)
Provider        — id, name, slug, description, logoUrl, categoryId
Benefit         — id, title, description, discount, type, category, providerId,
                  merchant?, location?, minPurchase?, maxDiscount?, url?,
                  validUntil?, terms?, imageUrl?, isActive, validDays Int[], createdAt
UserProvider    — id, userId, providerId, addedAt  [unique: userId+providerId]
BenefitUsage    — id, userId, benefitId, usedAt, savedAmount?  (registro de usos)
UserFavorite    — id, userId, benefitId, addedAt  [unique: userId+benefitId]
```

**`validDays`**: array de enteros (0=Dom, 1=Lun, … 6=Sáb). Array vacío = válido todos los días.

**Tipos de beneficio (`type`):** `PERCENTAGE` | `AMOUNT` | `FREEBIE` | `SPECIAL`

---

## API endpoints

### Auth — `/api/auth`
| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/register` | `{name, email, password}` | `{token, user}` |
| POST | `/login` | `{email, password}` | `{token, user}` |
| GET | `/me` | — (Auth header) | `{user}` |

### Providers — `/api/providers`
| Método | Ruta | Query params |
|---|---|---|
| GET | `/` | — |
| GET | `/categories` | — |
| GET | `/:id` | — |

### Benefits — `/api/benefits`
| Método | Ruta | Query params |
|---|---|---|
| GET | `/` | `providerId`, `category`, `type`, `search`, `limit` |

### User — `/api/user` (requiere JWT)
| Método | Ruta | Notas |
|---|---|---|
| GET | `/providers` | Proveedores del usuario |
| POST | `/providers` | Body: `{providerId}` |
| DELETE | `/providers/:providerId` | — |
| GET | `/benefits` | Filtros: `category`, `type`, `search` (incluye merchant), `dayOfWeek` (0-6) |
| GET | `/stats` | `{totalBenefits, totalProviders, categoriesCount, totalSaved, totalUsages}` |
| POST | `/benefits/:benefitId/use` | Body: `{savedAmount?}` — registra uso |
| GET | `/usages` | Últimos 20 usos registrados |
| GET | `/favorites` | Lista de beneficios favoritos |
| POST | `/favorites/:benefitId` | Agrega a favoritos |
| DELETE | `/favorites/:benefitId` | Quita de favoritos |

---

## Datos sembrados (seed.js)

**5 categorías de proveedor:** Banco 🏦, Telefonía 📱, Retail 🛍️, Seguros 🛡️, Entretenimiento 🎬

**16 proveedores** con logos via Google Favicon API (`https://www.google.com/s2/favicons?domain=<dominio>&sz=128`):
- Bancos: BCI, Santander, Banco de Chile, Itaú, Scotiabank, Banco Security, Banco Falabella, BancoEstado
- Telefonía: Entel, Movistar, Claro, WOM
- Retail: CMR Falabella, Ripley Card, La Polar Card
- Seguros: MetLife

**~200 beneficios reales** (basados en webs oficiales) con campos merchant, minPurchase, maxDiscount, validDays. En 13 categorías:

| Categoría | Emoji | Descripción |
|---|---|---|
| Café | ☕ | Cafeterías, desayuno, Starbucks, Juan Valdez, etc. |
| Restaurante | 🍽️ | Almuerzo, cena, Rappi, Uber Eats, etc. |
| Cine | 🎬 | Cinemark, Hoyts, Cinépolis |
| Eventos | 🎭 | Teatro, conciertos, Ticketmaster, Puntoticket |
| Moda | 👗 | Ropa, calzado, Falabella, Ripley, Zara, H&M, Adidas, Nike |
| Deporte | 🏋️ | Gym Smartfit, SportLife, Marathon Sport |
| Viajes | ✈️ | LATAM, Booking, Despegar, Uber, Roaming |
| Salud | 💊 | Farmacias Cruz Verde/Ahumada/Salcobrand, ópticas, clínicas |
| Tecnología | 💻 | Apple, Samsung, Sodimac, Linio, accesorios |
| Streaming | 🎵 | Netflix, Spotify, Disney+, Apple TV+, Paramount+, Max |
| Supermercado | 🛒 | Jumbo, Lider, Unimarc, Tottus |
| Combustible | ⛽ | COPEC, puntos CMR |
| Seguros | 🛡️ | Seguros de vida y viaje |

`validDays` especiales: varios beneficios de martes, miércoles, jueves o fin de semana; resto `[]` (todos los días).

**Usuario demo:** `demo@perksly.app` / `demo1234`

---

## Despliegue en Railway

**Proyecto:** `positive-upliftment` (workspace: `gmussozapico's Projects`)

| Servicio | ID | URL pública |
|---|---|---|
| `perksly-api` | `a3be02a8-...` | `backend-production-84219.up.railway.app` |
| `perksly-web` | `00626a62-...` | `frontend-production-d411.up.railway.app` |
| `postgres` | `af454787-...` | `postgres.railway.internal:5432` (privado) |

**Environment ID (production):** `b3ae2c6d-14e0-416e-935c-dd4acb4fb490`

### Variables de entorno del backend
```
DATABASE_URL=postgresql://postgres:beneficios_secure_2024@postgres.railway.internal:5432/beneficioshub
JWT_SECRET=beneficios_hub_jwt_secret_prod_2024_secure_key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://frontend-production-d411.up.railway.app
```

### Variables de entorno del frontend
```
VITE_API_URL=https://backend-production-84219.up.railway.app
```

### Comando de inicio en Railway
**Backend:** `npx prisma generate && npx prisma db push && node prisma/seed.js && node src/index.js`
**Frontend:** `npx serve -s dist -p $PORT` (el `-s` es crítico para SPA routing)

### Auto-deploy
Cualquier push a `main` en `Gmussozapico/perksly` dispara deploy automático en ambos servicios.

---

## Desarrollo local

Requiere PostgreSQL corriendo. La forma más rápida:

```bash
# 1. Levantar PostgreSQL con Docker
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=beneficioshub \
  postgres:16-alpine

# 2. Configurar backend/.env
cp backend/.env.example backend/.env
# Editar DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beneficioshub"

# 3. Instalar dependencias y sembrar DB
cd backend && npm install && npx prisma db push && node prisma/seed.js

# 4. Instalar dependencias frontend
cd ../frontend && npm install

# 5. Iniciar ambos servicios
cd .. && ./start.sh
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

---

## Decisiones técnicas importantes

- **`prisma db push` en vez de `migrate deploy`:** Se usa en Railway porque no hay historial de migraciones. Sincroniza el schema directamente con la DB. Si se cambia el schema, el siguiente deploy lo aplica automáticamente.
- **Seed idempotente:** Los proveedores usan `upsert` para no duplicarse. Los beneficios hacen `deleteMany` al inicio para poder actualizarse limpiamente.
- **Google Favicon API para logos:** Clearbit es poco confiable (especialmente dominios `.cl`). Google devuelve siempre una imagen.
- **`validDays` en frontend:** El filtrado por día se hace en JavaScript después de traer los datos del backend (no en la query SQL), para simplificar el código.
- **CORS:** El backend acepta `localhost:5173`, `localhost:4173` y `FRONTEND_URL` (env var). En producción esta variable apunta al dominio de Railway.

---

## Convenciones de código

- **Backend:** CommonJS (`require`/`module.exports`), async/await, manejo de errores con try/catch
- **Frontend:** ESModules, componentes funcionales con hooks, Tailwind para estilos (sin CSS modules)
- **Clases Tailwind custom** definidas en `frontend/src/index.css`: `.card`, `.btn-primary`, `.btn-ghost`, `.input`, `.text-gradient`
- **API calls:** siempre usar la instancia `api` exportada desde `AuthContext.jsx` (incluye el JWT automáticamente)

---

## Historial de cambios relevantes

| Fecha | Cambio |
|---|---|
| 2026-04-04 | Proyecto creado (BeneficiosHub): backend Node+Prisma+SQLite, frontend React+Vite |
| 2026-04-05 | Migración a PostgreSQL para Railway, despliegue inicial en `positive-upliftment` |
| 2026-04-05 | Rename a **Perksly**, logos proveedores, favicon SVG, filtros por día de semana, recomendación diaria en Dashboard |
| 2026-04-05 | Fix SPA 404: `serve -s`, logos → Google Favicon API |
| 2026-04-05 | ~120 beneficios (era 40), 13 categorías específicas (Café, Cine, Moda, etc.), vista por secciones en MyBenefits |
| 2026-04-19 | Sprint 1-4: schema extendido (merchant, minPurchase, maxDiscount, url, BenefitUsage, UserFavorite), ~200 beneficios reales, favoritos ⭐, "Ya lo usé" + ahorro registrado, chips contextuales (Hoy/Fin de semana), búsqueda por local, onboarding wizard |
