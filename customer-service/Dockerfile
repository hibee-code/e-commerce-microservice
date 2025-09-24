FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY customer-service/package.json customer-service/yarn.lock ./

# Copy shared directory
COPY shared ./shared

# Copy service-specific code
COPY customer-service/src ./src

RUN yarn install

CMD ["yarn", "start"]
# FROM node:18-alpine

# WORKDIR /app

# # Copy package files from customer-service directory
# COPY customer-service/package*.json ./
# COPY customer-service/yarn.lock* ./

# # Install dependencies
# RUN yarn install --frozen-lockfile --production

# # Copy the entire customer-service directory (including shared if it exists there)
# COPY customer-service/src/ ./src/
# COPY shared/ ./shared/

# # Set proper ownership
# RUN chown -R node:node /app
# USER node

# EXPOSE 3001

# CMD ["yarn", "start"]