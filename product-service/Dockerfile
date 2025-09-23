FROM node:18-alpine

WORKDIR /app

COPY package*.json yarn.lock* ./
RUN yarn install --production

COPY --chown=node:node src/ ./src/

EXPOSE 3002

USER node

CMD ["yarn", "start"]