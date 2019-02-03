# Stage 0 : "build"
FROM node:11 as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install
COPY ./ /app/

RUN npm run build

# Stage 1 : "deploy"
FROM nginx:stable-alpine

RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

WORKDIR /usr/share/nginx/html

COPY --from=build-stage /app/build/ /usr/share/nginx/html
