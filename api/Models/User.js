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
        required: true,
        default: "Teacher",
        enaum: {
            values: ["SuperAdmin", "SchoolAdmin", "Teacher", "User"]
        }
    },
    //  account is verified from user or not 
    isVerified: {
        type: Number,
        default: 0,
        enum: {
            values: [0, 1]
        }
    },
    // account is approved or not 
    status: {
        type: Number,
        default: 0,
        enum: {
            values: [0, 1]
        }
    },
    verificationToken: {
        type: {
            token: {
                type: String
            },
            expIn: {
                type: Number
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
        email: Joi.string().email().required().external(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) throw Error('already taken please do login or try with different email');
            else return value;
        }),
        title: Joi.string().allow('Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Sr').required(),
        institute: Joi.string().length(24).required(),
        password: Joi.string().default(null).min(8).max(18).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
        role: Joi.number().allow("SuperAdmin", "SchoolAdmin", "Teacher", "User").default("Teacher").required(),
        isVerified: Joi.number().default(0),
        status: Joi.number().default(0),
        verificationToken: Joi.object({
            token: Joi.string(),
            expIn: Joi.number()
        }).default(null)
    })
    return joiSchema.validateAsync(user);
}

const User = mongoose.model("User", userSchmea);


module.exports = { User, validateUser }

