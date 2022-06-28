const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
//------------------------   create book api-------------------------------------//

const createBook = async function (req, res) {
    try {
        const data = req.body;
    
        //if body is empty
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: 'Invalid request body' })
        }

        const { title,author, userId, ISBN} = data;
        //title is empty or not match with regex
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }

        const isTitleAlreadyUsed = await bookModel.findOne({ title });
        //check title is already present
        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'Title is already used' })
        }

        //check if excerpt is  empty 
        if (!isValid(author)) {
            return res.status(400).send({ status: false, message: 'author  is required' })
        }


        //check if userId is  empty 
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: 'UserId is required' })
        }

        //userId is a valid objectId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is an invalid ObjectId` })
        }
        const isUserIdExist = await userModel.findOne({ _id: userId })

        if (!isUserIdExist) return res.status(400).send({ status: false, message: `${userId} userId does not exist` })

        // AUTHORISATION
        if (userId !== req['userId']) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }
        

        //ISBN is empty or not match with regex
        if (!(isValid(ISBN))) {
            return res.status(400).send({ status: false, message: 'ISBN is required' })
        }
        const isISBNAlreadyUsed = await bookModel.findOne({ ISBN: ISBN });

        if (isISBNAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${ISBN} ISBN  is already in used` });
        }
        
        const allData = { title, author, userId, ISBN,}
        // creating data
        const newBook = await bookModel.create(allData);

        return res.status(201).send({ status: true, message: `Books created successfully`, data: newBook });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message, msg: "server" });
    }
}

//-----------------get favourite book by book Id----------------//

const getBooksById = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        // if no bookId given
        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId must be present in request param " })
        }
        // check that is a valid ObjectId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Please provide a Valid bookId" })
        }
        const bookDetails = await bookModel.findOne({ _id: bookId});
        //If no Books found in bookModel
        if (!bookDetails) {
            return res.status(404).send({ status: false, msg: "No books found." });
        }

        const favouriteBookDetails = {bookDetails};
        return res.status(200).send({ status: true, msg: "Books list.", data: favouriteBookDetails });

    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
};

//======================================Get Api===============================================get books by query filter--//

const getBooks = async function (req, res) {

    try {
        const data = req.query
        if (!isValidRequestBody(data)) {

            return res.status(200).send({ status: false, msg: 'please provide book details for filter' })
        }
        
        if (!(data.userId || data.title || data.author || data.ISBN)) {
            return res.status(400).send({ status: false, msg: 'query params details is required' })
        }

        const book = await bookModel.find(data)

        // if no book found 
        if (book.length > 0) {
            return res.status(200).send({ status: true, count: book.length, message: 'Books', data: book })
        }
        else {
            return res.status(404).send({ msg: "books not found" })
        }

    } catch (err) {
        return res.status(500).send({ status: true, error: err.message })
    }
}

module.exports = {createBook,getBooksById,getBooks}