const mongoose = require('mongoose');

const { findUserByIdAndDeleteService, findOneUserAndDeleteService, findUserByIdAndUpdateService, finOneUserAndUpdateService, listUsersService, userCountService, findUserByIdService } = require('../Services/user.service')



exports.findUser = async (req, res) => {
    const id = req.params.id;
    console.log(id, "finduser");
    try {
        const user = await findUserByIdService(id);
        res.status(200).json({ success: 1, user: user, message: '' })
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message });
    }
}




// delete user 
exports.userDelete = async (req, res) => {
    const id = req.params.id;
    console.log(id)
    try {
        await findUserByIdService(id);
        let user;
        if (req.user.role === "SuperAdmin") {
            user = await findUserByIdAndDeleteService(id);
            console.log(user)
        } else {
            user = await findOneUserAndDeleteService({ _id: id, institute: req.user.instituteId })
        }
        res.status(200).json({ success: 1, message: `${user.firstName} ${user.lastName} is deleted` });
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message });
    }
}


// update user 
exports.userUpdate = async (req, res) => {
    const user = req.body;
    const id = req.params.id;
    console.log(req.params, "update");
    try {
        let updatedUser;
        await findUserByIdService(id);
        if (req.user.role === "SuperAdmin") {
            updatedUser = await findUserByIdAndUpdateService(id, { ...user });
        } else {
            updatedUser = await finOneUserAndUpdateService({ _id: id, institute: req.user.instituteId }, { ...user });
        }
        res.status(200).json({ success: 1, message: `${updatedUser.firstName} ${updatedUser.lastName} is updated.` })
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message });
    }
}


// for user listing 
exports.userList = async (req, res) => {
    const { query, role, limit, offset, sort_by, order, search_schools } = req.query;
    // const andQuery = [];

    // const search_query = (query) => {
    //     return {
    //         $or: [
    //             { firstName: { $regex: query, $options: 'i' } },
    //             { lastName: { $regex: query, $options: 'i' } },
    //             { email: { $regex: query, $options: 'i' } },
    //         ]
    //     }
    // }

    // if ((query !== undefined && query.length > 0)) {
    //     andQuery.push(search_query(query));
    // }

    // // for super admin 
    // if ((req.user.role === "SuperAdmin")) {
    //     if ((role !== undefined && role.length > 0)) {
    //         andQuery.push({ role: { $in: role } })
    //     } else {
    //         andQuery.push({ role: { $in: ["SchoolAdmin", "Teacher", "User"] } })
    //     }
    // }
    // // for School Admin  
    // else {
    //     if ((role !== undefined && role.length > 0)) {
    //         andQuery.push({ role: { $in: role } })
    //     } else {
    //         andQuery.push({ role: { $in: ["Teacher", "User"] } })
    //     }
    // }

    const lookupQuery = [
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
        }
    ]



    const search_query = ((query !== undefined && query.length > 0) ? query : '');
    const sort_order = ((order !== undefined && order.length > 0) ? parseInt(order) : 1);
    const sort_field = ((sort_by !== undefined && sort_by.length > 0) ? sort_by : '_id');
    const page_limit = ((limit !== undefined && limit.length > 0) ? parseInt(limit) : 5);
    const page_no = ((offset !== undefined && offset.length > 0) ? parseInt(offset) : 0);

    // if super  admin  
    if (req.user.role === "SuperAdmin") {
        const filter_role = ((role !== undefined && role.length > 0) ? [...role.split('&&')] : ["SchoolAdmin", "Teacher", "User"]);
        const school_filter = ((search_schools !== undefined && search_schools.length > 0) ? [...search_schools.split('&&').map(item => mongoose.Types.ObjectId(item))] : '');
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
                            { 'institute.name': { $regex: search_query, $options: 'i' } },
                        ]
                },
                { role: { $in: filter_role } },
                { 'institute._id': school_filter_query }
            ]
        };

        try {
            const count = await userCountService({ role: { $ne: 'SuperAdmin' } });
            const listData = await listUsersService([
                ...lookupQuery,
                { $match: user_filter_query },
                { $project: display_fields },
                { $skip: page_limit * page_no },
                { $limit: page_limit },
                { $sort: { [sort_field]: sort_order } },
            ]);
            res.status(200).json({ data: listData, count: count, message: "success", success: 1 });
        } catch (e) {
            res.status(400).json({ message: e.messsage, success: 0 });
        }
    }
    else {
        const filter_role = ((role !== undefined && role.length > 0) ? [...role.split('&&')] : ["Teacher", "User"]);

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
            const count = await userCountService({ role: { $nin: ['SuperAdmin', 'SchoolAdmin'] }, institute: { $eq: mongoose.Types.ObjectId(req.user.instituteId) } });
            const listData = await listUsersService([
                { $match: user_filter_query },
                { $project: display_fields },
                { $skip: (page_limit * page_no) },
                { $limit: page_limit },
                { $sort: { [sort_field]: sort_order } },
            ]);
            res.status(200).json({ data: listData, count: count, message: "success", success: 1 });
        } catch (e) {
            res.status(400).json({ message: e.messsage, success: 0 });
        }
    }
}