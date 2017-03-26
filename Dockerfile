FROM node

COPY package.json .
RUN npm install
COPY . .

CMD API_KEY=$API_KEY MONGODB_URI=$MONGODB_URI PORT=$PORT node server.js
