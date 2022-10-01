const express = require('express')
const route =  require('./routes/route')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app =express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//Database connection setup 

mongoose.connect("mongodb+srv://gtgaurav:Wp2gKNWXbHDifb5n@cluster0.9p9yl.mongodb.net/Task13-DB" ,
 { useNewUrlParser: true})
 
.then(() => {
    console.log("MongoDb connected")
}).catch((err) => {
    console.log(err.message)
});

app.use('/' , route);

// here we using server setup 

app.listen( process.env.Port || 3000 ,function(){
    console.log('App running on port ' + (process.env.PORT || 3000))
});

