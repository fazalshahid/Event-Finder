var jwt = require("jwt-simple");
var Admin = require('./models/AdminModel').model;
const request = require('request');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require("mongoose");

var session = require('./sessionController.js');



function getMessages(req,res,user){
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

function postMessage(req,res,user){
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

function deleteMessage(req,res,user){
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


exports.getMessages = function(req,res){

//check if request is from admin or client because we would be
    session.authenticate(req,res,getMessages);

}

exports.postMessage = function(req,res){

    //only admin can post a msg
    session.admin_authenticate(req,res,postMessage);

    }


exports.deleteMessage = function(req,res){

    //only admin can delete a msg
    session.admin_authenticate(req,res,deleteMessage);
}




