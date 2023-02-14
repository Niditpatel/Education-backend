const e = require('express');
const { default: mongoose } = require('mongoose');
const { Institute, validateInstitute } = require('../Models/Institution');
const { findInstituteByIdentifier, createInstituteService, deleteInstituteService, updateInstituteService, listInstitutesService, findInstituteById } = require('../Services/institute.service');

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
    const id = req.params;
    try {
        const institute = await findInstituteById(id);
        res.status(200).json({ success: 1, data: institute });
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message })
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
                res.status(200).json({ success: 1, message: 'created successfully' })
            } catch (e) {
                res.status(400).json({ success: 0, message: e.message })
            }
        } else {
            res.status(400).json({ success: 0, message: "Identifier Must Be Unique" })
        }
    }).catch(e => {
        res.status(400).json({ success: 0, message: e.message });
    })
}

// delete institute 
exports.instituteDelete = async (req, res) => {
    const id = req.params.id;
    try {
        const institute = await deleteInstituteService(id);
        res.status(200).json({ success: 1, message: `${institute.name} is deleted.` })
    } catch {
        res.status(400).json({ success: 0, message: e.message })
    }
}


// update institute 
exports.instituteUpdate = async (req, res) => {
    const institute = req.body;
    const id = req.params.id;
    try {
        await updateInstituteService(id, institute);
        res.status(200).json({ success: 1, message: "updated successfully" });
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message });
    }
}

// institute listining 
exports.instituteList = async (req, res) => {
    const { query, search_institutions, search_territory, search_level, search_type, guest, offset, limit, sort_by, order } = req.query;

    const search_query = (query !== undefined ? query : '');
    const page_limit = ((limit !== undefined && limit.length > 0) ? parseInt(limit) : 5);
    const page_no = ((offset !== undefined && offset.length > 0) ? parseInt(offset) - 1 : 0);
    const sort_order = ((order !== undefined && order.length > 0) ? parseInt(order) : 1);
    const sort_field = ((sort_by !== undefined && sort_by.length > 0) ? sort_by : '_id');

    const territory_filter = ((search_territory !== undefined && search_territory.length > 0) ? (search_territory.split('&&').map(item => item.trim())) : '');
    const level_filter = ((search_level !== undefined && search_level.length > 0) ? (search_level.split('&&').map(item => item.trim())) : '');
    const type_filter = ((search_type !== undefined && search_type.length > 0) ? (search_type.split('&&').map(item => item.trim())) : '');
    const guest_filter = ((guest !== undefined && guest.length > 0) ? guest === "true" ? true : false : { $in: [true, false] })


    const institution_filter_query = ((search_institutions !== undefined && search_institutions.length > 0) ? { $in: [...search_institutions.split('&&').map(item => mongoose.Types.ObjectId(item.trim()))] } : { $ne: null });
    const territory_filter_query = (territory_filter.length > 0 ? { $in: territory_filter } : { $exists: true });
    const level_filter_query = (level_filter.length > 0 ? { $in: level_filter } : { $exists: true });
    const type_filter_query = (type_filter.length > 0 ? { type: { $in: type_filter } } : { $or: [{ type: { $regex: type_filter } }, { type: { $eq: null } }] });


    const institute_filter_query = {
        $and: [
            {
                $or: [
                    { name: { $regex: search_query, $options: 'i' } },
                    { territory: { $regex: search_query, $options: 'i' } },
                    { level: { $regex: search_query, $options: 'i' } },
                    { type: { $regex: search_query, $options: 'i' } },
                ]
            },
            { _id: institution_filter_query },
            { territory: territory_filter_query },
            { level: level_filter_query },
            type_filter_query,
            { isGuest: guest_filter }
        ]
    }

    const display_fields = { _id: 1, name: 1, identifier: 1, addressLine1: 1, addressLine2: 1, homePage: 1, city: 1, postcode: 1, country: 1, territory: 1, localAuthority: 1, level: 1, noOfStudents: 1, type: 1, isGuest: 1 }

    try {
        const listData = await listInstitutesService([
            { $match: institute_filter_query },
            { $project: display_fields },
            {
                $facet: {
                    metadata: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 }
                            }
                        },
                    ],
                    data: [
                        { $sort: { [sort_field]: sort_order } },
                        { $skip: page_limit * page_no },
                        { $limit: page_limit },
                    ]
                }
            },
        ])
        if (listData[0].data.length > 0) {
            res.status(200).json({ data: listData[0].data, count: listData[0].metadata[0].total, message: "success", success: 1 });
        } else {
            res.status(404).json({ success: 0, message: 'no data found with match query' })
        }
    } catch (e) {
        res.status(400).json({ success: 0, message: e.message })
    }
}



exports.getTypes = (req, res) => {
    const types = [
        'Primary School',
        'Secondary School',
        'Special School',
        'Intermediate School',
        'College',
        'University',
        'Acadamy',
        "Free School",
        "Independent",
        "Other"
    ]
    res.status(200).json(types);
}

exports.getTerritory = (req, res) => {
    const territories = [
        'Andaman and Nicobar',
        'Chandigarh',
        'Dadra and Nagar Haveli',
        'Daman and Diu',
        'Ladakh',
        "Delhi",
        'Lakshadweep'
    ];

    res.status(200).json(territories);
}

exports.getLevel = (req, res) => {
    const levels = [
        'Pre Primary',
        "Primary",
        "Middle",
        "Secondary",
        "Higher Secondary",
        "Degree",
        "Other"
    ];
    res.status(200).json(levels);
}