# Dockerfile para o servidor Node.js com Bun
FROM oven/bun:1 AS base
WORKDIR /app

# Instalar dependências
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build da aplicação
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar apenas o necessário
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.ts ./bun.ts
COPY --from=builder /app/compression-polyfill.ts ./compression-polyfill.ts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/trigger.config.ts ./trigger.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

CMD ["bun", "start"]