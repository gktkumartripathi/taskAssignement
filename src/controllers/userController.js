const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const aws = require('../aws/aws')
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
const registerUser = async function (req, res) {
    try {
        let data = req.body

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "userDetails must be provided" });
        }

        let { First_name,Last_name, Email, Password,Age, Profile_pic,} = data // destructuring

        //---------titleValidation
        if (!isValid(First_name)) {
            return res.status(400).send({ status: false, message: 'First_name is required' })
        }

        //------match username with regex
        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(First_name)) {
            return res.status(400).send({ status: false, msg: "Please use valid type of First_name" })
        }
         
        if (!isValid(Last_name)) {
            return res.status(400).send({ status: false, message: 'Last_name is required' })
        }
        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(Last_name)) {
            return res.status(400).send({ status: false, msg: "Please use valid type of Last_name" })
        }

        //-----emailValidation
        if (!isValid(Email)) {
            return res.status(400).send({ status: false, message: 'Email is required' })
        }

        //-------match email with regex
        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(Email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        //check if email is already in use
        let duplicateEmail = await userModel.findOne({ Email: Email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'Email already exists' })
        }

        //--------passwordValidation

        if (!isValid(Password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.Password))) {
            return res.status(400).send({ status: false, msg: "Please use password first letter in uppercase reamin lowercase and number with min. 8 length" })
        }
        if (!isValid(Age)) {
            return res.status(400).send({ status: false, message: 'Age is required' })
        }
        if(isNaN.Age){
            return res.status(400).send({ status: false, msg: 'Age should be in Number' })
        }

        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            Profile_pic = uploadedFileURL
        }
        else {
            return res.status(400).send({ status: false, msg: "No Profile_pic found" });
        }

            
        
        let userData = { First_name,Last_name, Email, Password, Age, Profile_pic }

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


        const{Email, Password} = data;
        if (!Email) {
            return res.status(400).send({ status: false, message: "Plz Enter Email In Body !!!" });
        }
        const findData = await userModel.findOne({ Email }).select({ email: 1, password: 1});
        if (!findData) {
            return res.status(600).send({ status: false, message: "invalid credidential !!!" });
        }

        if (!Password) {
            return res.status(400).send({ status: false, message: "Plz Enter Password In Body !!!" });
        }
    
        //token generation
        const userId = findData._id;
        const token = jwt.sign({
            userId: userId,
        },
            "GauravTripathi", { expiresIn: "24H" }
        );

        res.status(200).send({
            status: true,
            message: "User login successfull",
            data: { userId: userId, token: token }
        });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};

// update user details

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
         let { First_name,Last_name,Email,Password,Age,Profile_pic } = data;
 
         let updatedData = {}
         if(First_name){
            if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(First_name)) {
                return res.status(400).send({ status: false, msg: "Please use valid type of First_name" })
            }
           updatedData['First_name'] = First_name
            
         }
         if(Last_name){
            if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(Last_name)) {
                return res.status(400).send({ status: false, msg: "Please use valid type of Last_name" })
            }
           updatedData['Last_name'] = Last_name
            
         }
         if(Email){
            if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(Email)) {
                return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
            }
            //check if email is already in use
            let duplicateEmail = await userModel.findOne({ Email: Email })
            if (duplicateEmail) {
                return res.status(400).send({ status: false, msg: 'Email already exists' })
            }
            updatedData['Email'] = Email

         }

           // Updating of password
        if (Password) {
            if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.Password))) {
                return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 length" })
            }
    
            updatedData['Password'] = Password
        }
        if(Age){
            if(isNaN.Age){
                return res.status(400).send({ status: false, msg: 'Age should be in Number' })
            }
            updatedData['Age'] = Age
        }
        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            Profile_pic = uploadedFileURL
            updatedData['Profile_pic'] = Profile_pic
        }
        else {
            return res.status(400).send({ status: false, msg: "No Profile_pic found" });
        }


        const updated = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })
        return res.status(200).send({ status: true,msg:"User details updated successsfully", data: updated })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
};
    

module.exports ={registerUser,login,update}
