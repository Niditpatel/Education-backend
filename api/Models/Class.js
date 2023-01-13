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
            values: ['KS1', 'KS2', 'KS3', 'KS4', 'KS5']
        }
    },
    examBoard: {
        type: String,
        default: null,
        enum: {
            values: ['EdExcel', 'AQA', 'Gujarat', 'Other']
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
        keyStage: Joi.string().allow('KS1', 'KS2', 'KS3', 'KS4', 'KS5').default(null),
        examBoard: Joi.string().allow('EdExcel', 'AQA', 'Gujarat', 'Other').default(null)
    })

    return joiSchema.validateAsync(Class);
}


const Class = mongoose.model('Class', classSchema);

module.exports = { Class, validateClass }