const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

    },
    password: {
        type: String,
        required: true
    },
    DOB: {
        type: String,
        required: true
    },




}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);