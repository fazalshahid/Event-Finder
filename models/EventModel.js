var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({

        email:{
            type:String,
            trim:true,

        },
        event_id:{
            type:String,
            required: true
        },
        note:{
            type:String
        },
        name:{
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


exports.model = mongoose.model('Event',EventSchema);


