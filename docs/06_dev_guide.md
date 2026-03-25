# Developer Guide

## Prerequisites

- Node.js >= 20
- PostgreSQL (local or Docker)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (for builds)
- Railway CLI: `npm install -g @railway/cli` (for deployment)

## Setup

```bash
git clone <repo-url>
cd lightroutine
npm install
cp .env.example .env
# Configure DATABASE_URL and JWT secrets in .env
npm run db:generate
npm run db:migrate
```

## Development

```bash
# API (terminal 1)
npm run dev:api

# Mobile (terminal 2)
npm run dev:mobile
```

## Database

```bash
npm run db:generate    # Regenerate Prisma client
npm run db:migrate     # Create/apply migrations (dev)
npm run db:studio      # Visual DB browser
npm run db:seed        # Seed data
```

## Deploy

### Backend (Railway)
```bash
railway link           # Link to Railway project
railway up             # Manual deploy
railway logs           # View logs
railway variables      # Manage env vars
```

Tag-based auto deploy:
```bash
npm run version:patch  # Bumps version, pushes to main + tags
```

### Mobile (EAS)
```bash
eas build --platform all    # Build for iOS + Android
eas submit --platform all   # Submit to stores
```

## CI

CI runs only on manual trigger via GitHub Actions:
Go to Actions tab -> CI workflow -> Run workflow
