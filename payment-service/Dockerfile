FROM node:18-alpine

WORKDIR /app

# Debug: Show what files are available during build
RUN echo "=== BUILD CONTEXT DEBUG ==="
COPY . /tmp/build-context/
RUN ls -la /tmp/build-context/
RUN ls -la /tmp/build-context/shared/ || echo "shared folder not found in build context"

# Copy package files from payment-service directory
COPY payment-service/package*.json ./
COPY payment-service/yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy shared folder from root - EXPLICIT PATH
COPY ./shared ./shared

# Verify shared folder was copied
RUN ls -la shared/ || echo "shared folder not copied"
RUN ls -la shared/database/ || echo "shared/database not found"

# Copy payment-service source code
COPY payment-service/src/ ./src/

# Debug: Show final structure
RUN echo "=== FINAL CONTAINER STRUCTURE ==="
RUN ls -la
RUN find . -name "*.js" | head -10

# Set proper ownership and switch to node user
RUN chown -R node:node /app
USER node

EXPOSE 3004

CMD ["yarn", "start"]

FROM node:18-alpine

WORKDIR /app

# Copy package files from payment-service directory
COPY payment-service/package*.json ./
COPY payment-service/yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy the entire payment-service directory (including shared if it exists there)
COPY payment-service/src/ ./src/
COPY shared/ ./shared/

# Set proper ownership
RUN chown -R node:node /app
USER node

EXPOSE 3004

CMD ["yarn", "start"]

