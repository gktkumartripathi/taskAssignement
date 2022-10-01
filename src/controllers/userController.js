const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

// globelly function to validate request body is empty or not
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


// ================================createapi======================
const registerUser = async function (req, res) {
    try {
        let data = req.body

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "userDetails must be provided" });
        }

        let { Name, Email ,Age, city, phone, qualification } = data // destructuring

        //---------titleValidation
        if (!isValid(Name)) {
            return res.status(400).send({ status: false, message: 'Name is required' })
        }

        //------match username with regex
        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(Name)) {
            return res.status(400).send({ status: false, msg: "Please use valid type of Name" })
        }
         
        //-----emailValidation
        if (!isValid(Email)) {
            return res.status(400).send({ status: false, message: 'Email is required' })
        }
        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(Email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        let duplicateEmail = await userModel.findOne({ Email: Email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'Email already exists' })
        }
        if (!isValid(Age)) {
            return res.status(400).send({ status: false, message: 'Age is required' })
        }
        if(isNaN(Age)==true){
            return res.status(400).send({ status: false, msg: 'Age should be in Number' })
        }
        if (!isValid(city)) {
            return res.status(400).send({ status: false, message: 'city is required' })
        }
        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(city)) {
            return res.status(400).send({ status: false, msg: "Please use valid type of city" })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'city is required' })
        }
        if(!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone))){
            return res.status(400).send({ status: false, msg: "Please use valid type of phone number" })
        }
        let duplicatePhone = await userModel.findOne({ phone: phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: 'phone already exists' })
        }
        if (!isValid(qualification)) {
            return res.status(400).send({ status: false, message: 'qualification is required' })
        }  
        let userData = { Name,Email,phone,city,Age,qualification}

        //-------userCreation

        let newUser = await userModel.create(userData)
        return res.status(201).send({ status: true, msg: "user created successfully", data: newUser })
    }
    catch (err) {
      return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports={registerUser}

