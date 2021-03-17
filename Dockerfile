# -----Base-----
FROM node:14-alpine AS base

WORKDIR /app

# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS builder

COPY package*.json .babelrc.json .env ./

# Install all dependencies, both production and development
RUN npm install

# Copy the source files
COPY ./src ./src

# Build the app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ---------- Release ----------
FROM base AS release

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled app
COPY --from=builder /app/dist ./dist

# Copy package.json for config usages
COPY --from=builder /app/package.json ./

# Copy .env for access envirnoment variable definitions
COPY --from=builder /app/.env ./

CMD ["node", "./dist/index.js"]


