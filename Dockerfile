FROM node

RUN npm install -g configurable-http-proxy

ENV CONFIGPROXY_AUTH_TOKEN=123

CMD configurable-http-proxy --port $PORT --api-port 8001 --default-target=http://localhost:8001
