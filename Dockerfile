# Use Node.js 22 LTS
FROM node:22-slim

# Install openclaw globally
RUN npm install -g @openclaw/cli

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

# Create necessary directories for openclaw
RUN mkdir -p /app/workspace /app/memory

# Expose port
EXPOSE 8080

# Start openclaw gateway with the MCP server
CMD ["openclaw", "gateway", "--allow-unconfigured", "--bind", "0.0.0.0", "--port", "8080"]
