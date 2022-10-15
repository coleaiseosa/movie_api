const passport = require('passport'),
//defines basic HTTP authentication for login request
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
  //LocalStrategy takes a username and password from the request body and uses mongoose to check the database for a user with the same username but the password doesn't get checked here.
  usernameField: 'Username',
  passwordField: 'Password'
}, (username, password, callback) => {
  console.log(username + ' ' + password);
  Users.findOne({ Username: username }, (error, user) => {
    if(error) {
      console.log(error);
      return callback(error);
    }
    // if the username can't be found
    if(!user) {
      console.log('incorrect username');
      return callback(null, false, {message: 'Incorrect username.'});
    }
   
    // to validate any  password a user enters
    if (!user.validatePassword(password)) {
      console.log('incorrect password');
      return callback(null, false, {message: 'Incorrect password.'});
    }

    console.log('finished');
    return callback(null, user);
  });
}));

//jwt is extracted from the header of the http request. jwt is called bearer token
passport.use(new JWTStrategy ({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
  return Users.findById(jwtPayload._id)
  .then((user) => {
    return callback(null, user);
  })
  .catch((error) => {
    return callback(error)
  });
}));
