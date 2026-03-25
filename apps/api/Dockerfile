FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/config/package.json packages/config/
COPY database/package.json database/

RUN npm ci --workspace=apps/api --include-workspace-root

COPY tsconfig.base.json ./
COPY packages/ packages/
COPY database/ database/
COPY apps/api/ apps/api/

RUN npx prisma generate --schema=database/prisma/schema.prisma
RUN npm run build -w apps/api

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/database/prisma ./database/prisma
COPY --from=builder /app/packages ./packages

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "dist/main.js"]
