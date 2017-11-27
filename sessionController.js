var jwt = require("jwt-simple");
var moment = require("moment");
//var Event = require('./models/EventModel').model;
var Event = require('./models/EventModel').model;
const request = require('request');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require("mongoose");
var User = require('./models/UserModel').model;


function authenticate(req,res,action){
    //console.log(req.headers)
    is_logged_in(req, res).then(
        function (user) {
            console.log("is_logged_in succeeded")
            action(req, res, user);},
        function (err) {
            console.log("is_logged_in failed");
            console.log(err);
            res.status(200).send("Unauthorized")
        });
}


function is_logged_in(req, res) {
    return new Promise(function (resolve, reject) {
        if(req.headers && req.headers.authorization && (req.headers.authorization).split(' ')[0]=="JWT") {
            var payload = jwt.decode((req.headers.authorization).split(" ")[1], 'secret');
            
            console.log(("first one ") + payload.sub);
            
            if (payload.exp <= moment().unix) {
                reject(Error("No user is logged in (1)"));
            }
            User.findOne({email: payload.sub}, function (err, user) {
                if(err) {
                    reject(Error("No user is logged in (2)"));
                }
                else {
                    console.log(user.email);
                    console.log(user);
                    resolve(user);
                }
            });
        }
        else {
            reject(Error("No user logged in (3)"));
        }
    });
}

exports.authenticate = authenticate;
exports.is_logged_in = is_logged_in;