const express=require("express");
const app=express();
const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
uuid=require('uuid');


const morgan = require("morgan");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
//const Genres=Models.Genre;
//const Directors=Models.Director;

//Integrationg Mongoose with RESTAPI test 
mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });


//log requests to server

app.use(morgan("common"));
//app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie API!');
  });

  //add user if not existent
  app.post('/users', (req, res) => {
    Users.findOne({ Name: req.body.Name })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Name + 'already exists');
        } else {
          Users
            .create({
              Name: req.body.Name,
              Password: req.body.Password,
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
  app.get('/users', (req, res) => {
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
  app.get('/users/:Name', (req, res) => {
    Users.findOne({ Name: req.params.Name })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  //Udpate user name
  app.put('/users/:Name', (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Name }, { $set:
      {
        Name: req.body.Name,
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
  app.post('/users/:Name/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Name }, {
       $push: { FavoriteMovies: req.params.MovieID }
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
  
  // DELETE a movie to a user's list of favorites
  app.delete('/users/:Name/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Name }, {
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
  app.delete('/users/:Name', (req, res) => {
    Users.findOneAndRemove({ Name: req.params.Name })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Name + ' was not found');
        } else {
          res.status(200).send(req.params.Name + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  
  // Get all movies
  app.get('/movies', (req, res) => {
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
  app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  // Get a Movie by Genre
  app.get('/movies/genre/:genreName', (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  
  // Get a Movie by Director
  app.get('/movies/directors/:Name', (req, res) => {
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

app.listen(8080,()=>console.log("listening on 8080"));