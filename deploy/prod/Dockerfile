FROM node:24-alpine AS server

WORKDIR /app

# Corepack ships with Node but is disabled by default inside the image.
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

# add python + build tools for node-gyp
RUN apk add --no-cache python3 make g++ \
  && yarn install --immutable \
  && apk del python3 make g++

COPY . .
RUN yarn build

CMD ["node", "dist/main"]
