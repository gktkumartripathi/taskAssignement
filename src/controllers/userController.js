const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

// ================================createapi======================
const createUser = async function (req, res) {
    try {
        let data = req.body

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "userDetails must be provided" });
        }

        let { username, email, password, DOB } = data // destructuring

        //---------titleValidation
        if (!isValid(username)) {
            return res.status(400).send({ status: false, message: 'username is required' })
        }

        //------match username with regex
        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(username)) {
            return res.status(400).send({ status: false, msg: "Please use valid type of username" })
        }


         //check if phone is already in use
        let duplicateUsername = await userModel.findOne({ username: username })
        if (duplicateUsername) {
            return res.status(400).send({ status: false, msg: 'username  already exists' })
        }

        //-----emailValidation
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email is required' })
        }

        //-------match email with regex
        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        //check if email is already in use
        let duplicateEmail = await userModel.findOne({ email: email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'email already exists' })
        }

        //--------passwordValidation

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })
        }
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, msg: "Please use password first letter in uppercase reamin lowercase and number with min. 8 length" })
        }
        let encryptPassword = await bcrypt.hash(password, 12)
        if(!isValid(DOB)){
            return res.status(400).send({ status: false, msg: " DOB is required"})
        }
        let userData = { username, email, password: encryptPassword, DOB }

        //-------userCreation

        let newUser = await userModel.create(userData)
        return res.status(201).send({ status: true, msg: "user created successfully", data: newUser })
    }
    catch (err) {
      return res.status(500).send({ status: false, msg: err.message })
    }
}

//login user//

const login = async function (req, res) {
    try {
        const data = req.body;
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, message: "Plz Enter Email & Password In Body !!!" });
        }
        if (Object.keys(data).length >= 3) {
            return res.status(400).send({ status: false, message: "Only Enter Email & Password In Body !!!" });
        }


        const{email, password} = data;
        if (!email) {
            return res.status(400).send({ status: false, message: "Plz Enter Email In Body !!!" });
        }
        const findData = await userModel.findOne({ email }).select({ email: 1, password: 1 ,username:1});
        if (!findData) {
            return res.status(600).send({ status: false, message: "invalid credidential !!!" });
        }

        if (!password) {
            return res.status(400).send({ status: false, message: "Plz Enter Password In Body !!!" });
        }
        const match = await bcrypt.compare(password, findData.password);
        if (!match) {
            return res.status(600).send({ status: false, message: "invalid password !!!" });
        }
        //token generation
        const userId = findData._id;
        const username = findData.username
        const token = jwt.sign({
            userId: userId,
            username:username
        },
            "GauravTripathi", { expiresIn: "24H" }
        );

        res.status(200).send({
            status: true,
            message: "User login successfull",
            data: { userId: userId,username:username, token: token }
        });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};

// update password api

const update = async function (req, res) {
    try {
        const data = req.body
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide password for update" });
        }
         // Validate params
         let userId = req.params.userId
         if (!isValidObjectId(userId)) {
             return res.status(400).send({ status: false, msg: `${userId} is invalid` })
         }
 
         const userFound = await userModel.findOne({ _id: userId })
         if (!userFound) {
             return res.status(404).send({ status: false, msg: "User does not exist" })
         }
 
         // AUTHORISATION
         if (userId !== req['userId']) {
             return res.status(401).send({ status: false, msg: "Unauthorised access" })
         }
 
         // Destructuring
         let { password } = data;
 
         let updatedData = {}
           // Updating of password
        if (password) {
            if (!isValid(password)) {
                return res.status(400).send({ status: false, message: 'password is required' })
            }
            if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) {
                return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 length" })
            }
            const encrypt = await bcrypt.hash(password, 12)
            updatedData['password'] = encrypt
        }
        const updated = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })
        return res.status(200).send({ status: true,msg:"password updated successsfully", data: updated })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
};
    

module.exports ={createUser,login,update}
