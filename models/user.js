
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect('mongodb://localhost:27017/chatterboxdb')

const userSchema = new Schema({
    fullname : {type : String},
    username : {type : String, unique : true},
    password : {type : String},
    email: { type: String, unique : true},
    dp : {type : String, default : 'https://i.pinimg.com/564x/dc/08/0f/dc080fd21b57b382a1b0de17dac1dfe6.jpg'},
    bio : {type : String},
    dob : {type : Date},
    posts : [{type : mongoose.Schema.Types.ObjectId, ref : 'Post'}],
    datecreated : {type: Date, default : Date.now}
}) 


module.exports = mongoose.model('User', userSchema)