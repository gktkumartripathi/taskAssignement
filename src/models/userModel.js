const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    Name: {
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
    Age: {
        type:Number,
        required:true
    },

    phone: {
        type: String,
        required: true
    },
    
    qualification: {
        type: String,
        required:true
    },
    city: {
        type: String,
        required:true
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);