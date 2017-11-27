var jwt = require("jwt-simple");
var Admin = require('./models/AdminModel').model;
const request = require('request');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require("mongoose");

var session = require('./sessionController.js');



function getMessages(req,res,user){
    console.log("In get messages and getting all admin messages");
    Admin.find({},function(err,messages){

        if(err){
            return res.status(404).send(err);
        }

        else {
            console.log("found events");

            console.log(messages);
            return res.status(200).json(messages);
            //res.status(200).json(_events);
            //next();

        }
    });
}

function postMessage(req,res,user){
    var id = req.body.id;
    
    console.log("In postMessage function after succeeding authentication");

            admin = new Admin();
            data = req.body.msg;

            console.log("Msg received is :" + data);

            //console.log("after");

            admin.text=data;
            
            admin.save(function(err,saved){
                if(err){
                    return res.status(200).send(err);
                }
                else{
                    return res.status(200).send("successfully saved in database");
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

//Clients and Admin both can get messages posted by Admin so authentication is common.
    session.authenticate(req,res,getMessages);

}

exports.postMessage = function(req,res){

    //only admin can post a msg
    console.log("REceived POST request for admin msg");

    var payload = jwt.decode((req.headers.authorization).split(" ")[1], 'secret');
            
    console.log(("In postMessage adminController and checking email first ") + payload.sub);

    var email = payload.sub;
    
    if(email == "admin@admin.com"){
             session.authenticate(req,res,postMessage);
        
        }
        else{
            return res.status(401).send("Unauthorized..Only Admin can access this");
        }

    // console.log(request.body.user.name);
    //console.log(request.body.user.email);
    //console.log("leaving");
   
    }


exports.deleteMessage = function(req,res){

    //only admin can delete a msg


    console.log("REceived Delete request for admin msg");

    var payload = jwt.decode((req.headers.authorization).split(" ")[1], 'secret');
            
    console.log(("In postMessage adminController and checking email first ") + payload.sub);

    var email = payload.sub;
    
    if(email == "admin@admin.com"){
            session.authenticate(req,res,deleteMessage);
        
        }
        else{
            return res.status(401).send("Unauthorized..Only Admin can access this");
        }
   
}




