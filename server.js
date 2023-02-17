const express=require('express');
const app=express(),
bodyParser=require('body-parser'),
uuid=require('uuid');

app.use(bodyParser.json());

let users = [
    {
      id: 1,
      name: 'Jessica Drake',
      favoriteMovies:[]
    },
    {
      id: 2,
      name: 'Ben Cohen',
      favoriteMovies:["The Founain"]
    },
    {
      id: 3,
      name: 'Lisa Downing',
      favoriteMovies:["Slumberland"]    
    }
  ];



let movies=[
    {
        "title":"The Fountain",
        "Description":"test test test test",
        "Genre":
        {"Name":"Drama",
        "Desription":"Drama film is a genre that relies on the emotional and relational development of realistic characters. While Drama film relies heavily on this kind of development, dramatic themes play a large role in the plot as well. Often, these dramatic themes are taken from intense, real life issues."
        },

        "Director":
        {
            "Name":"Darren Aronofsky",
            "Bio":"test test test bio darren aronofsky",
            "Birth":1969.0
        },
        "ImageURL":"https://images.app.goo.gl/gcVsCru3Ar4T9Trw9",
        "Featured":false
        
    },

    {
        "title":"Slumberland",
        "Description":"test test test test",
        "Genre":
        {"Name":"Adventure",
        "Desription":"The adventure genre consists of books where the protagonist goes on an epic journey, either personally or geographically. Often the protagonist has a mission and faces many obstacles in his way. A good example would be The Lord of the Rings series."},

        "Director":{
            "Name":"Francis Lawrence",
            "Bio":"test test test bio Francis Lawrence",
            "Birth":1971.0        },
        "ImageURL":"https://images.app.goo.gl/gcVsCru3Ar4T9Trw9",
        "Featured":false
        
    }
]

//READ endpoint
app.get('/movies',(req,res)=> {
    res.status(200).json(movies);
})

//READ a movie endpoint
app.get('/movies/:title',(req,res)=> {
    const {title}=req.params;
    const movie=movies.find(movie => movie.title===title);

    if (movie)
    {res.status(200).json(movie);
    } else {res.status(400).send('no such movie')}
})

//READ a genre endpoint 
app.get('/movies/genre/:genreName',(req,res)=> {
    const {genreName}=req.params;
    const genre=movies.find(movie => movie.Genre.Name===genreName).Genre;

    if (genre)
    {res.status(200).json(genre);
    }else {res.status(400).send('no such genre')}
})


//READ about director endpoint 
app.get('/movies/directors/:directorName',(req,res)=> {
    const {directorName}=req.params;
    const director=movies.find(movie => movie.Director.Name===directorName).Director;

    if (director)
    {res.status(200).json(director);
    }else {res.status(400).send('no such director')}
})


//POST add user endpoint
app.post('/users',(req,res)=>
{
    const newUser=req.body;
    if (newUser.name)
    {
        newUser.id=uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    }else
    {
        res.status(400).send('users need name')
    }

})

//UPDATE allow user to update user name
app.put('/users/:id',(req,res)=>
{
    const {id}=req.params;
    const updatedUser=req.body;

    let user=users.find(user=> user.id == id);

    if (user){
        user.name=updatedUser.name;
        res.status(200).json(user);
    }
    else{res.status(400).send('no such user')}

    
})


//CREATE favorite movie of a user
app.post('/users/:id/:movieTitle',(req,res)=>
{
    const {id, movieTitle}=req.params;
    
    let user=users.find(user=> user.id == id);

    if (user){
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    }
    else{res.status(400).send('no such user')}

    
})



//DELETE favorite movie of a user
app.delete('/users/:id/:movieTitle',(req,res)=>
{
    const {id, movieTitle}=req.params;
    
    let user=users.find(user=> user.id == id);

    if (user){
        user.favoriteMovies=user.favoriteMovies.filter(title=>title!==movieTitle);
        res.status(200).send(`${movieTitle} has been removeded from user ${id}'s array`);
    }
    else{res.status(400).send('no such user')}

    
})


//DELETE user by ID
app.delete('/users/:id',(req,res)=>
{
    const {id}=req.params;
    
    let user=users.find(user=> user.id == id);

    if (user){
        users=users.filter(user=>user.id!=id);
        res.status(200).send(`user ${id} has been deleted`);
    }
    else{res.status(400).send('no such user')}

    
})

app.listen(8080,()=>console.log("listening on 8080"))