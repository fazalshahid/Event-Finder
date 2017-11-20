var express = require('express');
var path = require('path');

var bodyParser = require('body-parser');

var jwt = require("jwt-simple");
var moment = require("moment");
var cors = function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Content-Type,Authorization");
    next();

};

var app = express();
app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function(req, res, next) {
    console.log("reached route");
});

// We are going to do the same thing for the remaining routes.
app.get('/login',function(req, res){
    res.send('You are on the login page');
});

app.get('/logout', function(req, res){
    res.send('You are on the logout page');
});

app.get('/polls', function(req, res){
    res.send('You are on the polls page');
})

app.get('/user',function(req, res, next) {
    console.log(req.body);
    res.send("hi");
});



var User = require('./models/UserModel').model;

userHandlers = require('./authController.js');
var messageHandler = require('./messageController.js');

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
                console.log(req.user);
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

var test_login = function(req){
    console.log("logged in");
    console.log(req.user);
};
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



var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/test");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("were connected!");
});

app.listen(3000,function(){
    console.log("I am listening");
});