const mongoose = require('mongoose')
const Schema = mongoose.Schema

const departmentAcc = new Schema({
    firstName:{
        type:String,
        require:true
    },
    lastName:{
        type:String,
        require:true
    },
    position:{
        type:String,
        require:true
    },
    department:{
        type:String
    },
    party:{
        type:String,
        require:true
    },
    imgUrl:{
        type:String
    },
    schoolTerm:{
        type:String,
        require:true
    },
    event:{
        type:String,
        require:true
    },
    voteCount:{
        type:Number,
        require:true
    }
})
module.exports = mongoose.model('departmentCandidate',departmentAcc)