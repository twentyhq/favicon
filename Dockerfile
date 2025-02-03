FROM node:18.16.0 as server

WORKDIR /app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

CMD ["node", "dist/main"]
