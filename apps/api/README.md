# Scryable API

The Node.js backend for Scryable — an inventory platform for second-hand video game stores.
Built with Fastify, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js + TypeScript (via `tsx` in development)
- **Framework:** Fastify 5
- **ORM:** Prisma 7 with `@prisma/adapter-pg` driver adapter
- **Database:** PostgreSQL 16
- **Auth:** JWT access tokens (15min) + refresh tokens (7 days) via `jsonwebtoken`
- **Validation:** Zod (schemas shared with `@scryable/shared`)
- **Security:** `@fastify/helmet`, `@fastify/rate-limit`, `@fastify/cors`, bcrypt password hashing

[//]: # (## Project Structure)

[//]: # (src/  )

[//]: # (  ├── generated/prisma/ # Prisma-generated client &#40;gitignored, run prisma generate&#41; |  )

[//]: # (  ├── lib/ │  )

[//]: # (    ├── prisma.ts # Lazy singleton Prisma client &#40;reads DATABASE_URL at runtime&#41; │  )

[//]: # (    ├── errors.ts # AppError class hierarchy &#40;NotFoundError, ConflictError, etc.&#41; │  )

[//]: # (    └── error-handler.ts # Global Fastify error handler &#40;Prisma, JWT, AppError&#41;  )

[//]: # (  ├── middleware/ │  )

[//]: # (    └── auth.ts # authenticate + requireOwner preHandler hooks  )

[//]: # (  ├── routes/ │  )

[//]: # (    ├── auth.routes.ts # POST /api/auth/register|login|refresh │   )

[//]: # (    ├── store.routes.ts # CRUD /api/stores │  )

[//]: # (    ├── item.routes.ts # CRUD /api/stores/:storeId/items/:id │  )

[//]: # (    └── search.routes.ts# GET /api/search  )

[//]: # (  ├── services/ │  )

[//]: # (    ├── auth.service.ts # Password hashing, JWT signing/verifying, user creation │  )

[//]: # (    ├── store.service.ts# Store CRUD with ownership checks │  )

[//]: # (    ├── item.service.ts # Item CRUD with store ownership verification │  )

[//]: # (    └── search.service.ts # Paginated item search with filters  )

[//]: # (  └── server.ts # Entry point — plugins, hooks, route registration )

## Prerequisites

- Node.js >= 18
- Docker Desktop (for local PostgreSQL)
- Yarn 4 (this project uses Yarn workspaces — run commands from the monorepo root or use `yarn workspace @scryable/api <cmd>`)

## Environment Variables

Create a `.env` file in `apps/api/`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scryable?schema=public"
JWT_SECRET="a-long-random-secret"
JWT_REFRESH_SECRET="another-long-random-secret"
PORT=3000
```
⚠️ JWT_SECRET and JWT_REFRESH_SECRET must be long, random strings in production. Never commit the .env file — it is gitignored.

## Getting Started
1. Install dependencies (from monorepo root)
``` bash
   yarn install
```

2. Start PostgreSQL in Docker
``` bash
docker run --name scryable-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=scryable \
  -p 5432:5432 \
  -d postgres:16
```

3. Generate the Prisma client and run migrations
``` bash
   cd apps/api
   npx prisma generate
   npx prisma migrate dev --name init
```

4. Start the development server (From the monorepo root):
``` bash
yarn api
```

The API will be available at `http://localhost:3000`.

## Testing the API
If you're using IntelliJ IDEA, open requests.http — it contains ready-to-run requests for every endpoint. Select the dev environment from the dropdown to use variables from http-client.private.env.json (see http-client.env.json for the shape).

## Important Architecture Notes

### Environment variables are read lazily
DATABASE_URL and JWT secrets are read inside functions at call time — not at module load time. This is required because ES module imports are hoisted before dotenv.config() runs. Do not assign process.env.X to a module-level const.

### Prisma client is a lazy singleton
src/lib/prisma.ts uses a Proxy to defer PrismaClient initialisation until the first database call. This ensures DATABASE_URL is loaded before the connection is attempted.

### Ownership is enforced in the service layer
Routes do not check ownership directly. Services (store.service.ts, item.service.ts) verify that the authenticated user owns the relevant store before any write operation. A failed ownership check returns null, which the route translates to a 404 — deliberately not revealing whether the resource exists.

### Future Work
 * **Full-text search upgrade** — see prisma/full-text-search.sql for a ready-to-apply PostgreSQL tsvector index migration that replaces the current ILIKE search. 
 * **Refresh token rotation** — store refresh tokens in the database and invalidate on use. 
 * **Image uploads** — add POST /api/upload using @fastify/multipart + Cloudinary/Supabase Storage. 
 * **Password reset** — email-based flow using Resend or SendGrid. 
 * **Deployment** — Dockerise and deploy to Railway or Render; use prisma migrate deploy (not dev) in production.```
