# syntax=docker/dockerfile:1

# Build context is the workspace root (AppelliWorkspace), e.g.:
#   docker build -f apps/api/Dockerfile -t appelli-api .

FROM node:22-alpine AS deps
RUN npm install -g npm@11
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/interface/package.json apps/interface/package.json
COPY apps/api-e2e/package.json apps/api-e2e/package.json
COPY apps/interface-e2e/package.json apps/interface-e2e/package.json
RUN npm ci

FROM deps AS build
COPY . .
RUN npx nx run api:prune --configuration=production

# Runtime stage: only the pruned dist output + its own production deps
FROM node:22-alpine AS runtime
RUN npm install -g npm@11
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /workspace/apps/api/dist ./
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000
CMD ["node", "main.js"]
