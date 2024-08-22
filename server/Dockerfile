FROM node:18-alpine

#Install and cache node_modules
WORKDIR /base
COPY package.json .
COPY yarn.lock .
COPY server/package.json server/
RUN yarn install --frozen-lockfile

COPY ./server server
RUN yarn workspace server build

WORKDIR /base/server
VOLUME /data
EXPOSE 5000
CMD ["yarn", "start"]
