FROM node:16.18-alpine
WORKDIR /calendar
COPY package*.json ./
COPY . .
EXPOSE 3000
CMD [ "node", "backend/app.js"]