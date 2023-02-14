const { Class, validateClass } = require('../Models/Class');

const createClassService = async (data) => {
    const newClass = await new Class({ ...data }).save();
    return newClass;
}

const findClassByIdAndDelete = async (id) => {
    const deletedClass = await Class.findByIdAndDelete(id);
    return deletedClass;
}

const findOneClassAndDeleteService = async (data) => {
    const deletedClass = await Class.findOneAndDelete({ ...data });
    return deletedClass;
}

const findClassByIdAndUpdateService = async (id, data) => {
    const updatedClass = await Class.findByIdAndUpdate(id, { ...data });
    return updatedClass;
}

const findOneClassAndUpdateService = async (query, data) => {
    const updatedClass = await Class.findOneAndUpdate({ ...query }, { ...data });
    return updatedClass;
}

const listClassService = async (query) => {
    const Classes = await Class.aggregate([...query]);
    return Classes;
}

module.exports = {
    createClassService,
    findOneClassAndDeleteService,
    findClassByIdAndDelete,
    findClassByIdAndUpdateService,
    findOneClassAndUpdateService,
    listClassService
}