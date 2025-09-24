# FROM node:18-alpine

# WORKDIR /app

# # Copy package files from product-service directory
# COPY product-service/package*.json ./
# COPY product-service/yarn.lock* ./

# # Install dependencies
# RUN yarn install --frozen-lockfile --production

# # Copy the entire product-service directory (including shared if it exists there)
# COPY product-service/src/ ./src/
# COPY shared/ ./shared/

# # Set proper ownership
# RUN chown -R node:node /app
# USER node

# EXPOSE 3002
# CMD ["yarn", "start"]


FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY product-service/package.json product-service/yarn.lock ./

# Copy shared directory
COPY shared ./shared

# Copy service-specific code
COPY product-service/src ./src

RUN yarn install

CMD ["yarn", "start"]