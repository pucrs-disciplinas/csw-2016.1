const express = require('express');
const jwt = require('jsonwebtoken');
const process = require('process');

const app = express();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // In a real application, you would verify the username and password
    if (username === 'user' && password === 'password') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1s' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is a protected route` });
});

app.listen(3000, () => {
  console.log('Auth app listening on port 3000');
});