const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const adminAccount = new Schema({
    department:{
        require: true,
        type: String
    },
    votationName:{
        require:true,
        type:String
    },
    name:{
        require:true,
        type:String
    },
    idNumber:{
        require:true,
        type:String
    },
    username:{
        require:true,
        type:String
    },
    email:{
        require:true,
        type:String
    },
    password:{
        require:true,
        type:String
    },
    imgUrl:{
        type:String
    }
})
module.exports = mongoose.model('admin',adminAccount)