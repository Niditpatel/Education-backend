const { User, validateUser } = require('../Models/User');


const findUserByMailService = async (Email) => {
    const user = await User.findOne({ email: Email });
    if (user) {
        return user;
    } else {
        throw new Error("Not found any account with this mail.");
    }
}

const findUserByIdService = async (id) => {
    const user = await User.findById(id);
    return user;
}

const createUserService = async (user) => {
    const newUser = await new User({ ...user }).save();
    return newUser;
}

const findByIdAndUpdateUserService = async (id, updatedData) => {
    const upadtedUser = await User.findByIdAndUpdate(id, { ...updatedData });
    return upadtedUser;
}

module.exports = { findUserByMailService, createUserService, findByIdAndUpdateUserService, findUserByIdService }