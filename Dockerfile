# Use Node.js 22 LTS
FROM node:22-slim

# Install curl and bash for the OpenClaw installer
RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build || npx tsc

# Install OpenClaw using the official installer (non-interactive)
RUN curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard

# Create necessary directories for openclaw
RUN mkdir -p /app/workspace /app/memory

# Expose port
EXPOSE 8080

# Start openclaw gateway with the MCP server
CMD ["openclaw", "gateway", "--allow-unconfigured", "--bind", "0.0.0.0", "--port", "8080"]
