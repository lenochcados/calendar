FROM alpine:3.16
WORKDIR /calendar
COPY package*.json ./
# RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "backend/app.js"]