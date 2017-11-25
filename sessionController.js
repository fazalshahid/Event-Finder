const request = require('request');
var User = require('./models/UserModel').model;
var ObjectId = require('mongodb').ObjectID;


function authenticate(req,res,action){
    console.log(req.headers);
    if(req.headers && req.headers.authorization && (req.headers.authorization).split(' ')[0]=="JWT") {
        var payload = jwt.decode((req.headers.authorization).split(" ")[1], 'secret');
        console.log(payload.sub);
        if (payload.exp <= moment().unix) {
            return res.status(200).send("Unauthorized");
        }
        User.findOne({email: payload.sub}, function (err, user) {
            if(err)
                return res.status(200).send("Unauthorized");
            else {
                console.log(user.email);
                console.log(user);
                action(req, res, user);
            }


        });
    }
    else {
        console.log("this happenned");
        return res.status(200).send("Unauthorized");
    }

}