# Build app in production mode
FROM node:22.6-alpine3.20 As prod-build
ARG GITHUB_TOKEN
ARG APP_NAME

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci 

COPY ./ ./
RUN npm run build ${APP_NAME}


# Local environment
FROM node:22.6-alpine3.20 As local
ARG GITHUB_TOKEN
ARG APP_NAME
WORKDIR /usr/src/app

# Development environment
FROM node:22.6-alpine3.20 As development
ARG APP_NAME
WORKDIR /opt/app

COPY package*.json ./
COPY --from=prod-build /usr/src/app/node_modules/ ./node_modules/
COPY --from=prod-build /usr/src/app/dist/apps/${APP_NAME}/ .
CMD ["node", "main.js"]

# Production environment
FROM node:22.6-alpine3.20 As production
ARG APP_NAME
WORKDIR /opt/app

COPY package*.json ./
COPY ./env ./env
COPY --from=prod-build /usr/src/app/node_modules/ ./node_modules/
COPY --from=prod-build /usr/src/app/dist/apps/${APP_NAME}/ .
CMD ["node", "main.js"]
