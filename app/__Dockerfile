# Use Node.js LTS (18.x) as the base image
FROM node:18-alpine

# Install build dependencies and tools
RUN apk add --no-cache \
    build-base \
    python3 \
    make \
    g++ \
    curl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

ENV PORT=80

# Install pnpm globally using npm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm run build:remix && pnpm prune --prod

# Start the server
CMD ["pnpm", "start"]

# Expose the port the app runs on
EXPOSE 80