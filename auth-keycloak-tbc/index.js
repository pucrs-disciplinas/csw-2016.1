const session = require('express-session');
const Keycloak = require('keycloak-connect');
const process = require('process');
const express = require('express');

const app = express();

const memoryStore = new session.MemoryStore();

const kcConfig = {
  clientId: process.env.KC_CLIENT_ID || 'auth-app',
  bearerOnly: true,
  serverUrl: process.env.KC_SERVER_URL || 'http://localhost:8080/auth',
  realm: process.env.KC_REALM || 'master',
  realmPublicKey: process.env.KC_PUBLIC_KEY
};

app.use(
  session({
    secret: 'abc1234',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

const keycloak = new Keycloak({ store: memoryStore }, kcConfig);

app.use(keycloak.middleware());

app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public route' });
});

app.get('/api/protected', keycloak.protect(), (req, res) => {
  res.json({ message: 'This is a protected route' });
});

app.listen(3000, () => {
  console.log('Auth app listening on port 3000');
});




