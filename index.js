const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

/**
 * for online database process.env.Variable name to secure connection URI
 */

// This allows mongoose connect to the database so it can perform CRUD operations . the 'test' is the name of the database created
// for local database
//mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //bodyParser middle ware function

/**
 * This specifies that the app uses cors and by default it will set the application to allow requests from all origins
 */

const cors = require('cors');
app.use(cors());

/**
 *  to import auth.js file... the (app) argument is to ensure Express is available in the auth.js file as well
 */

require('./auth')(app); 

/**
 * to require passport module and import passport.js file
 */
const passport = require('passport');
require('./passport');

/**
 * fs.createWriteStream is used to create a write stream while path.join appends it to log,txt file
 * @returns default text message
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});

/**
 * @service Gets all movies
 * @returns json object of all movies
 */

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(200).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @service Get movies by title
 * @returns json object of specific movies by title
 */

app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.title})
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @service Get genre by Name
 * @returns specific name of movie genre
 */

app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name})
  .then((movies) => {
    res.send(movies.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @service Get director data by Name
 * @returns specific name of director
 */
//Get director data by Name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({"Director.Name": req.params.Name})
  .then((movies) => {
    res.send(movies.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @service Get all user . it is the same with Read in mongoose
 * @returns a json list of all users
 */

app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
  .then((users) => {
    res.status(200).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @service Get a specific user by username
 * @returns a json of a specific username
 */

app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username})
  .then((User) => {
    res.status(200).json(User)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err)
  })
})

/**
 * @service POST allows new users register. similar to create on mongoose
 * @returns a json array of new user information
 */

app.post('/users', 
[ 
  // minimum value of 5 characters
  check ('Username', 'Username is required').isLength({min: 5}),
  check ('Username', 'Username contains non alphanumeric character - not allowed.').isAlphanumeric(),
  // is not empty
  check('Password', 'Password is required').not().isEmpty(),
  check ('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    // check the validation object for errors
  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array()});
  } 

  /**
   * this hash the password before storing it in the mongoDB database
   */

  let hashedPassword = Users.hashPassword(req.body.Password); 
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) =>{res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

/**
 * @service PUT allow users update their information
 * @returns json array of updates user information
 */

app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
[ 
  check ('Username', 'Username is required').isLength({min: 5}),
  check ('Username', 'Username contains non alphanumeric character - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check ('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array()});
  } 

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username},
    { 
      $set: {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      },
    },
    {new: true }, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  /**
   * @service POST allow users add to their list of favorites
   * @returns json of updated user information
   */

  // Allow users add to their list of Favorites (create)
  app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true}, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  } );

  /**
   * @service DELETE movie from favirite list
   * @returns json of updated user information
   */

  //Delete movie from favorite list
  app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  /**
   * @service DELETE allow existing users deregister
   * @returns success or error message
   */

  //Allow existing users deregister
  app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if(!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.' );
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
  });

/**
 * error handling middleware function
 */
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
  });
  
   const port = process.env.PORT || 8080;
   app.listen(port, '0.0.0.0',  () => {
     console.log('Listening on Port ' + port);
  });

  // app.listen(8080, () => {
  //   console.log('your app is listening on port 8080.');
  // })
