# Sistema de Tickets de Soporte

Aplicación de gestión de tickets de soporte. Un empleado (`USER`) reporta problemas y da seguimiento a los suyos; un administrador (`ADMIN`) gestiona todos los tickets del sistema.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **PostgreSQL** + **Drizzle ORM**
- Autenticación propia: sesiones en base de datos + cookie `httpOnly`
- **Zod** para validación de formularios

## Estructura del proyecto

```
src/
  app/
    (auth)/
      login/          -> formulario + server action de login
      register/        -> formulario + server action de registro
    tickets/
      new/              -> crear ticket
      [id]/              -> detalle, comentarios, controles de admin
        edit/             -> editar ticket (solo dueño, solo si no está resuelto)
      actions.ts          -> server actions: crear, editar, comentar, cambiar estado/prioridad
    page.tsx              -> dashboard (lista propia para USER, todos + filtros para ADMIN)
  db/
    schema.ts             -> modelo de datos (Drizzle)
    index.ts              -> cliente de conexión
  lib/
    auth/
      password.ts         -> hash/verificación (bcrypt)
      session.ts           -> crear/leer/destruir sesión
      guards.ts             -> requireUser / requireAdmin
      actions.ts             -> logout
    tickets/
      queries.ts            -> consultas reutilizables
    validations/            -> esquemas zod
  proxy.ts                  -> protección de rutas (login requerido, redirects)
drizzle/                    -> migraciones SQL generadas
scripts/seed.ts              -> crea el usuario administrador inicial
```

## Modelo de datos

- **users**: `id (uuid)`, `email` (único), `passwordHash`, `name`, `role` (`USER` | `ADMIN`), `createdAt`
- **tickets**: `id`, `title`, `description`, `status` (`OPEN` | `IN_PROGRESS` | `RESOLVED`), `priority` (`LOW` | `MEDIUM` | `HIGH`), `createdById` (FK a users), `createdAt`, `updatedAt`
- **comments**: `id`, `ticketId` (FK), `authorId` (FK a users), `content`, `createdAt`
- **sessions**: `id` (funciona como token de sesión), `userId` (FK), `expiresAt`, `createdAt`

## Seguridad

- Contraseñas hasheadas con `bcryptjs` (nunca en texto plano).
- Sesión con cookie `httpOnly`, `sameSite: lax`, y `secure` en producción; el token vive en una tabla `sessions` con expiración, así que se puede invalidar del lado del servidor.
- **Dos capas de protección de rutas**: `src/proxy.ts` bloquea a nivel de ruta a quien no tiene sesión válida; `requireUser`/`requireAdmin` vuelven a validar dentro de cada página/acción.
- **Autorización por recurso**: en `/tickets/[id]` y en cada server action se verifica que el usuario sea el dueño del ticket o un admin — si no, la respuesta es un 404 genérico, sin importar que la URL/ID se haya escrito a mano. Ver `src/app/tickets/[id]/page.tsx` y `src/app/tickets/actions.ts`.
- Todas las validaciones de entrada (títulos, descripciones, comentarios, estado, prioridad) se revisan con `zod` **en el servidor**, nunca se confía en el cliente.

## Cómo correrlo localmente

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear `.env.local` con la conexión a tu Postgres:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_tickets"
   ```
3. Aplicar las migraciones:
   ```bash
   npm run db:migrate
   ```
4. Crear el usuario administrador:
   ```bash
   npm run db:seed
   ```
5. Levantar la app:
   ```bash
   npm run dev
   ```
6. Entrar en `http://localhost:3000`. Puedes registrarte como `USER` desde `/register`, o entrar como admin con el usuario creado por el seed.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la app en desarrollo |
| `npm run build` / `npm run start` | Build y arranque en producción |
| `npm run db:generate` | Genera una migración a partir de `schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:studio` | Visor web de la base de datos |
| `npm run db:seed` | Crea el usuario administrador inicial |
