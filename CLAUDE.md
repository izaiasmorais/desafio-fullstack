# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo webhook inspector application built with pnpm workspaces, consisting of two packages:
- **api**: Fastify-based REST API with PostgreSQL database (Drizzle ORM)
- **web**: React SPA using TanStack Router and Tailwind CSS

The application captures incoming webhook requests at `/capture/*` endpoints, stores them in PostgreSQL, and displays them in a web interface for inspection.

## Technology Stack

### API (Backend)
- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify with Zod type provider for request/response validation
- **Database**: PostgreSQL with Drizzle ORM
- **Documentation**: Swagger/OpenAPI with Scalar UI (available at `/docs`)
- **Validation**: Zod schemas with drizzle-zod integration
- **ID Generation**: UUIDv7 for webhook IDs

### Web (Frontend)
- **Framework**: React 19 with TypeScript
- **Router**: TanStack Router (file-based routing)
- **Styling**: Tailwind CSS v4 with tailwind-variants and tailwind-merge
- **UI Components**: Radix UI primitives (checkbox, etc.)
- **Build Tool**: Vite

## Common Commands

### Root Level
```bash
pnpm install
```

### API Development
```bash
cd api
pnpm dev                # Start dev server with watch mode (port 3333)
pnpm lint               # Format code with Biome
pnpm generate           # Generate Drizzle migrations from schema
pnpm migrate            # Run pending migrations
pnpm studio             # Open Drizzle Studio (database GUI)
pnpm seed               # Seed the database
```

### Web Development
```bash
cd web
pnpm dev                # Start Vite dev server
pnpm build              # Build for production (runs TypeScript check first)
pnpm preview            # Preview production build
pnpm format             # Format code with Biome
```

## Architecture

### API Architecture

**Database Layer** (`api/src/db/`)
- `schema/`: Drizzle table definitions (uses snake_case for columns)
- `migrations/`: Generated SQL migration files
- `index.ts`: Database connection and client export
- `seed.ts`: Database seeding script

**Routes** (`api/src/routes/`)
All routes are registered as Fastify plugins in `server.ts`:
- `capture-webhook.ts`: Wildcard route (`/capture/*`) that accepts ALL HTTP methods and stores webhook data
- `list-webhooks.ts`: GET endpoint to retrieve all webhooks
- `get-webhook.ts`: GET endpoint to retrieve single webhook by ID
- `delete-webhook.ts`: DELETE endpoint to remove a webhook

**Server Setup** (`api/src/server.ts`)
Configures Fastify with:
- CORS enabled for all origins
- Zod validator and serializer compilers
- Swagger/OpenAPI schema generation
- Scalar API documentation UI

**Environment** (`api/src/env.ts`)
Uses Zod schema validation for environment variables:
- `NODE_ENV`: Environment (development/production/test)
- `PORT`: Server port (default: 3333)
- `DATABASE_URL`: PostgreSQL connection string (required)

### Web Architecture

**Routing** (`web/src/routes/`)
Uses TanStack Router file-based routing:
- `__root.tsx`: Root layout component
- `index.tsx`: Main webhook inspector page with panel layout
- `routeTree.gen.ts`: Auto-generated route tree (do not edit manually)

**Components** (`web/src/components/`)
- `sidebar.tsx`: Left panel showing webhooks list
- `webhooks-list.tsx` & `webhooks-list-item.tsx`: Webhook list components
- `webhook-detail-header.tsx`: Top section of detail view
- `section-title.tsx`: Section heading component
- `section-data-table.tsx`: Key-value data display
- `ui/`: Reusable UI primitives (code-block, etc.)

**Main Entry** (`web/src/main.tsx`)
Sets up:
- Router creation from generated route tree
- Type-safe router registration
- React 19 StrictMode rendering

## Key Patterns

### Database Schema Pattern
Tables use snake_case for column names (configured in drizzle.config.ts). The webhooks table stores:
- Request metadata (method, pathname, IP, status code)
- Content information (type, length)
- Headers and query params as JSONB
- Request body as text
- Timestamps with defaultNow()

### Route Registration Pattern
All API routes follow the FastifyPluginAsyncZod pattern and are registered in server.ts. Routes define inline Zod schemas for validation and OpenAPI documentation.

### Webhook Capture Flow
1. Any HTTP request to `/capture/*` is intercepted
2. Method, headers, body, IP, and pathname are extracted
3. Data is inserted into the webhooks table
4. Webhook ID is returned in the response

### Type Safety
- API uses fastify-type-provider-zod for end-to-end type safety
- Frontend uses TanStack Router's type-safe routing
- Drizzle schema generates TypeScript types for database operations

## Configuration Files

- `drizzle.config.ts`: Drizzle Kit configuration (PostgreSQL, snake_case naming)
- `biome.json`: Code formatting rules (both workspaces)
- `tsconfig.json`: TypeScript compiler options (both workspaces)
- `pnpm-workspace.yaml`: Workspace package definitions
- `.env` (not committed): Required environment variables for API

## API Documentation

When the API is running, Swagger documentation is available at:
- http://localhost:3333/docs (Scalar UI with laserwave theme)
