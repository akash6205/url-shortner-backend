FROM mhart/alpine-node AS base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json .

RUN npm install

FROM base AS development

COPY . .

CMD [ "npm", "run", "dev" ]

FROM base AS production

COPY . .

CMD [ "npm", "run","start" ]