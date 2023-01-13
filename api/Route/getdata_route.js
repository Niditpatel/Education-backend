const router = require('express').Router();
const { Institute } = require('../Models/Institution');

router.get('/title', (req, res) => {
    const title = ['Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Sr'];
    res.status(200).json(title);
})

router.get('/searchinstitute', async (req, res) => {
    try {
        const key = req.query.key;
        const institutes = await Institute.find({ name: { $regex: key, $options: 'i' } }).select('name').limit(15)
        res.status(200).json(institutes);
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

module.exports = router;