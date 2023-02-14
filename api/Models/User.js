const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchmea = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    title: {
        type: String,
        required: true,
        enum: {
            values: ['Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Sr']
        }
    },
    // insitute id from the institute 
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    password: { type: String, default: null },
    // user role school-admin or teacher  or user
    role: {
        type: String,
        default: "Teacher",
        required: true,
        enum: {
            values: ["SuperAdmin", "SchoolAdmin", "Teacher", "User"]
        }
    },
    //  account is verified from user or not 
    isVerified: {
        type: Boolean,
        default: false,
    },
    // account is approved or not 
    Approved: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: {
            token: {
                type: String
            },
            expIn: {
                type: Number
            },
            isFor: {
                type: String,
                enum: {
                    values: ['verification', 'resetpassword']
                }
            }
        },
        default: null
    }
}, { timestamps: true });




// generate verification token 
userSchmea.methods.generateVerificationToken = function () {
    const user = this;
    const verificationToken = jwt.sign(
        { id: (user._id).valueOf() },
        process.env.USER_VERIFICATION_TOKEN_SECRET,
        { algorithm: 'HS256' }
    )
    return verificationToken;
}


// validate user 
function validateUser(user) {
    const joiSchema = Joi.object({
        firstName: Joi.string().min(2).max(15).required(),
        lastName: Joi.string().min(2).max(15).required(),
        email: Joi.string().email().required(),
        title: Joi.string().allow('Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Sr').required(),
        institute: Joi.string().length(24).required(),
        password: Joi.string().default(null).min(8).max(18).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
        role: Joi.string().allow("SuperAdmin", "SchoolAdmin", "Teacher", "User").default("Teacher"),
        isVerified: Joi.boolean().default(false),
        Approved: Joi.boolean().default(false),
        verificationToken: Joi.object({
            token: Joi.string(),
            expIn: Joi.number(),
            isFor: Joi.string().allow('verification', 'resetpassword').default('verification')
        }).default(null)
    })
    return joiSchema.validateAsync(user);
}

const User = mongoose.model("User", userSchmea);


module.exports = { User, validateUser }

