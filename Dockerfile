FROM node:20.12-alpine3.19 AS base

FROM base AS build
RUN mkdir -p /opt/build
WORKDIR /opt/build
COPY package*.json tsconfig*.json ./
RUN npm install
COPY src src
RUN npm run build

FROM base AS release
RUN mkdir -p /opt/service && chown -R node: /opt/service
USER node
WORKDIR /opt/service
COPY --chown=node:node package*.json ./
RUN npm install --omit=dev && rm -rf /home/node/.npm
COPY --chown=node:node --from=build /opt/build/dist /opt/service/dist
COPY --chown=node:node public public

EXPOSE 3000

CMD ["node", "dist/app.js"]
