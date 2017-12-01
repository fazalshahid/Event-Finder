var jwt = require("jwt-simple");
var Admin = require('./models/AdminModel').model;
const request = require('request');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require("mongoose");

var session = require('./sessionController.js');



function getMessages(req,res,user){

    Admin.find({},function(err,messages){

        if(err){
            return res.status(404).send(err);
        }

        else {


            return res.status(200).json(messages);
            //res.status(200).json(_events);
            //next();

        }
    });
}

function postMessage(req,res,user){
    var id = req.body.id;
    
    

            admin = new Admin();
            data = req.body.data;

         

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

     console.log("In delete message function");

    Admin.remove({"_id": req.params.id },function(err,messages){

        if(err){
            return res.status(404).send(err);
        }

        else {
           

            return res.status(200).send("deleted msg " + req.params.id);
            //res.status(200).json(_events);
            //next();

        }
    });
    
}


exports.getMessages = function(req,res){

//Clients and Admin both can get messages posted by Admin so authentication is common.
   // session.authenticate(req,res,getMessages);


    getMessages(req,res);
}

exports.postMessage = function(req,res){

    //only admin can post a msg
    
    postMessage(req,res);

    /*
    var payload = jwt.decode((req.headers.authorization).split(" ")[1], 'secret');
            
    

    var email = payload.sub;
    
    if(email == "admin@admin.com"){
             session.authenticate(req,res,postMessage);
        
        }
        else{
            return res.status(401).send("Unauthorized..Only Admin can access this");
        }
        */

    // console.log(request.body.user.name);
    //console.log(request.body.user.email);
    //console.log("leaving");
   
    }


exports.deleteMessage = function(req,res){

    //only admin can delete a msg

    console.log("Got a delete message request");

    deleteMessage(req, res);

  /*  var payload = jwt.decode((req.headers.authorization).split(" ")[1], 'secret');
    

    var email = payload.sub;
    
    if(email == "admin@admin.com"){
            console.log("request came from admin's email. Now trying to check if password is correct")
            session.authenticate(req,res,deleteMessage);
        
        }
        else{
            return res.status(401).send("Unauthorized..Only Admin can access this");
        }
   */
}




