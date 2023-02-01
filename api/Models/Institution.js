const mongoose = require('mongoose');
const Joi = require('joi');


const instituteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    identifier: { type: String, unique: true, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    postcode: { type: String, length: 6, required: true },
    country: { type: String },
    territory: { type: String, required: true },
    localAuthority: { type: String, required: true },
    homePage: { type: String },
    level: { type: String, required: true },
    noOfStudents: { type: Number },
    type: { type: String, default: null },
    isGuest: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


function validateInstitute(institute) {
    const joiSchema = Joi.object({
        name: Joi.string().min(3).max(20).required(),
        identifier: Joi.string().length(14).required().external(async (value) => {
            const institute = await Institute.findOne({ identifier: value });
            if (institute) throw Error("identifier should be unique");
            else return value;
        }),
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string(),
        city: Joi.string().required(),
        postcode: Joi.string().length(6).external(value => {
            const pattern = /[0-9]{6}/;
            if (!pattern.test(value)) throw Error("invalid post code");
            else return value;
        }).required(),
        country: Joi.string(),
        territory: Joi.string().required(),
        localAuthority: Joi.string().required(),
        homePage: Joi.string(),
        level: Joi.string().required(),
        noOfStudents: Joi.string(),
        type: Joi.string().default(null),
        isGuest: Joi.boolean().default(false)
    })

    return joiSchema.validateAsync(institute, { abortEarly: false })

}



const Institute = mongoose.model("Institute", instituteSchema);


module.exports = { Institute, validateInstitute }