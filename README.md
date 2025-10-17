# v2-saas-solution

A Next.js 15 SaaS starter with multi-tenant organization support, built with App Router, Better Auth, Prisma, and shadcn/ui.

## Features

- 🔐 **Better Auth** - Comprehensive authentication with email/password, sessions, and role-based access
- 🏢 **Multi-tenant Organizations** - Full organization management with teams and member roles
- 🎨 **shadcn/ui** - Beautiful, accessible UI components with dark mode support
- 🗄️ **Prisma** - Type-safe database ORM with PostgreSQL
- ⚡ **Next.js 15** - App Router with Turbopack for blazing fast builds
- 🐳 **Docker** - Local PostgreSQL development environment

## Getting Started

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Authentication
BETTER_AUTH_SECRET=generated_secret_value_using_best_practices

# URL for the authentication service
BETTER_AUTH_URL=http://localhost:3000 

# Public API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database if you are using Docker for local development.
# If you are using Neon or other postgres SAAS, keep only DATABASE_URL in production
DATABASE_URL=postgresql://postgres:password@localhost:5432/better_auth_tutorial
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=password
DB_USER=postgres
DB_NAME=better_auth_tutorial
```

**Note:** You can also reference `.example.env` for the complete environment configuration.

### Start Docker Database (Local Development)

If you're using Docker for local PostgreSQL, start the database first:

```bash
docker-compose up -d
```

This will start the PostgreSQL database in the background using the configuration in `docker-compose.yml`. Make sure Docker Desktop is running before executing this command.

**Useful Docker commands:**
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f

# Stop and remove volumes (caution: deletes data)
docker-compose down -v
```

### Run Database Migrations

After the database is running, apply the Prisma migrations:

```bash
npx prisma migrate dev
# or
pnpm prisma migrate dev
```

### Quick Start (Recommended)

Use the setup script to start everything at once:

```bash
pnpm db:setup  # Starts Docker and runs migrations
pnpm dev       # Start the development server
```

### Manual Setup

Or run each step individually:

```bash
# 1. Start Docker database
pnpm docker:up

# 2. Run database migrations
pnpm db:migrate

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Reset (When Switching Databases)

If you reset your database or switch to a new one, you may encounter session errors. Here's how to handle it:

**Option 1: Full Reset (Recommended)**
```bash
pnpm docker:reset  # Stops Docker, removes volumes, and restarts
pnpm db:migrate    # Apply migrations to fresh database
```

**Option 2: Database Only Reset**
```bash
pnpm db:reset      # Resets database schema and data
```

**Note:** The application now includes middleware that automatically clears invalid session cookies when the database changes, so you shouldn't need to manually clear browser cookies anymore.

## 📚 Documentation

Comprehensive project documentation is available in the [`docs/`](./docs) folder:

- **[Architecture Decision Records (ADRs)](./docs/adr/)** - Architectural decisions and rationale
- **[Implementation Guides](./docs/guides/)** - Step-by-step guides for common tasks
- **[Documentation Index](./docs/README.md)** - Complete documentation overview

### Quick Links

- [Organizations Module Structure](./docs/adr/ADR-001-admin-organizations-restructuring.md)
- [Navigation Best Practices](./docs/adr/ADR-002-admin-portal-home-navigation.md)
- [Next.js 15 Patterns](./docs/adr/ADR-004-next-js-15-params-and-ux-fixes.md)
- [Copilot Instructions](./.github/copilot-instructions.md)

## Tech Stack

- **Framework:** Next.js 15 with App Router and Turbopack
- **Authentication:** Better Auth with admin and organization plugins
- **Database:** PostgreSQL with Prisma ORM
- **UI Components:** shadcn/ui (New York variant)
- **Styling:** Tailwind CSS with CSS variables
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod v4
- **Package Manager:** pnpm

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (admin)/             # Admin portal routes
│   ├── (organization)/      # Organization-specific routes
│   ├── dashboard/           # User dashboard
│   └── api/auth/            # Better Auth API routes
├── components/              # React components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Core utilities
│   ├── auth.ts             # Better Auth configuration
│   ├── auth-client.ts      # Client-side auth utilities
│   └── prisma.ts           # Prisma client singleton
├── prisma/                  # Database schema and migrations
├── docs/                    # Project documentation
└── utils/                   # Helper utilities
```

## Contributing

Please refer to the [documentation](./docs) for development guidelines and architectural decisions.

## License

This project is private and proprietary.
