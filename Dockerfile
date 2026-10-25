# Use official lightweight Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (production)
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Create data directory for persistent memory
RUN mkdir -p data

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the Jarvis Office System
CMD ["node", "server.js"]