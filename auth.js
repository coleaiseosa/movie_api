/**
 *This has to be the same key used in JWTStrategy
 */
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
passport = require('passport');

// the local passport file
require('./passport');

/**
 * subject: user.Username, // this is the username you are encoding in the JWT
 * expiresIn: '7d', //This specifies that the token will expire in 7 days
 * algorithm: 'HS256' //This is the algorithm used to 'sign' or encode the values of JWT
 * @param {*} user 
 * @returns user and jwt secret
 */

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}

/**
 * @service POST login
 * @param {*} router 
 * @returns json of user details or message
 */

module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }

      req.login(user, { session: false }, (error) => {
        if(error) {
          res.send(error);
        }

        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    }) (req, res);
  });
}