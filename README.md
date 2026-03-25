# LightRoutine

Routine tracking app for iOS and Android.
Build better habits and track your daily routines.

## Architecture

```
lightroutine/
├── apps/
│   ├── api/           # NestJS backend (REST API)
│   └── mobile/        # Expo React Native app
├── packages/
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # Shared utility functions
│   └── config/        # Shared constants
├── database/          # Prisma schema & migrations
└── docs/              # Documentation
```

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start API server
npm run dev:api

# Start mobile app (in another terminal)
npm run dev:mobile
```

## All Commands

| Command | Description |
|---------|-------------|
| `npm run dev:api` | Start API dev server |
| `npm run dev:mobile` | Start Expo dev server |
| `npm run build:api` | Build API for production |
| `npm run build:mobile` | Build mobile app |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Test all workspaces |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run DB migrations (dev) |
| `npm run db:migrate:prod` | Deploy DB migrations (prod) |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run version:patch` | Bump version + push tags |
| `npm run clean` | Clean all build artifacts |

## Tech Stack

- **Mobile**: Expo, Expo Router, Zustand, TanStack Query
- **Backend**: NestJS, Prisma, PostgreSQL
- **Deploy**: Railway (API), EAS Build (mobile)

## Docs

- [Overview](docs/00_overview.md)
- [Requirements](docs/01_requirements.md)
- [Domain](docs/02_domain.md)
- [Use Cases](docs/03_usecases.md)
- [Architecture](docs/04_architecture.md)
- [API](docs/05_api.md)
- [Dev Guide](docs/06_dev_guide.md)
