'use strict';
const APP_URL="http://localhost:3000/";
const CONFIRM_URL="confirm_sign_up"
var mongoose = require("mongoose");
//var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var User = require('./models/UserModel').model;
var TempUser = require('./models/UserModel').temp_model;
var jwt = require("jwt-simple");
var moment = require("moment");

exports.sign_up = function(req,res){
    var newUser = new TempUser(req.body);
    newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
    newUser.link = bcrypt.hashSync(req.body.email, 10);
    newUser.save(function(err, user) {
        if (err) {
            console.log("error happened");
            return res.status(400).send({
                message: err
            });
        } else {
            console.log(" user saved");
            user.hash_password = undefined;
            var nodemailer = require("nodemailer");

            var transporter = nodemailer.createTransport({
                service: "gmail",
                auth:{
                    user:"dev.enguoft2017@gmail.com",
                    pass: "devdev12"
                }
            });

            var mailOptions = {
                from: "dev.enguoft2017@gmail.com",
                to: req.body.email,
                subject: "Confirm Sign Up",
                html: '<p>'+APP_URL+CONFIRM_URL+","+user.link+'</p>'
                //html: "<a href=\"koku\"/>"
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);

                } else {
                    console.log('Message sent: ' + info.response);
                }
            });

            return res.json(user);
        }
    });
};

exports.sign_in = function(req,res){
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) throw err;
        if (!user) {
            res.status(401).json({ message: 'Authentication failed. User not found.' });
        } else if (user) {
            if (!user.comparePassword(req.body.password)) {
                res.status(401).json({ message: 'Authentication failed. Wrong password.' });
            } else {
                return res.json({token: createToken(user)});
            }
        }
    });

};

exports.login_required = function(req,res,next){
    console.log("comes to required");
    if (req.user) {
        console.log("req user is not empty");
        next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user!' });
    }
};
exports.confirm_sign_up=function(req,res){
    console.log("reached confirmation");
    var link = req.originalUrl.split(',')[1];
    console.log(link);
    TempUser.findOne({'link':link},function(err,user){
        if(user){

            console.log(user);
            console.log(user.link);
            var new_user = new User({
                email:user.email,
                hash_password:user.hash_password
            });
            new_user.save(function(err,_us){
                if(_us)
                    console.log(_us);
                else
                    console.log(err);
            });
            res.status(200).send();
            /*
                        User.find({email:new_user.email},function(err,_user){
                            if(_user){
                                console.log(_user);
                            }
                            else
                                console.log("Couldn't save");

                        });
                        */
        }
        res.status(404).send();
    });
}

function createToken(user){
    console.log("token"+user._id);
    var payload = {
        sub:user._id,
        iat : moment().unix(),
        exp: moment().add(14,'days').unix()

    };

    return jwt.encode(payload,'secret');
}