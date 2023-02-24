const express=require("express"),
bodyParser=require('body-parser'),
uuid=require('uuid');

const app=express();
const morgan = require("morgan");
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
//const Genres=Models.Genre;
//const Directors=Models.Director;

//Integrationg Mongoose with RESTAPI test 
mongoose.connect('mongodb://localhost:27017/test',{useNewUrlParser:true, useUnifiedTopology:true});


app.use(bodyParser.json());

//log requests to server

app.use(morgan("common"));
//app.use(express.static('public'));

app.get("/",(req,res)=>
{res.send("welcome to myFlix!");
});

/*
//post a user
app.post('/users', (req, res) => {
    Users.findOne({ Name: req.body.Name })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Name + 'already exists');
        } else {Users.create({
              Name: req.body.Name,
              Password: req.body.Password,
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

  */

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

app.listen(8080,()=>console.log("listening on 8080"));