FROM node:16-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY ./package.json .
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]