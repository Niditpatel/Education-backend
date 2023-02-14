const mongoose = require('mongoose');
const Joi = require('joi');


const instituteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    identifier: { type: String, unique: true, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: null },
    city: { type: String, required: true },
    postcode: { type: String, length: 6, required: true },
    country: { type: String, default: null },
    territory: { type: String, required: true },
    localAuthority: { type: String, required: true },
    homePage: { type: String, default: null },
    level: { type: String, required: true },
    noOfStudents: { type: Number, default: null },
    type: { type: String, default: null },
    isGuest: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


function validateInstitute(institute) {
    const joiSchema = Joi.object({
        name: Joi.string().min(3).max(20).required(),
        identifier: Joi.string().length(14).required(),
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().allow('').default(null),
        city: Joi.string().required(),
        postcode: Joi.string().length(6).pattern(/[0-9]{6}/).required(),
        country: Joi.string().allow('').default(null),
        territory: Joi.string().required(),
        localAuthority: Joi.string().required(),
        homePage: Joi.string().allow('').default(null),
        level: Joi.string().required(),
        noOfStudents: Joi.string().allow('').default(null),
        type: Joi.string().allow('').default(null),
        isGuest: Joi.boolean().default(false)
    })

    return joiSchema.validateAsync(institute, { abortEarly: false })

}



const Institute = mongoose.model("Institute", instituteSchema);


module.exports = { Institute, validateInstitute }