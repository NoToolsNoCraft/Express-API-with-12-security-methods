const express = require('express');
const https = require('https');
const fs = require('fs');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');
const app = express();

// Load SSL certificates (with your chosen file names)
const privateKey = fs.readFileSync('private.key', 'utf8');
const certificate = fs.readFileSync('certificate.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Set up Passport.js for GitHub OAuth2 authentication
passport.use(new GitHubStrategy({
  clientID: 'Ov23liFT0AS4dhXuRSow',  // Replace with your GitHub Client ID
  clientSecret: '082cc776a1332a0568c2aa861b9480d3703a45c4',  // Replace with your GitHub Client Secret
  callbackURL: 'https://localhost:4003/auth/github/callback',  // GitHub callback URL
}, (accessToken, refreshToken, profile, done) => {
  // Store user profile and token in the session or database
  return done(null, { accessToken, profile });
}));

<<<<<<< Updated upstream
// 1. HTTPS (Comment: Use HTTPS in production by setting up a reverse proxy like Nginx)
// Check if SSL files exist
// HTTPS configuration
const HTTP_PORT = 3006; // For fallback HTTP (non-secure)
const SSL_OPTIONS = {
  key: fs.existsSync('./private.key') ? fs.readFileSync('./private.key') : null,
  cert: fs.existsSync('./certificate.crt') ? fs.readFileSync('./certificate.crt') : null,
};

if (SSL_OPTIONS.key && SSL_OPTIONS.cert) {
  const httpsServer = https.createServer(SSL_OPTIONS, app);
  const securePort = 0; // 0 lets the OS choose an available port

  httpsServer.listen(securePort, () => {
    console.log(`Secure server running on https://localhost:${httpsServer.address().port}`);
  });
} else {
  console.warn('SSL files not found. Falling back to HTTP.');
  app.listen(HTTP_PORT, () => {
    console.log(`Server running on http://localhost:${HTTP_PORT}`);
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
=======
// Serialize user info to store in session
passport.serializeUser((user, done) => {
  done(null, user);
>>>>>>> Stashed changes
});

// Deserialize user info from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to initialize passport and manage sessions
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, this is an HTTPS server with GitHub OAuth2!');
});

// OAuth2 login route for GitHub
app.get('/auth/github', passport.authenticate('github'));

<<<<<<< Updated upstream
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

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Secure API! Please use the /v1/users endpoint.');
}); 

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
const allowlist = ['*'];
app.use((req, res, next) => {
  if (allowlist[0] !== '*' && !allowlist.includes(req.ip)) {
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
=======
// OAuth2 callback route for GitHub
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  // On successful login, you can redirect to a protected page
  res.send(`You are authenticated with GitHub! Welcome, ${req.user.profile.username}`);
});

// Create HTTPS server and listen on port 4003
https.createServer(credentials, app).listen(4003, () => {
  console.log('HTTPS Server running on https://localhost:4003');
>>>>>>> Stashed changes
});
