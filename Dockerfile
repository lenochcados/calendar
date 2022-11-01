FROM node:16.18.0
WORKDIR /calendar
COPY package*.json ./
RUN npm install
# RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD [ "node", "backend/app.js"]