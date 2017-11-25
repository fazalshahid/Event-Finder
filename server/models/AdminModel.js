var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({

       
        msg_id:{
            type:String,
            required: true
        },
        text:{
            type:String
        },
        date:{
            type:String
        },
        time:{
            type:String
        }

    }

);



exports.model = mongoose.model('Admin',AdminSchema);


