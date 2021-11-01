const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const passport = require('passport')
const users = require('./routes/api/users')
const posts = require('./routes/api/post')
const profiles = require('./routes/api/profile')
const path = require('path')
// const path = require('path');
// const keys = './ keys'

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({  useUnifiedTopology: false},{useNewUrlParser: true}));

// // DB Config
// const db = require('./config/keys').mongoURI;

// // Connect to MongoDB
// mongoose.connect(db)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

const uri = require('./config/keys').mongoURI ;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(function() {
//   console.log("connected")
// })


// connect to MongoDb
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
         .then(()=>console.log('MongoDb Connected Successfully'))
         .catch((err)=>console.log('MongoDb Doesnot Connect',err))

//passport config
require('./config/passport')(passport)
// //passport middleware
// app.use(passport.initialize())

//use routes
app.use('/api/users',users)
app.use('/api/posts',posts)
app.use('/api/profiles',profiles)


  


 //Server static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'))

    // app.get('/', (req, res) => {
    //   console.log("hit root route")
    //   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    // });
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
    
  }
  


const port = process.env.PORT || 5000

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})