const express = require('express');
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;

const server = express();
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/microfrontends-router';

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

const createProxies = (db) => {
  const routesCollection = db.collection('routes');

  routesCollection.find({}).toArray((err, routes) => {
    if (err) console.error(err);

    routes.forEach(createProxy);
    db.close();
  });
}

const createProxy = ({ path, target }) =>
  server.use(path, proxy({ target, changeOrigin: true, pathRewrite: {[`^${path}`]: ''} }));

server.post('/api/routes', (req, res) => {
  if (req.query.api_key !== process.env.API_KEY) return res.end('Forbidden');
  const route = req.body;

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) console.error(err);
    const routesCollection = db.collection('routes');

    routesCollection.insertOne(route, (err, result) => {
      res.send('Route created, adding proxy...');
      createProxies(db);
    });
  });
});

server.delete('/api/routes', (req, res) => {
  if (req.query.api_key !== process.env.API_KEY) return res.end('Forbidden');
  const path = req.body.path;

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) console.error(err);
    const routesCollection = db.collection('routes');

    routesCollection.deleteOne({ path }, (err, result) => {
      res.send(`Route ${path} deleted, restart the server to take effect`);
      db.close();
    });
  });
});

mongoClient.connect(mongoUrl, (err, db) => {
  if (err) console.error(err);

  createProxies(db);
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Homepage listening on port ${port}`);
});
