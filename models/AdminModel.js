var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({

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



exports.model = mongoose.model('Event',AdminSchema);


