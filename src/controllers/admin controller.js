const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


//=====================================ADMIN DATA API================================================//
const admin =  async function (req, res) {
    try {
        const data = req.body;
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, message: "Plz Enter Email & Password In Body !!!" });
        }
        if (Object.keys(data).length >= 3) {
            return res.status(400).send({ status: false, message: "Only Enter Email & Password In Body !!!" });
        }
        const{Email,Password} = data
        if (!isValid(Email)) {
            return res.status(400).send({ status: false, message: 'Email is required' })
        }
        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(Email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        let duplicateEmail = await adminModel.findOne({ Email: Email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'Email already exists' })
        }
        if (!isValid(Password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.Password))) {
            return res.status(400).send({ status: false, msg: "Please use password first letter in uppercase reamin lowercase and number with min. 8 length" })
        }
        let duplicatePass = await adminModel.findOne({ Password: Password })
        if (duplicatePass) {
            return res.status(400).send({ status: false, msg: 'Password already exists' })
        }
        let adminData = { Email,Password}

        let newAdmin= await adminModel.create(adminData)
        return res.status(201).send({ status: true, msg: "admin created successfully", data: newAdmin })
    }
    
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
      }
  }


  // login admin


  const login = async function (req, res) {
    try {
        const data = req.body;
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, message: "Plz Enter Email & Password In Body !!!" });
        }
        if (Object.keys(data).length >= 3) {
            return res.status(400).send({ status: false, message: "Only Enter Email & Password In Body !!!" });
        }
        
        if (!data.Email) {
            return res.status(400).send({ status: false, message: "Plz Enter Email In Body !!!" });
        }
        const findData = await adminModel.findOne({ Email:data.Email }).select({ email: 1, Password: 1});
        if (!findData) {
            return res.status(600).send({ status: false, message: "invalid credidential !!!" });
        }

        if (!data.Password) {
            return res.status(400).send({ status: false, message: "Plz Enter Password In Body !!!" });
        }
    
        //token generation
        const Email = findData.Email;
        const token = jwt.sign({
            Email: Email,
        },
            "GauravTripathi", { expiresIn: "24H" }
        );

        res.status(200).send({
            status: true,
            message: "User login successfull",
            data: {Email: Email, token: token }
        });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};

const getUsersDetails = async function(req,res){
    try{
        
        const Email= req.Email
        const email = await adminModel.find({Email})
        if(!(email.Email==Email)){
            return res.status(401).send({status:false, msg:"unauthourize admin!!"})
        }
    const details = await userModel.find()
    if(details){
    return res.status(200).send({status:true,data:details})
   } else {
    return res.status(404).send({status:false,msg:"no record found"})
   }
}catch (err) {
    res.status(500).send({ status: false, msg: err.message });
}
}

module.exports = {admin ,login, getUsersDetails}