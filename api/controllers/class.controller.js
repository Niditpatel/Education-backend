const { Class, validateClass } = require('../Models/Class');
const mongoose = require('mongoose');


// create Class 
exports.classCreate = (req, res) => {
    const class_details = req.body;
    validateClass(class_details).then(async value => {
        try {
            if (req.user.role === 0) {
                await new Class({ ...value }).save();
            } else {
                await new Class({ ...value, institute: req.user.instituteId }).save();
            }
            res.status(200).json({ message: 'class created' })
        }
        catch (e) {
            res.json({ message: e.message });
        }
    }).catch(e => res.json({ message: e.message }))
}


// delete class 
exports.classDelete = async (req, res) => {
    const id = req.params.id;
    try {
        if (req.user.role === 0) {
            await Class.findByIdAndDelete(id);
        } else {
            await Class.findOneAndDelete({ _id: id, institute: req.user.instituteId })
        }
        res.status(200).json({ message: e.message });
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
}

// update calss 
exports.classUpdate = async (req, res) => {
    const id = req.params.id;
    const Class_update = req.body;
    try {
        if (req.user.role === 0) {
            await Class.findByIdAndUpdate(id, { ...Class_update });
        } else {
            await Class.findOneAndUpdate({ _id: id, institute: req.user.instituteId }, { ...Class_update });
        }
        res.status(200).json({ message: 'class updated' })
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
}

//  class listing 
exports.classList = async (req, res) => {
    const { query, limit, offset, order, sort_by, keystage, board, search_schools } = req.query;

    const search_query = ((query !== undefined && query.length > 0 ? { $regex: query, $options: 'i' } : { $regex: '' }));

    const sort_order = ((order !== undefined && order.length > 0) ? parseInt(order) : 1);
    const sort_field = ((sort_by !== undefined && sort_by.length > 0) ? sort_by : '_id');
    const page_limit = ((limit !== undefined && limit.length > 0) ? parseInt(limit) : 5);
    const page_no = ((offset !== undefined && offset.length > 0) ? parseInt(offset) : 0);


    const keyStage_filter = ((keystage !== undefined && keystage.length > 0) ? (keystage.split('&&').map(item => item.trim())) : '');
    const board_filter = ((board !== undefined && board.length > 0) ? (board.split('&&').map(item => item.trim())) : '');


    const keyStage_filter_query = (keyStage_filter.length > 0 ? { keyStage: { $in: keyStage_filter } } : { $or: [{ keyStage: { $regex: keyStage_filter } }, { keyStage: { $eq: null } }] });
    const board_filter_query = (board_filter.length > 0 ? { examBoard: { $in: board_filter } } : { $or: [{ examBoard: { $regex: board_filter } }, { examBoard: { $eq: null } }] });


    const match_query = {
        $and: [
            {
                $or: [
                    { name: search_query },
                    { examBoard: search_query },
                    { keyStage: search_query }
                ]
            },
            keyStage_filter_query,
            board_filter_query
        ]
    }


    try {
        let classList;
        if (req.user.role === 0) {

            const school_filter = ((search_schools !== undefined && search_schools.length > 0) ? (search_schools.split('&&').map(item => item.trim())) : '');
            const school_filter_query = (school_filter.length > 0 ? { $in: school_filter } : { $exists: true })

            classList = await Class.aggregate([
                { $match: match_query },
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
                    },
                },
                {
                    $unwind: {
                        path: '$institute',
                        // for not showing not matched doc 
                        preserveNullAndEmptyArrays: false
                    }
                },
                { $match: { $or: [{ 'institute.name': school_filter_query }, { 'institute.name': search_query }] } },
                { $skip: page_limit * page_no },
                { $limit: page_limit },
                { $sort: { [sort_field]: sort_order } }
            ])
        } else {
            classList = await Class.aggregate([
                { $match: match_query },
                { $match: { institute: mongoose.Types.ObjectId(req.user.instituteId) } },
                { $skip: page_limit * page_no },
                { $limit: page_limit },
                { $sort: { [sort_field]: sort_order } }
            ])
        }
        res.status(200).json(classList);
    }
    catch (e) {
        res.status(400).json({ message: e.message })
    }
}
