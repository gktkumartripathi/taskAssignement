const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    userId: {
        type: String,
        required: true,
    },
    author : {
        type: String,
        required: true,
        trim:true
    },

    ISBN: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },


}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);