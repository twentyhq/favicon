FROM node:26-alpine AS server

WORKDIR /app

# Node 26 no longer includes Corepack.
RUN npm install --global corepack@0.36.0 && corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

# add python + build tools for node-gyp
RUN apk add --no-cache python3 make g++ \
  && yarn install --immutable \
  && apk del python3 make g++

COPY . .
RUN yarn build

CMD ["node", "dist/main"]
