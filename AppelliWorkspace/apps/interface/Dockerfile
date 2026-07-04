# syntax=docker/dockerfile:1

# Build context is the workspace root (AppelliWorkspace), e.g.:
#   docker build -f apps/interface/Dockerfile -t appelli-interface .

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
RUN npx nx build interface --configuration=production

FROM nginx:1.27-alpine AS runtime
COPY apps/interface/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/interface/dist /usr/share/nginx/html

EXPOSE 80
