FROM node:20-alpine

RUN apk add --no-cache openssl

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

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
