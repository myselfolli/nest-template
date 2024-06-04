FROM node:lts-alpine As local

WORKDIR /usr/src/app

FROM node:lts-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm config set audit false
RUN npm config set fund false

RUN npm ci

COPY . .

RUN npm run build api

CMD ["node", "dist/apps/api/main"]

FROM node:lts-alpine As production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/api/main"]