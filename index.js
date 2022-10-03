const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),

//morgan is a logging middleware
morgan = require('morgan'),

// fs and path are built-in node module
fs = require('fs'),
path = require('path');

const app = express();

//fs.createWriteStream is used to create a write stream while path.join appends it to log,txt file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let users = [
  {
    id : 1,
    name : 'Alison',
    favoriteMovies: []
  },
  {
    id : 2,
    name : 'Fred',
    favoriteMovies: ['Family Reunion']
  },
]

let movies = [
  {
    "Title": "Family Reunion",
    "Description": "The Mckellans recall a cross-country move to Georgia that was packed with misadventure , from a weird proposal and a creepy ritual to a frisky raccoon.",
    "Genre": {
      "Name": "Drama",
      "Description": "In film and television, drama is a category of a narrative fiction or semi-fiction"
    },
    "Director": {
      "Name": "Mag DeLoatch",
      "Bio" : "Meg DeLoatch Biography, Height, Weight, Age, Measurements, Net Worth, Family, Wiki & much more! Meg DeLoatch was born on Tampa 12 Oct 1995 in and her current age 27 years old. Meg DeLoatch Weight 58.0 KG and height 5.7 Inches. Meg DeLoatch is an Producer, Writer, Additional Crew in USA. Her born home city of FL, USA. Her primary Profession is a Producer, Writer, Additional Crew. Right now Meg DeLoatch is a famous Producer, Writer, Additional Crew in the world. And her Nationality is American.",
      "Birth" : 1995,
    },
    "ImageUrl" : "https://en.wikipedia.org/wiki/Family_Reunion_(TV_series)#/media/File:Family_Reunion_(TV_series)_Title_Card.jpg",
    "Featured" : false
  },
  
  {
    "Title": "Wedding Season",
    "Description": "Two Indian Americans fake a romance through a summer of weddings to pacify their pushy parents, but family expectations soon clash with personal desires.",
    "Genre": {
      "Name": "Romance",
      "Description": "In film and television, Romance is a category of a narrative fiction or semi-fiction based on Love and feelings"
    },
    "Director": {
      "Name": "Tom Dey",
      "Bio" : "Thomas Ridgeway Dey is an American film director, screenwriter, and producer. His credits include Shanghai Noon, Showtime, Failure to Launch, and Marmaduke",
      "Birth" : 1965,
    },
    "ImageUrl" : "https://occ-0-3492-879.1.nflxso.net/dnm/api/v6/X194eJsgWBDE2aQbaNdmCXGUP-Y/AAAABXUp_wC5pAH3H3DrHIMQncy8baOXpGz-PtKcCr68re2tMLglxbApDyCMw28dUOZXk_cR4mVsfkDSgxbfW7TOJkGL_MsyGJ3D-W5ABVrFdUxaVec1LwoIpqirTziwn5Ic96nVKw.jpg?r=628",
    "Featured" : false
  },

  {
    "Title": "Emily in Paris",
    "Description": "Emily brings her can-do American attitude and fresh ideas to her new office in Paris, but her inability to speak French turns out to be a major Faux pas.",
    "Genre": {
      "Name": "Comedy",
      "Description": "In film and television, Comedy is a category of a narrative fiction or semi-fiction with alot of humor"
    },
    "Director": {
      "Name": "Darren Star",
      "Bio" : "Darren Star is an American writer, director and producer of film and television. He is best known for creating the television series Beverly Hills, 90210, Melrose Place, Sex and the City, Younger, and Emily in Paris",
      "Birth" : 1961,
    },
    "ImageUrl" : "https://www.netflix.com/de-en/title/81037371",
    "Featured" : false
  }
];

// the common parameter is to specify that the request should be logged in using morgan's common format
//app.use(morgan('common'));
app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

// get all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

// get movies by title
app.get('/movies/:title', (req, res) => {
  const { title } =  req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie")
  }
})

//Get genre object
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } =  req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre; // the the .Genre will enable it return just the genre object

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre")
  }
})

//Get director data by Name
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } =  req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director; // the the .Genre will enable it return just the genre object

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director")
  }
})

// Allow new users register (create)
app.post('/users', (req, res) => {
  const newUser = req.body; // this is possible due to the body parser

  if (newUser.name) {
    newUser.id = uuid.v4(); // uuid.v4() generates unique id
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need name')
  }
})

// Allow users update their user info (Update)
app.put('/users/:id', (req, res) => {
  const { id } =  req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id) // let is used instead of const as the user will tale the value of the updated user. also == instead of === as one of the value is a number while the other is a string

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user)
  } else {
    res.status(400).send('no such user')
  }
})

// Allow users add to their list of Favorites (create)
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } =  req.params;

  let user = users.find( user => user.id == id) // let is used instead of const as the user will tale the value of the updated user. also == instead of === as one of the value is a number while the other is a string

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`)
  } else {
    res.status(400).send('no such user')
  }
})

//Delete movie from favorite list
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } =  req.params;

  let user = users.find( user => user.id == id) // let is used instead of const as the user will tale the value of the updated user. also == instead of === as one of the value is a number while the other is a string

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle)
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`)
  } else {
    res.status(400).send('no such user')
  }
})

//Allow existing users deregister
app.delete('/users/:id', (req, res) => {
  const { id } =  req.params;

  let user = users.find( user => user.id == id) // let is used instead of const as the user will tale the value of the updated user. also == instead of === as one of the value is a number while the other is a string

  if (user) {
    users = users.filter( user => user.id != id) //!= instead of !== because one value is a string and the other is a number
    res.status(200).send(`user ${id} has been deleted`)
  } else {
    res.status(400).send('no such user')
  }
})

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

//error handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});