# Project Setup Guide

Complete guide for setting up the v2-saas-solution project locally.

## Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 8.x or higher
- **Docker Desktop** (for local PostgreSQL)
- **Git**

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/aniketicloud/v2-saas-solution.git
cd v2-saas-solution
```

### 2. Install Dependencies

```bash
pnpm install
```

This will also run `postinstall` to generate the Prisma client automatically.

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Authentication
BETTER_AUTH_SECRET=2S9eBaEC8yfsJXEdrHUJGRVxRoZ4OStR
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Docker Database (Local Development)
DATABASE_URL=postgresql://postgres:password@localhost:5432/v2_saas_solution
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=password
DB_USER=postgres
DB_NAME=v2_saas_solution
```

**Note:** Copy from `.example.env` for reference.

### 4. Start Docker Database

Start the PostgreSQL database container:

```bash
pnpm docker:up
```

This runs `docker-compose up -d` with environment variables from `.env.local`.

**Verify Docker is running:**
```bash
pnpm docker:logs
```

### 5. Run Database Migrations

Apply Prisma migrations to create the database schema:

```bash
pnpm db:migrate
```

This will:
- Create all necessary tables
- Apply migration history
- Generate Prisma client

### 6. Seed the Database

Create test user accounts:

```bash
pnpm db:seed
```

This creates:
- **Admin**: `admin@email.com` / `11111111`
- **User**: `user@email.com` / `11111111`

### 7. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quick Start (All-in-One)

For a fresh setup, run these commands in sequence:

```bash
pnpm install
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Common Tasks

### View Database

Open Prisma Studio to browse your database:

```bash
pnpm db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Reset Everything

If you need to start fresh:

```bash
pnpm docker:reset  # Reset Docker volumes
pnpm db:migrate    # Reapply migrations
pnpm db:seed       # Reseed test data
```

### Regenerate Prisma Client

After schema changes:

```bash
pnpm db:generate
```

### Stop Docker

When you're done developing:

```bash
pnpm docker:down
```

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Check what's using port 5432
netstat -ano | findstr :5432  # Windows
lsof -i :5432                 # Mac/Linux

# Stop other PostgreSQL instances or change port in docker-compose.yml
```

**Docker not starting:**
- Ensure Docker Desktop is running
- Check Docker logs: `pnpm docker:logs`
- Try resetting: `pnpm docker:reset`

### Database Connection Issues

**"Can't reach database server":**
```bash
# Verify Docker is running
docker ps

# Check DATABASE_URL in .env.local matches Docker settings
# Default: postgresql://postgres:password@localhost:5432/v2_saas_solution
```

### Migration Issues

**"Migration failed":**
```bash
# Reset database completely
pnpm db:reset

# If issues persist, manually reset Docker
pnpm docker:down -v
pnpm docker:up
pnpm db:migrate
```

### Session/Authentication Issues

**"Invalid session" after database reset:**
- Clear browser cookies for `localhost:3000`
- The middleware should auto-clear invalid sessions
- Try incognito/private browsing mode

### Prisma Client Issues

**"Cannot find module '@prisma/client'":**
```bash
# Regenerate Prisma client
pnpm db:generate
```

**"Prisma schema out of sync":**
```bash
# After pulling schema changes
pnpm db:generate
pnpm db:migrate
```

## Development Workflow

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Create and apply migration:
   ```bash
   pnpm db:migrate
   ```
3. Prisma client regenerates automatically

### Testing Authentication

1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Login with test credentials:
   - Admin: `admin@email.com` / `11111111`
   - User: `user@email.com` / `11111111`

### Creating New Users

- **Via Signup Page**: [http://localhost:3000/signup](http://localhost:3000/signup)
- **Via Seed Script**: Edit `prisma/seed.ts` and run `pnpm db:seed`

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (admin)/             # Admin routes (admin role required)
│   ├── (organization)/      # Organization routes
│   ├── dashboard/           # User dashboard
│   └── api/auth/[...all]/   # Better Auth API handler
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── *-form.tsx           # Form components
├── lib/
│   ├── auth.ts             # Better Auth server config
│   ├── auth-client.ts      # Better Auth client config
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Database seeding script
│   └── migrations/         # Migration history
├── docs/                    # Project documentation
├── .env.local              # Local environment variables
└── docker-compose.yml      # PostgreSQL Docker config
```

## Next Steps

- Read [Architecture Decision Records](./adr/) for design decisions
- Check [Copilot Instructions](../.github/copilot-instructions.md) for development patterns
- Explore [Database Seeding Guide](./DATABASE_SEEDING.md) for seed customization

## Additional Resources

- [Better Auth Documentation](https://better-auth.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## Support

If you encounter issues not covered here:
1. Check existing [documentation](./README.md)
2. Review [ADRs](./adr/) for architectural context
3. Consult the project's issue tracker
