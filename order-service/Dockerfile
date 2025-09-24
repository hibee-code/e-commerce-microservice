FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY order-service/package.json order-service/yarn.lock ./

# Copy shared directory
COPY shared ./shared

# Copy service-specific code
COPY order-service/src ./src

RUN yarn install

CMD ["yarn", "start"]

# FROM node:18-alpine

# WORKDIR /app

# # Copy package files from order-service directory
# COPY order-service/package*.json ./
# COPY order-service/yarn.lock* ./

# # Install dependencies
# RUN yarn install --frozen-lockfile --production

# # Copy the entire order-service directory (including shared if it exists there)
# COPY order-service/src/ ./src/
# COPY shared/ ./shared/

# # Set proper ownership
# RUN chown -R node:node /app
# USER node

# EXPOSE 3003

# CMD ["yarn", "start"]