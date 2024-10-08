FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=development

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

