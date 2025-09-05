# Use Node.js LTS version
FROM node:20-alpine

# Install necessary build tools for native dependencies
RUN apk add --no-cache build-base gcc autoconf automake libtool zlib-dev libpng-dev nasm bash vips-dev git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build Strapi admin panel
RUN npm run build

# Expose the port Strapi runs on
EXPOSE 1337

# Start Strapi
CMD ["npm", "start"]