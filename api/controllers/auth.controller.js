const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
require('dotenv').config();

const { User, validateUser } = require('../Models/User');



const sendMail = async (subject, url, mailText) => {

    try {
        const transpoter = nodemailer.createTransport({
            host: process.env.SMTP_EMAIL_HOST,
            port: process.env.SEND_ALL_EMAILS_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL_USERNAME,
                pass: process.env.SMTP_EMAIL_PASSWORD,
                type: process.env.SEND_ALL_EMAILS_AUTHENTICATION
            }
        });

        const mailOptions = {
            from: process.env.SEND_ALL_EMAILS_FROM,
            to: process.env.SEND_ALL_EMAILS_TO,
            subject: subject,
            html: `<html><body>
            <h3>This mail is from oneEducation.</h3></br></br>
            <p> Please click ${url} to ${mailText}</p>
            </body></html>`
        }

        const info = await transpoter.sendMail(mailOptions);
        return info;
    }
    catch (e) {
        return e;
    }
}




// for generate hash password 
geneartePassword = async (value) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(value, salt);
    return hashPassword;
}


// ragister user by user and admin
exports.signup = (req, res) => {
    validateUser(req.body).then(async value => {
        try {
            if (value.password !== null) {
                const hashPassword = await geneartePassword(value.password);
                const user = await new User({ ...value, password: hashPassword }).save();
                const verificationToken = await user.generateVerificationToken();
                const subject = 'Account Verification'
                const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/verifyaccount/${verificationToken}">here</a>`
                const mailtext = `verify your account.`
                await sendMail(subject, url, mailtext);
                await User.findByIdAndUpdate(user._id, { verificationToken: { token: verificationToken, expIn: null } });
                res.status(200).json({ success: 1, message: "A verification mail sent to your email account , Please verify your account.", token: verificationToken });
            }
            else {
                const user = await new User({ ...value, isVerified: 1 }).save();
                const activationToken = await user.generateVerificationToken();
                const subject = 'Account Activation'
                const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/activeaccount/${activationToken}">here</a>`
                const mailtext = `activate your account.`
                await sendMail(subject, url, mailtext);
                await User.findByIdAndUpdate(user._id, { verificationToken: { token: activationToken, expIn: ((Date.now()) + (2 * 24 * 60 * 60)) } });
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
        const user = await User.findOne({ email: email });
        if (user) {
            if (user.isVerified === 1) {
                if (user.status === 1) {
                    const id = (user._id).valueOf();
                    const isValidPassword = await bcrypt.compare(password, user.password);
                    if (isValidPassword) {
                        let token = jwt.sign(
                            { id: id, role: (user.role), instituteId: (user.institute) },
                            process.env.USER_VERIFICATION_TOKEN_SECRET,
                            { algorithm: 'HS256' }
                        );
                        res.status(200).json({ success: 1, token: token, LOGuser: { email: user.email, firtName: user.firstName, lastName: user.lastName, role: user.role, institute: user.institute, title: user.title } })
                    } else {
                        res.status(401).json({ success: 0, message: 'invalid userName or password.' });
                    }
                } else {
                    res.status(200).json({ success: 0, message: 'your account is under verification process.' });
                }
            } else {
                res.status(200).json({ success: 0, message: 'verify your account.' });
            }
        } else {
            res.status(401).json({ success: 0, message: 'invalid userName or password.' });
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
                const existsUser = await User.findById(user.id);
                if (existsUser !== null && existsUser.verificationToken !== null) {
                    if (existsUser.verificationToken.token === token) {
                        existsUser.isVerified = 1;
                        existsUser.verificationToken = null;
                        await existsUser.save();
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
                const existsUser = await User.findById(user.id);
                if (existsUser !== null && existsUser.verificationToken !== null) {
                    if (existsUser.verificationToken.token === token) {
                        console.log(existsUser.verificationToken.expIn, Date.now());
                        if (existsUser.verificationToken.expIn > Date.now()) {
                            existsUser.status = 1
                            await existsUser.save();
                            res.status(200).json({ success: 1, message: "Congratulations, Your account is activated." });
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
            const existsUser = User.findById(id);
            if (existsUser, existsUser.verificationToken.token === token) {
                const activationToken = existsUser.generateVerificationToken();
                existsUser.verificationToken = { token: activationToken, expIn: ((Date.now()) + (2 * 24 * 60 * 60)) }
                const subject = `${isFor === 'activeaccount' ? 'Active Account' : 'Reset Password'}`
                const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/${isFor}/${activationToken}">here</a>`
                const mailtext = `${isFor === 'activeaccount' ? 'activate your account.' : 'reset your password.'}`
                await sendMail(subject, url, mailtext);
                await existsUser.save();
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
        const user = await User.findOne({ email: email });
        if (user) {
            const verificationToken = user.generateVerificationToken();
            user.verificationToken = { token: verificationToken, expIn: ((Date.now()) + (2 * 24 * 60 * 60)) }
            const subject = 'Password Reset'
            const url = `<a  href="${process.env.PUBLIC_WEB_APP_URL}/resetpassword/${activationToken}">here</a>`
            const mailtext = `reset your password.`
            await sendMail(subject, url, mailtext);
            await user.save();
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
        const { password, token } = req.body;
        if (token) {
            jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, async (err, user) => {
                if (!err) {
                    const existsUser = await User.findById(user.id);
                    if (existsUser !== null && existsUser.verificationToken.token === token) {
                        if (existsUser.verificationToken.expIn > Date.now()) {
                            if (password) {
                                const hashPassword = await geneartePassword(password);
                                existsUser.password = hashPassword;
                                existsUser.verificationToken = null;
                                await existsUser.save();
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


exports.userByEmail = async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.findOne({ email: email });
        if (user) {
            res.status(200).send(true);
        } else {
            res.status(404).send(false);
        }
    } catch (e) {
        res.status(400).send(false);
    }
}