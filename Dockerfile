FROM node:20-alpine

# Links the GHCR package to this repo (enables visibility/auto-update tooling)
LABEL org.opencontainers.image.source=https://github.com/Atifalin/imposter

WORKDIR /app

# Install dependencies required by SQLite and Prisma
RUN apk add --no-cache openssl python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set default environment variables (can be overridden at runtime)
# The database will be mounted in a volume at /app/data
ENV NODE_ENV="production"
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/prod.db"
ENV NEXT_PUBLIC_APP_URL=""
ENV NEXT_PUBLIC_SOCKET_URL=""
ENV ADMIN_PASSWORD="admin123"

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Make the start script executable
RUN chmod +x /app/start.sh

# Start the application via the script
CMD ["/app/start.sh"]
