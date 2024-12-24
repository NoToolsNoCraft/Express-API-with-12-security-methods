const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');  // Add this line to import fs
const https = require('https');  // You also need to import https
const http = require('http');    // And http for the fallback
const app = express();

// Middleware setup
app.use(helmet()); // Adds security headers
app.use(cors()); // Configures CORS
app.use(bodyParser.json()); // Parses JSON bodies

// Mock data
let mockData = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com' },
];

// 1. HTTPS (Comment: Use HTTPS in production by setting up a reverse proxy like Nginx)
// Check if SSL files exist
if (fs.existsSync('./certificate.crt') && fs.existsSync('./private.key')) {
  console.log('SSL files found!');
  const options = {
    key: fs.readFileSync('./private.key'),
    cert: fs.readFileSync('./certificate.crt'),
  };
  https.createServer(options, app).listen(3000, () => {
    console.log('Secure server running on https://localhost:3000');
  });
} else {
  console.log('SSL files not found, falling back to HTTP');
  http.createServer(app).listen(4001, () => { // Changed port to 4001
    console.log('Server running on http://localhost:4001');
  });
}
  

// 2. OAuth2 Authentication (Mock Implementation)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 3. WebAuthn (Comment: Add WebAuthn setup for enhanced authentication security)
const { Fido2Lib } = require('fido2-lib');

// Configure Fido2
const fido2 = new Fido2Lib({
  timeout: 60000,
  rpId: "yourdomain.com",
  rpName: "Your API Service",
  challengeSize: 32,
});

// Mock storage for registered credentials
let credentials = {};

// WebAuthn registration endpoint
app.post('/webauthn/register', async (req, res) => {
  const { username } = req.body;

  const challenge = await fido2.assertionOptions();
  credentials[username] = { challenge, registered: false };

  res.json(challenge);
});

// WebAuthn verification endpoint
app.post('/webauthn/verify', async (req, res) => {
  const { username, response } = req.body;

  const storedChallenge = credentials[username];
  if (!storedChallenge || storedChallenge.registered) {
    return res.status(400).json({ message: 'Invalid or already registered' });
  }

  try {
    await fido2.assertionResult(response, { challenge: storedChallenge.challenge });
    credentials[username].registered = true;
    res.json({ message: 'Authentication successful' });
  } catch (err) {
    res.status(400).json({ message: 'Authentication failed', error: err.message });
  }
});


// 4. Leveled API Keys
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKeys = { admin: 'admin123', user: 'user123' };

  if (!apiKey || !Object.values(validKeys).includes(apiKey)) {
    return res.status(403).json({ message: 'Invalid API Key' });
  }

  req.role = Object.keys(validKeys).find(key => validKeys[key] === apiKey);
  next();
};

// 5. Authorization
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// 6. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// 7. API Versioning
app.get('/v1/users', authenticateToken, (req, res) => {
  res.json(mockData);
});

// CRUD Operations
app.get('/v1/users/:id', authenticateToken, (req, res) => {
  const user = mockData.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.post('/v1/users', authenticateToken, (req, res) => {
  const newUser = { id: mockData.length + 1, ...req.body };
  mockData.push(newUser);
  res.status(201).json(newUser);
});

app.put('/v1/users/:id', authenticateToken, (req, res) => {
  const user = mockData.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });

  Object.assign(user, req.body);
  res.json(user);
});

app.delete('/v1/users/:id', authenticateToken, (req, res) => {
  const userIndex = mockData.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

  mockData.splice(userIndex, 1);
  res.status(204).send();
});

// 8. Allowlisting
const allowlist = ['127.0.0.1'];
app.use((req, res, next) => {
  if (!allowlist.includes(req.ip)) {
    return res.status(403).json({ message: 'IP not allowed' });
  }
  next();
});

// 9. OWASP API Security Risks
app.post('/data', (req, res) => {
  const { input } = req.body;
  if (typeof input !== 'string' || input.length > 100) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  res.json({ message: 'Data accepted' });
});

// 10. Use API Gateway (Comment: Integrate an API Gateway for routing and additional security)
const proxy = require('express-http-proxy');

// Example of proxying requests to a microservice
app.use('/service1', proxy('http://localhost:4000'));
app.use('/service2', proxy('http://localhost:5000'));

// Comment: Set up a real API Gateway in production for enhanced routing and security

// 11. Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An unexpected error occurred' });
});

// 12. Input Validation
app.post('/validate', (req, res) => {
  const { data } = req.body;
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ message: 'Invalid data' });
  }
  res.json({ message: 'Validation successful' });
});

const PORT = process.env.PORT || 0; // Use 0 to let the OS choose an available port
const server = app.listen(PORT, () => {
  console.log(`Secure API is running on port ${server.address().port}`);
});
