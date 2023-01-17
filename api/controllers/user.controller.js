const { User } = require('../Models/User');
const mongoose = require('mongoose');




// delete user 
exports.userDelete = async (req, res) => {
    const id = req.params.id;
    try {
        let user;
        if (req.user.role === 0) {
            user = await User.findByIdAndDelete(id);
        } else {
            user = await User.findOneAndDelete({ _id: id, institute: req.user.instituteId })
        }
        res.status(200).json({ message: `${user.firstName} ${user.lastName} is deleted` });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}


// update user 
exports.userUpdate = async (req, res) => {
    const user = req.body;
    const id = req.params.id;
    try {
        let updatedUser;
        if (req.user.role === 0) {
            updatedUser = await User.findByIdAndUpdate(id, { ...user }, { new: true });
        } else {
            updatedUser = await User.findOneAndUpdate({ _id: id, institute: req.user.instituteId }, { ...user }, { new: true });
        }
        res.status(200).json({ message: `${updatedUser.firstName} is updated.` })
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}


// for user listing 
exports.userList = async (req, res) => {
    const { query, role, limit, offset, sort_by, order, search_schools } = req.query;

    const search_query = ((query !== undefined && query.length > 0) ? query : '');
    const sort_order = ((order !== undefined && order.length > 0) ? parseInt(order) : 1);
    const sort_field = ((sort_by !== undefined && sort_by.length > 0) ? sort_by : '_id');
    const page_limit = ((limit !== undefined && limit.length > 0) ? parseInt(limit) : 5);
    const page_no = ((offset !== undefined && offset.length > 0) ? parseInt(offset) : 0);

    // if super  admin  
    if (req.user.role === 0) {
        const filter_role = ((role !== undefined && role.length > 0) ? [parseInt(role)] : [1, 2, 3]);
        const school_filter = ((search_schools !== undefined && search_schools.length > 0) ? (search_schools.split('&&').map(item => item.trim())) : '');

        const display_fields = { firstName: 1, lastName: 1, email: 1, title: 1, role: 1, institute: 1 };

        const school_filter_query = (school_filter.length > 0 ? { $in: school_filter } : { $exists: true })

        const user_filter_query = {
            $and: [
                {
                    $or:
                        [
                            { firstName: { $regex: search_query, $options: 'i' } },
                            { lastName: { $regex: search_query, $options: 'i' } },
                            { email: { $regex: search_query, $options: 'i' } },
                        ]
                },
                { role: { $in: filter_role } }
            ]
        };

        const institute_filter_query = {
            $and: [
                { 'institute.name': { $regex: search_query, $options: 'i' } },
                { 'institute.name': school_filter_query }
            ]
        }
        try {
            const listData = await User.aggregate([
                // before population query for user
                { $match: user_filter_query },
                {
                    $lookup: {
                        from: 'institutes',
                        localField: 'institute',
                        foreignField: '_id',
                        as: 'institute',
                        pipeline: [
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$institute',
                        // for not showing not matched doc 
                        preserveNullAndEmptyArrays: false
                    }
                },
                // after population query for institute
                { $match: institute_filter_query },
                { $project: display_fields },
                { $skip: page_limit * page_no },
                { $limit: page_limit },
                { $sort: { [sort_field]: sort_order } },
            ]);
            res.status(200).json({ data: listData, message: "success" });
        } catch (e) {
            res.status(400).json({ message: e.messsage });
        }
    }
    else {
        const filter_role = ((role !== undefined && role.length > 0) ? [parseInt(role)] : [2, 3]);

        const display_fields = { firstName: 1, lastName: 1, email: 1, title: 1, role: 1, institute: 1 };

        const user_filter_query = {
            $and: [
                {
                    $or:
                        [
                            { firstName: { $regex: search_query, $options: 'i' } },
                            { lastName: { $regex: search_query, $options: 'i' } },
                            { email: { $regex: search_query, $options: 'i' } },
                        ]
                },
                { role: { $in: filter_role } },
                { institute: mongoose.Types.ObjectId(req.user.instituteId) }
            ]
        };

        try {
            const listData = await User.aggregate([
                { $match: user_filter_query },
                { $project: display_fields },
                { $skip: (page_limit * page_no) },
                { $limit: page_limit },
                { $sort: { [sort_field]: sort_order } },
            ]);
            res.status(200).json({ data: listData, message: "success" });
        } catch (e) {
            res.status(400).json({ message: e.messsage });
        }
    }
}
