const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
require('dotenv').config();

const { User, validateUser } = require('../Models/User');



const transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: 'hemalkaklotar111@gmail.com',
    subject: 'verification mail',
    html: "test"
}


exports.sendmail = (req, res) => {
    transpoter.sendMail(mailOptions, (err, info) => {
        console.log(err, "err");
        res.send("hello");
    });
}

// sendMail = () => {

// }




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
                await User.findByIdAndUpdate(user._id, { verificationToken: verificationToken });
                res.status(200).json({ success: 1, message: "A verification mail sent to your email account , Please verify your account.", token: verificationToken });
            }
            else {
                await new User({ ...value, isVerified: 1 }).save();
                const activationToken = await user.generateVerificationToken();
                await User.findByIdAndUpdate(user._id, { verificationToken: activationToken });
                res.status(200).json({ success: 1, message: "An activation link is sent to the user email.", token: activationToken });
            }
        } catch (e) {
            res.status(401).json({ success: 0, message: e.message });
        }
    }).catch(e => {
        console.log(e.message);
        res.status(401).json({ success: 0, message: e.message });
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
    const token = req.headers['token'];
    if (token) {
        jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, async (err, user) => {
            if (!err) {
                const existsUser = await User.findById(user.id);
                if (existsUser !== null && existsUser.verificationToken === token) {
                    existsUser.isVerified = 1;
                    await existsUser.save();
                    res.json({ message: 'Thank you, Your email is verified.' });
                } else {
                    res.json({ message: 'This link is not exists more.' });
                }
            } else {
                res.json({ message: 'This link is not exists more.' });
            }
        })
    } else {
        res.json({ message: "This link is not exists more." });
    }
}




// for active account  
exports.activeAccount = (req, res) => {
    const token = req.headers['token'];
    if (token) {
        jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, async (err, user) => {
            if (!err) {
                const existsUser = await User.findById(user.id);
                if (existsUser !== null && existsUser.verificationToken === token && existsUser.status === 0) {
                    existsUser.status = 1
                    await existsUser.save();
                    res.status(200).json({ message: "Congratulations, Your account is activated." });
                } else {
                    res.status().json({ message: 'This Link is expired.' });
                }
            } else {
                res.status().json({ message: "This link is expired. " });
            }
        })
    } else {
        res.status().json({ message: "This  link is not valid. " });
    }
}



// for forget password 
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            // send email with token and update user verification token 
            res.status(200).json({ success: 1, message: 'your password reset request has been sent to your email' })
        } else {
            res.status(404).json({ success: 0, message: "no account found with this email try other" })
        }
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message });
    }
}


// for reset password 
exports.resetPassword = (req, res) => {
    try {
        const token = req.headers['token'];
        const { password } = req.body;
        if (token) {
            jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, async (err, user) => {
                if (!err) {
                    const existsUser = await User.findById(user.id);
                    if (existsUser !== null && existsUser.verificationToken === token) {
                        existsUser.password = await geneartePassword(password);
                        await existsUser.save();
                        res.status(200).json({
                            success: 1,
                            message: "Congratulations, Your account is activated."
                        });
                    } else {
                        res.status(400).json({ success: 0, message: 'This Link is expired.' });
                    }
                } else {
                    res.status(400).json({ success: 0, message: "This link is expired. " });
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