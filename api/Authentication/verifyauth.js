const jwt = require('jsonwebtoken');


// for authentication 
const checkForAuthentication = (req, res, next) => {
    const token = req.headers['authorization'];
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
    if ((req.user.role) === "SuperAdmin") next();
    else res.status(401).json({ message: 'unauthorized access' });
}

// for school admin and upper level
const checkForSchoolAdminAuthorization = (req, res, next) => {
    if ((req.user.role) === "SuperAdmin" || req.user.role === "SchoolAdmin") next();
    else res.status(401).json({ message: 'unauthorized access' });
}

// for teacher and upper level
const checkForSchoolTeacherAuthorization = (req, res, next) => {
    if (req.user.role === "Teacher" || req.user.role === "SchoolAdmin" || req.user.role === "SuperAdmin") next();
    else res.status(401).json({ message: 'unauthorized access' });
}

// for user and upper level
const checkForUserAuthorization = (req, res, next) => {
    if ((req.user.role === "User" || req.user.role === "SchoolAdmin" || req.user.role === "Teacher" || req.user.role === "SuperAdmin")) next();
    else res.status(401).json({ message: 'unauthorized access' });
}

module.exports = { checkForAuthentication, checkForAdminAuthorization, checkForSchoolAdminAuthorization, checkForSchoolTeacherAuthorization, checkForUserAuthorization }