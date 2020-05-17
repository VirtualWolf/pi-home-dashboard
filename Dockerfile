FROM node:12.16.3-alpine

RUN mkdir -p /opt/service && \
    chown -R node: /opt/service
USER node
WORKDIR /opt/service

COPY package*.json ./
RUN npm install
COPY app.js .

EXPOSE 3000

CMD ["node", "app.js"]