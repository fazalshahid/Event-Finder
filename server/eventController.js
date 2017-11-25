var jwt = require("jwt-simple");
var moment = require("moment");
var Event = require('./models/EventModel').model;
var User = require('./models/UserModel').model;
const request = require('request');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require("mongoose");



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

function send_events(req,res,user){
    console.log(user);
    Event.find({email:user.email},function(err,events){

        if(err){
            return res.status(404).send(err);
        }

        else {
            console.log("got here");

            console.log(events);
            return res.status(200).json(events);
            //res.status(200).json(_events);
            //next();

        }
    });
}

function add_event(req,res,user){
    var id = req.body.id;
    var url_string= "https://app.ticketmaster.com/discovery/v2/events/" + id + ".json?apikey=27mLqO6JmMfWlES8MKnMVG1tkm75I9cE" ;
    request.get(url_string, function (err,_res, data) {
        if(err) {
            res.status(200).send("Error");
        } else {
            event = new Event();
            data = JSON.parse(data);
            event.name=data.name;
            event.email = user.email;
            event.note = req.body.note;
            if( Object.prototype.hasOwnProperty.call(data, 'dates')) {
                event.date = data.dates.start.localDate;
                event.time = data.dates.start.localTime;
            }
            event.event_id = id;
            event.save(function(err,saved){
                if(err){
                    return res.status(200).send(err);
                }
                else{
                    return res.status(200).send("success");
                }
            });

        }
    });


}

function edit_event(req,res,user){
    Event.find({event_id:req.params.id},function(err,event){
        if(err){
            return res.status(200).send(err);
        }else{
            event.note = req.body.note;
            event.save(function(err,saved){
                if(err){
                    return res.status(200).send(err);
                }
                else{
                    return res.status(200).send("success");
                }
            });
        }
    });
}

function remove_event(req,res,user){
    Event.remove({event_id:req.params.id},function(err){

            if(err){
                return res.status(200).send(err);
            }else{
                return res.status(200).send("success");
            }

    });
}
exports.get_events = function(req,res){

    authenticate(req,res,send_events);

    }

exports.post_event = function(req,res){

    authenticate(req,res,add_event);

    }


exports.put_event = function(req,res){

    authenticate(req,res,edit_event);
}

exports.delete_event = function(req,res){

    authenticate(req,res,remove_event);
}



