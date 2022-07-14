const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    First_name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    Last_name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

    },
    Password: {
        type: String,
        required: true
    },
    Age: {
        type:Number,
        required:true
    },

    Profile_pic: {
        type: String,
        required: true
    },
    
    isDeleted: {
        type: Boolean,
        default: false
    }



}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);