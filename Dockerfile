FROM node:22-slim

# Install dependencies
RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application files
COPY . .

# Copy and make start script executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Install OpenClaw
RUN curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard

# Add OpenClaw to PATH
ENV PATH="/root/.local/bin:$PATH"

# Expose port
EXPOSE 8080

# Start command
CMD ["/bin/bash", "/app/start.sh"]
