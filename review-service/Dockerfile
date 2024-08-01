FROM node:20

# Set working directory
WORKDIR /app

# Copy shared package and service package files
COPY shared ./shared
COPY review-service/package*.json ./

# Install dependencies for shared package and build it
RUN cd shared && npm install && npm run build

# Copy the rest of the service files
COPY review-service/ ./review-service

# Install service dependencies
WORKDIR /app/review-service
RUN npm install

# Build the service
RUN npm run build

# Start the service
CMD ["npm", "start"]
