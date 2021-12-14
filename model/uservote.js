const mongoose = require('mongoose')
const Schema = mongoose.Schema

const execom = new Schema({
    _id:false,
    firstName:String,
    lastName:String,
    party:String,
    position:String,
    imgUrl:String
})
const representative = new Schema({
    _id:false,
    firstName:String,
    lastName:String,
    party:String,
    position:String,
    imgUrl:String
})
const departmental = new Schema({
    _id:false,
    firstName:String,
    lastName:String,
    party:String,
    position:String,
    department:String,
    imgUrl:String
})
const userVotes = new Schema({
    _id:String,
    execom:[execom],
    representative:[representative],
    departmental: [departmental]

})
module.exports = mongoose.model('userVote',userVotes)