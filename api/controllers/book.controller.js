const e = require('express');
const { Book, validateBook } = require('../Models/Book');


// create book 
exports.bookCreate = (req, res) => {
    const book = req.body;
    validateBook(book).then(async value => {
        try {
            await new Book({ ...value }).save();
            res.status(200).json({ message: 'book created' });
        }
        catch (e) {
            res.status(400).json({ message: e.message });
        }
    }).catch(e => res.status(400).json({ message: e.message }));
}

// delete book 
exports.bookDelete = async (req, res) => {
    const id = req.params.id;
    try {
        await Book.findByIdAndDelete(id);
        res.status(200).json({ message: e.message });
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
}

// update book 
exports.bookUpdate = async (req, res) => {
    const id = req.params.id;
    const book = req.body;
    try {
        await Book.findByIdAndUpdate(id, { ...book });
        res.status(200).json({ message: 'book updated' })
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
}


// unlock book 
exports.bookUnlock = async (req, res) => {
    const id = req.params.id;
    const { isbn } = req.body;
    try {
        const book = await Book.findById(id);
        if (book.isbn === isbn) {
            book.isActive = 1;
            book.save();
            res.status(200).json({ message: 'unlocked' })
        } else {
            res.status(400).json({ message: 'worng isbn' });
        }
    } catch (e) {
        res.status(400).json({ message: e.message });
    }

}

// book listing 
exports.bookList = async (req, res) => {
    const { query, limit, offset, order, sort_by } = req.query;

    const search_query = ((query !== undefined && query.length > 0) ? { $regex: query, $options: true } : { $regex: '' });
    const search_active = (query === 'active' ? 1 : { $in: [0, 1] });

    const page_limit = ((limit !== undefined && limit.length > 0) ? parseInt(limit) : 5);
    const page_no = ((offset !== undefined && offset.length > 0) ? parseInt(offset) : 0);
    const sort_order = ((order !== undefined && order.length > 0) ? parseInt(order) : 1);
    const sort_field = ((sort_by !== undefined && sort_by.length > 0) ? sort_by : '_id');

    try {
        const bookList = await Book.find({
            $or: [
                { title: search_query },
                { publisher: search_query },
                { imprint: search_query },
                { isbn: search_query },
                { pdfisbn: search_query },
                { isActive: search_active }
            ]
        })
            .skip(page_no * page_limit)
            .limit(page_limit)
            .sort({ [sort_field]: sort_order });
        res.status(200).json(bookList);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}