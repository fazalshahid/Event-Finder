var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;


var MessageSchema = new Schema({

       	message_id:{
            type:String,
            trim:true,
            unique:true,
            required: true
        },
        message:{
        	type:String,
            trim:true,
            required: true
        }
    });


    var LatestIdSchema = new Schema({

       	latest_id:{
            type:String,
            trim:true,
            unique:true,
            required: true
        }
    });

exports.message_model = mongoose.model('Message',MessageSchema);
exports.latest_model = mongoose.model('Latest',LatestIdSchema);