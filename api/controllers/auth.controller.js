const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { validateUser } = require('../Models/User');
const { findUserByMailService, createUserService, findUserByIdAndUpdateService, findUserByIdService } = require('../Services/user.service');
const { mailService } = require('../Services/mail.service')


// for generate hash password 
geneartePassword = async (value) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(value, salt);
    return hashPassword;
}


// register user by user and admin
exports.signup = async (req, res) => {
    // check user credentials 
    validateUser(req.body).then(async value => {
        try {
            // user register by itself
            if (value.password !== null) {
                const hashPassword = await geneartePassword(value.password);
                // create user  
                const user = await createUserService({ ...value, password: hashPassword });
                const verificationToken = await user.generateVerificationToken();
                const subject = 'Account Verification'
                const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/verifyaccount/${verificationToken}">here</a>`
                const mailtext = `verify your account.`
                await mailService(subject, url, mailtext, user.email);
                await findUserByIdAndUpdateService(user._id, { verificationToken: { token: verificationToken, expIn: null } });
                res.status(200).json({ success: 1, message: "A verification mail sent to your email account , Please verify your account.", token: verificationToken });
            }
            // user createed by admin
            else {
                const user = await createUserService({ ...value, isVerified: true });
                const activationToken = await user.generateVerificationToken();
                const subject = 'Account Activation'
                const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/activeaccount/${activationToken}">here</a>`
                const mailtext = `activate your account.`
                await mailService(subject, url, mailtext, user.email);
                await findUserByIdAndUpdateService(user._id, { verificationToken: { token: activationToken, expIn: ((Date.now()) + (2 * 24 * 60 * 60 * 1000)) } });
                res.status(200).json({ success: 1, message: "An activation link is sent to the user email.", token: activationToken });
            }
        } catch (e) {
            res.status(400).json({ success: 0, message: e.message });
        }
    }).catch(e => {
        res.status(400).json({ success: 0, message: e.message });
    })
}



// login to account 
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // check for existence
        const user = await findUserByMailService(email);
        if (user) {
            if (user.isVerified === true) {
                if (user.status === true) {
                    const id = (user._id).valueOf();
                    const isValidPassword = await bcrypt.compare(password, user.password);
                    if (isValidPassword) {
                        let token = jwt.sign(
                            { id: id, role: (user.role), instituteId: (user.institute) },
                            process.env.USER_VERIFICATION_TOKEN_SECRET,
                            { algorithm: 'HS256' }
                        );
                        res.status(200).json({ success: 1, token: token, LOGuser: { email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, institute: user.institute, title: user.title } })
                    } else {
                        res.status(401).json({ success: 0, message: 'Invalid userName or password.' });
                    }
                } else {
                    res.status(200).json({ success: 0, message: 'Your account is under verification process.' });
                }
            } else {
                res.status(200).json({ success: 0, message: 'Verify your account.' });
            }
        } else {
            res.status(401).json({ success: 0, message: 'Invalid userName or password.' });
        }
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message });
    }
}




// for verify account 
exports.verifyAccount = (req, res) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, async (err, user) => {
            if (!err) {
                const existsUser = await findUserByIdService(user.id);
                if (existsUser !== null && existsUser.verificationToken !== null && existsUser.isVerified !== true) {
                    if (existsUser.verificationToken.token === token) {
                        await findUserByIdAndUpdateService(existsUser._id, { isVerified: true, verificationToken: null })
                        res.status(200).json({ success: 1, message: 'Thank you, Your email is verified.' });
                    } else {
                        res.status(400).json({
                            success: 0, message: 'This link is not exists more.'
                        })
                    }
                } else {
                    res.status(400).json({ success: 0, message: 'This link is not exists more.' });
                }
            } else {
                res.status(400).json({ success: 0, message: 'This link is not exists more.' });
            }
        })
    } else {
        res.status(400).json({ success: 0, message: "This link is not exists more." });
    }
}




