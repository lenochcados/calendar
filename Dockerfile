FROM node:16.18-bullseye-slim
WORKDIR /calendar
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "backend/app.js"]