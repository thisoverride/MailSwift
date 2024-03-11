FROM node:21
WORKDIR /usr/src/mailswift
COPY package.json yarn.lock ./
RUN yarn install
COPY . .