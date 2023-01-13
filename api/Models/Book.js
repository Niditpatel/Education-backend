const mongoose = require('mongoose');
const Joi = require('joi');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    publisher: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    pdfisbn: { type: String, required: true },
    imprint: { type: String, required: true },
    isActive: {
        type: Number,
        default: 0,
        enum: {
            values: [0, 1]
        }
    }
});

function validateBook(book) {
    const joiSchema = Joi.object({
        title: Joi.string().required(),
        publisher: Joi.string().min(3).max(15).required(),
        isbn: Joi.string().length(13).required().external(async value => {
            const book = await Book.findOne({ isbn: value });
            if (book) throw Error('isbn should be unique');
            else return value;
        }),
        imprint: Joi.string().min(3).max(15).required(),
        pdfisbn: Joi.string().length(13).required(),
        isActive: Joi.number().allow(0, 1).default(0)
    })

    return joiSchema.validateAsync(book, { abortEarly: false })
}

const Book = mongoose.model('Book', bookSchema)

module.exports = { Book, validateBook }