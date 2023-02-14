const router = require('express').Router();
const { Institute } = require('../Models/Institution');
const { User } = require('../Models/User');


const { checkForSchoolAdminAuthorization, checkForAuthentication, checkForSchoolTeacherAuthorization } = require('../Authentication/verifyauth')
router.get('/title', (req, res) => {
    const title = ['Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Sr'];
    res.status(200).json(title);
})

router.get('/searchinstitute', async (req, res) => {
    try {
        const key = req.query.key;
        const institutes = await Institute.find({ name: { $regex: key, $options: 'i' } }).select('name').limit(5)
        res.status(200).json(institutes);
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message })
    }
});

router.get('/roles', checkForAuthentication, checkForSchoolAdminAuthorization, async (req, res) => {
    try {
        let roles;
        if (req.user.role === 'SuperAdmin') {
            roles = ['SuperAdmin', 'SchoolAdmin', 'Teacher', 'User'];
        } else {
            roles = ['Teacher', 'User'];
        }
        res.status(200).json({ success: 1, data: roles });
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message })
    }
});

router.get('/assignee', checkForAuthentication, checkForSchoolTeacherAuthorization, async (req, res) => {
    try {
        const key = req.query.key;
        const assignee = await User.find({ name: { $regex: key, $options: 'i' }, institute: req.user.instituteId }).select('name').limit(5);
        res.status(200).json({ success: 1, data: assignee });
    } catch (e) {
        res.status(200).json({ success: 0, message: e.message });
    }
})




module.exports = router;