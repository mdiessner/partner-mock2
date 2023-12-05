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
    clientID: 'clientID', // Replace with your client ID
    clientSecret: 'clientSecret', // Replace with your client secret
    callbackURL: 'http://localhost:3000/auth/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // For this example, we just console log the accessToken
    done(null, profile);
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
    applicantId: "1234567",
    redirectData:{
          preUserOneTimeToken: 'abc123',
          user: '{"objectId":"12345","applicantId":"1234567","rent":"1000","deposit":"3000","currency":"EUR","callbackURL":"www.rentcard.com","partnerId":"85289368532"}',      
          successRedirectUrl: "https://partnerdomain.co/success-page",
    }

  }),
}));

// Define the route for your OAuth2 callback
app.get('/auth/callback',
  passport.authenticate('oauth2', { failureRedirect: 'https://www.google.de' }),
  
  function(req, res) {
    const finalRedirectUrl = req.query.finalRedirectUrl;
    // In this step, the partner would usually now take the code and exchange it for an access token.
    if (finalRedirectUrl) {
      res.redirect(decodeURIComponent(finalRedirectUrl));
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
