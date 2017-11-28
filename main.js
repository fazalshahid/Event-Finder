var MONGO_URL = "mongodb://tit_309:tit309@ds121686.mlab.com:21686/tit309";
var LOCAL_MONGO_URL = "mongodb://localhost:27017/test";
var CSC_URL = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db"
var express = require('express');
var path = require('path');

var bodyParser = require('body-parser');

var jwt = require("jwt-simple");
var moment = require("moment");
var cors = require('cors')

var User = require('./models/UserModel').model;
var Event = require('./models/EventModel').model;

userHandlers = require('./authController.js');
var messageHandler = require('./adminController.js');
var myEventHandler = require('./myEventController.js');
var eventsHandler = require('./eventController.js');

var app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('scripts'));
app.use(express.static('stylesheets'));
app.use(express.static('images'));
var test_login = function(req){
    console.log("logged in");
    console.log(req.user);
};


app.get('/user',function(req, res, next) {
    console.log(req.body);
    res.send("hi");
});
app.post('/sign_up',userHandlers.sign_up);
app.post('/sign_in',userHandlers.sign_in);
app.get('/test_login',userHandlers.login_required,function(req,res){
    console.log("logged in");
    res.send('You logged in successfully as '+req.body.email);

});
app.get('/confirm_sign_up*',userHandlers.confirm_sign_up);


//admin Routes

app.get('/api/messages',messageHandler.getMessages);
app.post('/api/messages',messageHandler.postMessage);
app.delete('/api/messages/:id',messageHandler.deleteMessage);


//Index Route
app.get('/',function(req,res){
    res.render('./index');
});

//My event routes
app.get('/my_events',myEventHandler.get_events);
app.post('/my_event',myEventHandler.post_event);
app.put('/my_event/:id',myEventHandler.put_event);
app.delete('/my_event/:id',myEventHandler.delete_event);

//Event routes
app.get('/events', eventsHandler.get_events_list);


var mongoose = require('mongoose');

mongoose.connect(MONGO_URL, {
  useMongoClient: true,
  /* other options */
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Mongodb server is connected and listening on port 27017");
});

app.listen(process.env.PORT || 3000,function(){
    console.log("The server is listening on port 3000");
});
