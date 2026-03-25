# Architecture

## Monorepo Structure

```
lightroutine/
├── apps/
│   ├── api/              # NestJS REST API (single backend)
│   └── mobile/           # Expo React Native (iOS + Android)
├── packages/
│   ├── types/            # Shared DTO / interfaces
│   ├── utils/            # Pure utility functions
│   └── config/           # Shared constants
├── database/             # Prisma schema, migrations, seed
└── docs/                 # Documentation
```

## Data Flow

1. Mobile app -> REST API -> PostgreSQL
2. Auth via JWT Bearer tokens
3. Zustand for client state, TanStack Query for server state cache

## Deployment

- Backend: Railway (Dockerfile, tag-based deploy)
- Mobile: EAS Build -> App Store / Google Play
- CI: GitHub Actions (manual workflow_dispatch for lint/test)
- Env vars: .env (dev), Railway Variables (prod)
