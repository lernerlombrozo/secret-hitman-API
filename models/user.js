const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        unique: true,
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        unique: true,
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'I am new!'
    },
    posts:[{
        type:Schema.Types.ObjectId,
        ref: "Post"
    }],
    games: [{
        type: Schema.Types.ObjectId,
        ref: "Game"
    }]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)