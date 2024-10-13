const postgre = require('../database');

const bookController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM books");
            res.json({ msg: "OK", data: rows });
        } catch (error) {
            res.status(500).json({ msg: "Error retrieving books", error: error.message });
        }
    },
    
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM books WHERE book_id = $1", [req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "OK", data: rows[0] }); // return only the found book
            }

            res.status(404).json({ msg: "Book not found" });
        } catch (error) {
            res.status(500).json({ msg: "Error retrieving book", error: error.message });
        }
    },
    
    create: async (req, res) => {
        try {
            const { name, author, price } = req.body; // added author here

            if (!name || !author || !price) {
                return res.status(400).json({ msg: "Name, author, and price are required" });
            }

            const sql = 'INSERT INTO books(name, author, price) VALUES($1, $2, $3) RETURNING *';
            const { rows } = await postgre.query(sql, [name, author, price]);

            res.status(201).json({ msg: "OK", data: rows[0] });
        } catch (error) {
            res.status(500).json({ msg: "Error creating book", error: error.message });
        }
    },
    
    updateById: async (req, res) => {
        try {
            const { name, author, price } = req.body; // added author here

            if (!name && !author && !price) {
                return res.status(400).json({ msg: "At least one field (name, author, price) is required to update" });
            }

            const sql = 'UPDATE books SET name = COALESCE($1, name), author = COALESCE($2, author), price = COALESCE($3, price) WHERE book_id = $4 RETURNING *';
            const { rows } = await postgre.query(sql, [name, author, price, req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "OK", data: rows[0] });
            }

            res.status(404).json({ msg: "Book not found" });
        } catch (error) {
            res.status(500).json({ msg: "Error updating book", error: error.message });
        }
    },
    
    deleteById: async (req, res) => {
        try {
            const sql = 'DELETE FROM books WHERE book_id = $1 RETURNING *';
            const { rows } = await postgre.query(sql, [req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "OK", data: rows[0] });
            }

            return res.status(404).json({ msg: "Book not found" });
        } catch (error) {
            res.status(500).json({ msg: "Error deleting book", error: error.message });
        }
    }
}

module.exports = bookController;
