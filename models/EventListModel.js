var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventListSchema = new Schema({

        events: []
    }
);


exports.model = mongoose.model('EventList',EventListSchema);


