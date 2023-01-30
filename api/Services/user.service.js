const { User } = require('../Models/User');


const findUserByMailService = async (Email) => {
    const user = await User.findOne({ email: Email });
    if (user) {
        return user;
    }
}

const findUserByIdService = async (id) => {
    const user = await User.findById(id).populate('institute', 'name');
    if (user) {
        return user;
    } else {
        throw new Error("User Not Found");
    }
}

const createUserService = async (user) => {
    const newUser = await new User({ ...user }).save();
    return newUser;
}

const findUserByIdAndUpdateService = async (id, updatedData) => {
    const updatedUser = await User.findByIdAndUpdate(id, { ...updatedData }, { new: true });
    return updatedUser;
}

const finOneUserAndUpdateService = async (searchData, updatedData) => {
    const updatedUser = await User.findOneAndUpdate({ ...searchData }, { ...updatedData }, { new: true });
    return updatedUser;
}

const findUserByIdAndDeleteService = async (id) => {
    const user = await User.findByIdAndDelete(id);
    console.log(user);
    return user;
}

const findOneUserAndDeleteService = async (data) => {
    const user = await User.findOneAndDelete({ ...data });
    return user;
}

const listUsersService = async (query) => {
    const users = User.aggregate([...query]);
    return users;
}



module.exports = {
    findUserByMailService,
    createUserService,
    findUserByIdAndUpdateService,
    findUserByIdService,
    findUserByIdAndDeleteService,
    findOneUserAndDeleteService,
    finOneUserAndUpdateService,
    listUsersService
}