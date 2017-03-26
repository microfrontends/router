FROM node

COPY package.json .
RUN npm install
COPY . .

CMD MONGODB_URI=$MONGODB_URI PORT=$PORT node server.js
