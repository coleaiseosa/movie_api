//to import express
const express = require('express');

//morgan is a logging middleware
morgan = require('morgan'),

// fs and path are built-in node module
fs = require('fs'),
path = require('path');

const app = express();

//fs.createWriteStream is used to create a write stream while path.join appends it to log,txt file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let topMovies = [
  {
    title: 'The Seeker',
    author: 'J.k Rowling'
  },
  {
    title: 'Harry Porter',
    author: 'J.k Rowling'
  },
  {
    title: 'Merlin',
    author: 'Marcella C'
  },
  {
    title: 'Twilight',
    author: 'Stephanie Meyer'
  },
  {
    title: 'Lord of the Rings',
    author: 'J.R.R Tolkien'
  },
  {
    title: 'Halo',
    author: 'J.k Rowling'
  },
  {
    title: 'Hey you',
    author: 'J.k Rowling'
  },
  {
    title: 'Unthinkable',
    author: 'J.k Rowling'
  },
  {
    title: 'Love is blind',
    author: 'Natha A'
  },
  {
    title: 'Joshua',
    author: 'Celna C'
  }
];

// the common parameter is to specify that the request should be logged in using morgan's common format
//app.use(morgan('common'));
app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));

app.get('/movies', (req, res) => {
  res.json(topMovies);
})

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

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
