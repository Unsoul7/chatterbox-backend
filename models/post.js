const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
    post: { type: String },
    caption: { type: String },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    datecreated: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Post', postSchema)