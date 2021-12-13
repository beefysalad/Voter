const mongoose = require('mongoose')
const Schema = mongoose.Schema

const candidateAcc = new Schema({
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
    party:{
        type:String,
        require:true
    },
    courseYear:{
        type:String,
        require:true
    },
    imgUrl:{
        type:String
    },
    event:{
        type:String,
        require: true
    },
    schoolTerm:{
        type:String,
        require:true
    }
})
module.exports = mongoose.model('candidate',candidateAcc)