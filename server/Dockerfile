FROM node:22-alpine

RUN apk add py-setuptools

#Install and cache node_modules
WORKDIR /base
COPY package.json .
COPY yarn.lock .
COPY shared/package.json shared/
COPY server/package.json server/
RUN yarn install --frozen-lockfile

COPY ./shared shared
COPY ./server server
RUN yarn workspace server build

WORKDIR /base/server
VOLUME /data
EXPOSE 5000
CMD ["yarn", "start"]
