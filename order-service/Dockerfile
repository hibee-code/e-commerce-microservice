FROM node:18-alpine

WORKDIR /app

COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production

COPY --chown=node:node src/ ./src/

EXPOSE 3003

USER node

CMD ["yarn", "start"]