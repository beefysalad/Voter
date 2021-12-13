const mongoose = require('mongoose')
const Schema = mongoose.Schema

const voteExe = Schema({
    name:{
        type:String,
        require: true
    },
    position:{
        type:String,
        require:true
    },
    party:{
        type:String,
        require:true
    },
    voteCount:{
        type:Number,
        require:true
    }
})






module.exports = mongoose.model('execomvote',voteExe)