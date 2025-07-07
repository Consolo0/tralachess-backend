FROM node:20

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 60000

CMD ["npm", "run", "dev"]