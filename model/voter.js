const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const voterAccount = new Schema({
    firstName:{
        require:true,
        type:String
    },
    lastName:{
        require:true,
        type:String
    },
    username:{
        require:true,
        type:String
    },
    birthDate:{
        require:true,
        type:String
    },
    address:{
        require:true,
        type:String
    },
    emailAddress:{
        require:true,
        type:String
    },
    IDNumber:{
        require:true,
        type:String
    },
    department:{
        require:true,
        type:String
    },
    password:{
        require:true,
        type:String
    },
    imgUrl:{
        type:String
    },
    exeComHasV:{
        type:Boolean
    },
    repHasV:{
        type:Boolean
    },
    departHasV:{
        type:Boolean
    }
})
module.exports = mongoose.model('voter',voterAccount)