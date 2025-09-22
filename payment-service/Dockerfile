FROM node:18-alpine

WORKDIR /app

COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production

COPY --chown=node:node src/ ./src/

EXPOSE 3004

USER node

CMD ["sh", "-c", "yarn worker & yarn start"]