const express = require('express');
const https = require('https');
const fs = require('fs');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');
const app = express();

// Load SSL certificates
const privateKey = fs.readFileSync('private.key', 'utf8');
const certificate = fs.readFileSync('certificate.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Set up Passport.js for GitHub OAuth2 authentication
passport.use(new GitHubStrategy({
  clientID: 'Ov23liFT0AS4dhXuRSow', // Replace with your GitHub Client ID
  clientSecret: '082cc776a1332a0568c2aa861b9480d3703a45c4', // Replace with your GitHub Client Secret
  callbackURL: 'https://localhost:4003/auth/github/callback', // GitHub callback URL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, { accessToken, profile });
}));

// Serialize and deserialize user info
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

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

// OAuth2 callback route for GitHub
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.send(`You are authenticated with GitHub! Welcome, ${req.user.profile.username}`);
});

// HTTPS server setup
const HTTP_PORT = 3006;
if (privateKey && certificate) {
  https.createServer(credentials, app).listen(4003, () => {
    console.log('HTTPS Server running on https://localhost:4003');
  });
} else {
  app.listen(HTTP_PORT, () => {
    console.log(`Fallback HTTP server running on http://localhost:${HTTP_PORT}`);
  });
}
