FROM node:12.20.2-alpine AS base

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
RUN npm install --only=production && rm -rf /home/node/.npm
COPY --chown=node:node --from=build /opt/build/dist /opt/service/dist

EXPOSE 3000

CMD ["npm", "start"]
