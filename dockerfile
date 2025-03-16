FROM node:23
WORKDIR /usr/src/mailsswift
COPY package*.json ./
COPY . .
RUN yarn install
CMD ["yarn", "dev"]
