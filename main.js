var express = require('express');
var path = require('path');

var bodyParser = require('body-parser');

var jwt = require("jwt-simple");
var moment = require("moment");
var cors = require('cors')
/*
var cors = function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Content-Type,Authorization");
    next();

};
*/

var User = require('./models/UserModel').model;

userHandlers = require('./authController.js');
var messageHandler = require('./messageController.js');
var eventHandler = require('./eventController.js');

var app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('scripts'));
app.use(express.static('stylesheets'));
/*
app.use(function(req,res,next){

    if(req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0]==="JWT"){
        var payload = jwt.decode(req.header('Authorization').split(" ")[1],'secret');
        if(payload.exp<=moment().unix){
            res.send({stat:"expired"});
            return;
        }
        User.find({_id:payload.sub},function(err,user){

            if(user){
                req.user=user;
                //console.log(req.user);
                next();
            }
            else
                req.user = undefined
            next();
        });

    }
    else{
        req.user = undefined;
        next();

    }

});


*/
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
app.get('/api/messages',messageHandler.getMessages);
app.post('/api/messages',messageHandler.postMessage);
app.delete('/api/messages/:id',messageHandler.deleteMessage);
app.get('/',function(req,res){
    res.render('./index');
});

//Event routes
app.get('/events',eventHandler.get_events);
app.post('/event',eventHandler.post_event);
app.put('/event/:id',eventHandler.put_event);
app.delete('/event/:id',eventHandler.delete_event);


var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/test");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Mongodb server is connected and listening on port 27017");
});

app.listen(3000,function(){
    console.log("The server is listening on port 3000");
});
