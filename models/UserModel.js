var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var UserSchema = new Schema({

        email:{
            type:String,
            trim:true,
            unique:true,
            required: true
        },
        hash_password:{
            type:String,
            required: true
        },
        username:{
            type:String,
            required: true
        }
    }
);

var TempUserSchema = new Schema({

        email:{
            type:String,
            trim:true,
            unique:true,
            required: true
        },
        hash_password:{
            type:String,
            required: true
        },
        link:{
            type:String,
            required: false
        }

    }

);

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password,this.hash_password);
};

exports.model = mongoose.model('User',UserSchema);
exports.temp_model = mongoose.model('TempUser',TempUserSchema);

