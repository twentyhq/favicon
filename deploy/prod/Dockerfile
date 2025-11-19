FROM node:24-alpine AS server

WORKDIR /app
COPY package.json yarn.lock ./

# add python + build tools for node-gyp
RUN apk add --no-cache python3 make g++ \
  && yarn install \
  && apk del python3 make g++

COPY . .
RUN yarn build

CMD ["node", "dist/main"]
