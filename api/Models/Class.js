const mongoose = require('mongoose');
const Joi = require('joi');



const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    yearGroup: { type: String },
    noOfStudents: { type: Number },
    assignee: [{ type: String }],
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    keyStage: {
        type: String,
        default: null,
        enum: {
            values: ["Foundation Stage", 'KS1', 'KS2', 'KS3', 'KS4', 'KS5']
        }
    },
    examBoard: {
        type: String,
        default: null,
        enum: {
            values: ["State Board", "CBSE", "ICSE", "CISCE", "NIOS", "IB", "CIE"]
        }
    }
});


function validateClass(Class) {
    const joiSchema = Joi.object({
        name: Joi.string().min(3).max(8).required(),
        yearGroup: Joi.string().default(null),
        noOfStudents: Joi.number().default(null),
        assignee: Joi.array().items(Joi.string()).default(null),
        institute: Joi.string().length(24).required(),
        keyStage: Joi.string().allow("Foundation Stage", 'KS1', 'KS2', 'KS3', 'KS4', 'KS5').default(null),
        examBoard: Joi.string().allow("State Board", "CBSE", "ICSE", "CISCE", "NIOS", "IB", "CIE").default(null)
    })

    return joiSchema.validateAsync(Class);
}


const Class = mongoose.model('Class', classSchema);

module.exports = { Class, validateClass }