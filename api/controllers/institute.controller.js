const e = require('express');
const { Institute, validateInstitute } = require('../Models/Institution');
const { findInstituteByIdentifier, createInstituteService, deleteInstituteService, updateInstituteService } = require('../Services/institute.service');
// const { search } = require('../Route/user.route');

// get all institutes 
exports.institutes = async (req, res) => {
    try {
        const institutes = await Institute.find({});
        res.status(200).json(institutes);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}


// get institute by id 
exports.instituteById = async (req, res) => {
    try {
        const institute = await Institute.findOne({ instituteId: id });
        res.status(200).json(institute);
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
}


// create institute 
exports.instituteCreate = (req, res) => {
    const institute = req.body;
    validateInstitute(institute).then(async (value) => {
        const existsInstitute = await findInstituteByIdentifier(value.identifier);
        if (!existsInstitute) {
            try {
                const institute = await createInstituteService(value);
                res.status(200).json({ message: 'created successfully' })
            } catch (e) {
                res.status(400).json({ message: e.message })
            }
        } else {
            res.status(400).json({ success: 0, message: "Identifier Must Be Unique" })
        }
    }).catch(e => {
        res.status(400).json(e.message);
    })
}

// delete institute 
exports.instituteDelete = async (req, res) => {
    const id = req.params.id;
    try {
        const institute = await deleteInstituteService(id);
        res.status(200).json({ message: `${institute.name} is deleted.` })
    } catch {
        res.status(400).json({ message: e.message })
    }
}


// update institute 
exports.instituteUpdate = async (req, res) => {
    const institute = req.body;
    const id = req.params.id;
    try {
        await updateInstituteService(id, institute);
        res.status(200).json({ message: e.message });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}

// institute listining 
exports.instituteList = async (req, res) => {
    const { query, search_institutions, search_territory, search_level, search_type, guest, offset, limit, sort_by, order } = req.query;

    const search_query = (query !== undefined ? query : '');
    const page_limit = ((limit !== undefined && limit.length > 0) ? parseInt(limit) : 5);
    const page_no = ((offset !== undefined && offset.length > 0) ? parseInt(offset) : 0);
    const sort_order = ((order !== undefined && order.length > 0) ? parseInt(order) : 1);
    const sort_field = ((sort_by !== undefined && sort_by.length > 0) ? sort_by : '_id');

    const institution_filter = ((search_institutions !== undefined && search_institutions.length > 0) ? (search_institutions.split('&&').map(item => item.trim())) : '');
    const territory_filter = ((search_territory !== undefined && search_territory.length > 0) ? (search_territory.split('&&').map(item => item.trim())) : '');
    const level_filter = ((search_level !== undefined && search_level.length > 0) ? (search_level.split('&&').map(item => item.trim())) : '');
    const type_filter = ((search_type !== undefined && search_type.length > 0) ? (search_type.split('&&').map(item => item.trim())) : '');
    const guest_filter = ((guest !== undefined && guest.length > 0) ? parseInt(guest) : { $in: [0, 1] })


    const institution_filter_query = (institution_filter.length > 0 ? { $in: institution_filter } : { $exists: true });
    const territory_filter_query = (territory_filter.length > 0 ? { $in: territory_filter } : { $exists: true });
    const level_filter_query = (level_filter.length > 0 ? { $in: level_filter } : { $exists: true });
    const type_filter_query = (type_filter.length > 0 ? { type: { $in: type_filter } } : { $or: [{ type: { $regex: type_filter } }, { type: { $eq: null } }] });

    try {
        const instituteList = await Institute.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: search_query, $options: 'i' } },
                        { territory: { $regex: search_query, $options: 'i' } },
                        { level: { $regex: search_query, $options: 'i' } },
                        { type: { $regex: search_query, $options: 'i' } },
                    ]
                },
                { name: institution_filter_query },
                { territory: territory_filter_query },
                { level: level_filter_query },
                type_filter_query,
                { isGuest: guest_filter }
            ]
        })
            .skip(page_no * page_limit)
            .limit(page_limit)
            .sort({ [sort_field]: sort_order });
        res.status(200).json(instituteList);
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
}