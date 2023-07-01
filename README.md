# moviesREST
This is an API, deployed and available on Heroku.
It offers following functionalities:
- a login for database users
- a creation of a new user/user update
- information about movies saved in the database
- adding a movie to a list of user's favorite movies

Tech stack used: [ HTML, CSS, Javascript, Node.js, Express, mongoDB(Atlas), Heroku ]

This project backend is written in node.js to write up the API endpoint under the index.js file. Which calls on the APIs hosted on Heroku, collecting the relavant data from mongoAtlas.

The app allows new Users to register, with sercuity done through hashing passwords and jwt requiremnts for excessing apis.

API calls are done through the use of Postman.
