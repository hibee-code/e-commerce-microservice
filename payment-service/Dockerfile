FROM node:18-alpine

WORKDIR /app

# Copy package files from payment-service directory
COPY payment-service/package*.json ./
COPY payment-service/yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy shared folder from root (if it exists)
COPY shared/ ./shared/

# Copy payment-service source code
COPY payment-service/src/ ./src/

# Set ownership and switch to node user
RUN chown -R node:node /app
USER node

EXPOSE 3004

CMD ["yarn", "start"]