// for active account  
exports.activeAccount = (req, res) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, async (err, user) => {
            if (!err) {
                const existsUser = await findUserByIdService(user.id);
                if (existsUser !== null && existsUser.verificationToken !== null && existsUser.status !== true) {
                    if (existsUser.verificationToken.token === token) {
                        if (existsUser.verificationToken.expIn > Date.now()) {
                            res.status(200).json({ success: 1, message: "Set Password to Active Your Account" });
                        } else {
                            res.status(400).json({ success: 2, id: (existsUser._id).valueOf(), message: "This Link Is Expired" });
                        }
                    } else {
                        res.status(400).json({ success: 0, message: "This Link Is not Exists More." })
                    }
                } else {
                    res.status(400).json({ success: 0, message: 'This  link is not valid.' });
                }
            } else {
                res.status(400).json({ success: 0, message: "This  link is not valid. " });
            }
        })
    } else {
        res.status(400).json({ success: 0, message: "This  link is not valid. " });
    }
}

// for regenerate activation link 
exports.generateActiveLink = async (req, res) => {
    const { id, isFor, token } = req.body;
    if (id) {
        try {
            const existsUser = await findUserByIdService(id);
            if (existsUser, existsUser.verificationToken.token === token) {
                const activationToken = existsUser.generateVerificationToken();
                findUserByIdAndUpdateService(existsUser._id, { token: activationToken, expIn: ((Date.now()) + (2 * 24 * 60 * 60 * 1000)) })
                const subject = `${isFor === 'activeAccount' ? 'Active Account' : 'Reset Password'}`
                const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/${isFor}/${activationToken}">here</a>`
                const mailtext = `${isFor === 'activeAccount' ? 'activate your account.' : 'reset your password.'}`
                await mailService(subject, url, mailtext, existsUser.email);
                res.status(200).json({ success: 1, message: "activation link is sent to your registered mail, please active your account." })
            } else {
                res.status(400).json({ success: 0, message: "something went worng please try latter" })
            }
        } catch (e) {
            res.status(400).json({ success: 0, message: e.message });
        }
    } else {
        res.status(400).json({ success: 0, message: 'something went worng please try latter' })
    }
}

// for forget password 
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await findUserByMailService(email);
        if (user) {
            const verificationToken = user.generateVerificationToken();
            await findUserByIdAndUpdateService(user._id, { verificationToken: { token: verificationToken, expIn: ((Date.now()) + (2 * 24 * 60 * 60 * 1000)) } });
            const subject = 'Reset Password '
            const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/resetpassword/${verificationToken}">here</a>`
            const mailtext = `reset your password.`
            await mailService(subject, url, mailtext, user.email);
            res.status(200).json({ success: 1, token: verificationToken, message: 'your password reset request is sent to the  your email, Please reset your password.' })
        } else {
            res.status(404).json({ success: 0, message: "please enter valid registered email address" });
        }
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message });
    }
}


// for reset password 
exports.resetPassword = (req, res) => {
    try {
        const { password, token, isFor } = req.body;
        if (token) {
            jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, async (err, user) => {
                if (!err) {
                    const existsUser = await findUserByIdService(user.id);
                    if (existsUser !== null && existsUser !== null && existsUser.verificationToken !== null) {
                        if (existsUser !== null && existsUser.verificationToken.token === token) {
                            if (existsUser.verificationToken.expIn > Date.now()) {
                                if (password) {
                                    const hashPassword = await geneartePassword(password);
                                    if (isFor === 'activeAccount') {
                                        await findUserByIdAndUpdateService(existsUser._id, { password: hashPassword, verificationToken: null, status: true });
                                    } else {
                                        await findUserByIdAndUpdateService(existsUser._id, { password: hashPassword, verificationToken: null });
                                    }
                                    res.status(200).json({
                                        success: 1, message: "Congratulations, Your account is activated."
                                    });
                                } else {
                                    res.status(400).json({ success: 0, message: "something went wrong please try again latter." })
                                }
                            } else {
                                res.status(400).json({ success: 2, userId: (existsUser._id).valueOf(), message: "Link is Expired." });
                            }
                        } else {
                            res.status(400).json({ success: 0, message: 'this link is not valid.' });
                        }
                    } else {
                        res.status(400).json({ success: 0, message: 'this link is not valid.' });
                    }
                } else {
                    res.status(400).json({ success: 0, message: "This link is not valid. " });
                }
            })
        } else {
            res.status(400).json({ success: 0, message: "This  link is not valid. " });
        }
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message })
    }
}
