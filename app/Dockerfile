# Use Node.js LTS (20.x) as the base image
FROM node:20-bullseye-slim as base

# Install build dependencies and tools
RUN apt-get update && apt-get install -y \
    build-essential \
    libusb-1.0-0-dev \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*


ENV SHELL=/bin/bash
ENV PORT=80

# Install pnpm
RUN curl -fsSL https://get.pnpm.io/install.sh | SHELL=/bin/bash sh - \
    && SHELL=/bin/bash /root/.local/share/pnpm/pnpm setup
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

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