const { default: mongoose } = require('mongoose');
const { Institute } = require('../Models/Institution');



const findInstituteByIdentifier = async (identifier) => {
    const institute = await Institute.findOne({ identifier: identifier });
    if (institute) {
        return institute
    }
}

const findInstituteById = async (id) => {
    const institute = await Institute.findById(mongoose.Types.ObjectId(id));
    if (institute) {
        return institute;
    }
}

const createInstituteService = async (data) => {
    const newInstitute = await new Institute({ ...data }).save();
    return newInstitute;
}

const deleteInstituteService = async (id) => {
    const deleteInstitute = await Institute.findByIdAndDelete(id);
    return deleteInstitute;
}

const updateInstituteService = async (id, data) => {
    const updatedInstitute = await Institute.findByIdAndUpdate(id, { ...data })
}

const listInstitutesService = async (query) => {
    const institutes = await Institute.aggregate([...query]);
    return institutes;
}

module.exports = {
    findInstituteByIdentifier,
    createInstituteService,
    deleteInstituteService,
    updateInstituteService,
    listInstitutesService,
    findInstituteById
}