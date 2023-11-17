const { error } = require('console');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const app = express();

app.use(session({
  secret: 'thisismysecret123', // Replace with a secret string for encrypting your session
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

// Configure the OAuth2 Strategy
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://auth.development.rentcard.app/api/v1/oauth2/',
    tokenURL: 'https://auth.development.rentcard.app/api/v1/oauth2/',
    clientID: '45gs23fa-4b4b-53g6-n56d-8957465a2bb2', // Replace with your client ID
    clientSecret: '23456474354654x87g4s4', // Replace with your client secret
    callbackURL: 'http://localhost:3000/auth/callback'
  },
  function(accessToken, refreshToken) {
    // Here, you will typically save the user profile and tokens to your database.
    // For this example, we just console log the accessToken
    console.log('accessToken', accessToken);
  }
));

// Serialize and deserialize user (if needed)
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/', passport.authenticate('oauth2', {
  state: JSON.stringify({
    // Your state variables here
    successRedirectUrl: "https://partnerdomain.co/success-page",
    redirectData:{
          preUserOneTimeToken: 'abc123',
          user: '{"objectId":"12345","applicantId":"1","rent":"1000","deposit":"3000","currency":"EUR","callbackURL":"www.rentcard.com","partnerId":"46221151872"}',      
    }

  }),
}));

// Define the route for your OAuth2 callback
app.get('/auth/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  
  function(req, res) {
    const finalRedirectUrl = req.query.finalRedirectUrl;
    // Successful authentication, redirect back to rentcard
    if (finalRedirectUrl) {
      res.redirect(finalRedirectUrl);
    } else {
      // Otherwise, throw an error
      const err = new Error('finalRedirectUrl parameter not provided');
      err.status = 400; // Bad Request
      next(err); // Pass the error to the error handling middleware
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({ error: err.message });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
