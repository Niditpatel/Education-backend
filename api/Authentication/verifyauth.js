const jwt = require('jsonwebtoken');


// for authentication 
const checkForAuthentication = (req, res, next) => {
    const token = req.headers['token'];
    if (token) {
        jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET, { algorithms: 'HS256' }, (err, user) => {
            if (!err) req.user = user, next();
            else res.status(401).json({ message: "unauthenticated" });
        })
    } else {
        res.status(403).json("Forbidden access");
    }
}

// for super admin access only  
const checkForAdminAuthorization = (req, res, next) => {
    if (req.user.role === 0) next();
    else res.status(401).json({ message: 'unauthorized access' });
}

// for school admin and upper level
const checkForSchoolAdminAuthorization = (req, res, next) => {
    if (req.user.role === 1 || req.user.role === 0) next();
    else res.status(401).json({ message: 'unauthorized access' });
}

// for teacher and upper level
const checkForSchoolTeacherAuthorization = (req, res, next) => {
    if (req.user.role === 2 || req.user.role === 1 || req.user.role === 0) next();
    else res.status(401).json({ message: 'unauthorized access' });
}

// for user and upper level
const checkForUserAuthorization = (req, res, next) => {
    if ((req.user.role === 3 || req.user.role === 2 || req.user.role === 1 || req.user.role === 0)) next();
    else res.status(401).json({ message: 'unauthorized access' });
}

module.exports = { checkForAuthentication, checkForAdminAuthorization, checkForSchoolAdminAuthorization, checkForSchoolTeacherAuthorization, checkForUserAuthorization }