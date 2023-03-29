const express=require("express");
const app=express();
const cors = require('cors');
app.use(cors());

const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
uuid=require('uuid');
const { check, validationResult } = require('express-validator');
const morgan = require("morgan");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");
const Models = require('./models.js');

const passport = require('passport');
require('dotenv').config();//tried to resolve the mongoose.connect error 
require('./passport');
require('./auth')(app);


const Movies = Models.Movie;
const Users = Models.User;
//const Genres=Models.Genre;
//const Directors=Models.Director;

//try to solve mongoose error
mongoose.set("strictQuery", false);

//Integrationg Mongoose with RESTAPI test (local)
//mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

//Integrationg Mongoose with RESTAPI test (online)
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect('mongodb+srv://olja:1234567Aa@cluster0.qrw3ovt.mongodb.net/myFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

//log requests to server
app.use(morgan("common"));
//app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie API!');
  });


  //Documentation
  app.get('/docs',(req,res)=>
  {res.sendFile('/public/documentation.html')});


  //add user if not existent
  app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }


    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username})
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Name + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday,
              FavoriteMovies: req.body.FavoriteMovies
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
  
  // Get all users
  app.get('/users',  passport.authenticate('jwt', { session: false }),(req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  // Get a user by Name
  app.get('/users/:Name', passport.authenticate('jwt', { session: false }),(req, res) => {
    Users.findOne({ Name: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  //Udpate user name
  app.put('/users/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });
  
  
// Add a movie to a user's list of favorites
  app.post('/users/:Name/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Username }, {$push: { FavoriteMovies: req.params.MovieID }},
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });  
  
// Add a movie
app.post("/movies", (req, res) => {
  Movies.create({
      Title: req.body.Title,
      Description: req.body.Description,
      Genre: {
          Name: req.body.Genre.Name,
          Description: req.body.Genre.Description,
      },
      Director: {
          Name: req.body.Director.Name,
          Description: req.body.Director.Description,
          Birth:req.body.Director.Birth
      },
      Actors: req.body.Actors,
      Featured: req.body.Featured,
      ImagePath: req.body.ImagePath,
  })
      .then((movie) => {
          res.status(201).json(movie);
      })
      .catch((error) => {
          console.error(error);
          res.status(500).send("Error: " + error);
      });
});
  
  // DELETE a movie from a user's list of favorites
  app.delete('/users/:Name/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Username }, {
       $pull: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });
  
  // Delete a user by Name
  app.delete('/users/:Name',  passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Name: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  
  // Get all movies
  app.get('/movies', passport.authenticate('jwt', { session: false }),(req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });  
  
  
  // Get a movie by title
  app.get('/movies/:Title',  passport.authenticate('jwt', { session: false }),(req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  // Get info about genre
  app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }),(req, res) => {
    Movies.find({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  // Get info about director
  app.get('/movies/directors/:Name',  passport.authenticate('jwt', { session: false }),(req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }); 
    
    
  app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
  });
    
  // Error 
  app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('There was an error. Please try again later.');
  });


//listen on the following port for other users
  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
   console.log('Listening on Port ' + port);
  });

