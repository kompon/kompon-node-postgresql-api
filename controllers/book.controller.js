const postgre = require('../database');

const bookController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM books");
            res.json({ msg: "สำเร็จ", data: rows });
        } catch (error) {
            res.status(500).json({ msg: "เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ", error: error.message });
        }
    },
    
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM books WHERE book_id = $1", [req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "สำเร็จ", data: rows[0] }); // ส่งคืนเฉพาะหนังสือที่พบ
            }

            res.status(404).json({ msg: "ไม่พบหนังสือ" });
        } catch (error) {
            res.status(500).json({ msg: "เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ", error: error.message });
        }
    },
    
    create: async (req, res) => {
        try {
            const { name, author, price } = req.body; // ลบ book_id ออก

            // ตรวจสอบข้อมูลที่จำเป็น
            if (!name || !author || typeof price !== 'number') {
                return res.status(400).json({ msg: "ชื่อ, ผู้เขียน, และราคาเป็นข้อมูลที่จำเป็น" });
            }

            // เตรียมคำสั่ง SQL
            const sql = 'INSERT INTO books(name, author, price) VALUES($1, $2, $3) RETURNING *';
            const { rows } = await postgre.query(sql, [name, author, price]);

            res.status(201).json({ msg: "สำเร็จ", data: rows[0] });
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการสร้างหนังสือ:", error); // แสดงข้อผิดพลาดสำหรับการดีบัก
            res.status(500).json({ msg: "เกิดข้อผิดพลาดในการสร้างหนังสือ", error: error.message });
        }
    },
    
    updateById: async (req, res) => {
        try {
            const { name, author, price } = req.body;

            if (!name && !author && typeof price !== 'number') {
                return res.status(400).json({ msg: "ต้องมีข้อมูลอย่างน้อยหนึ่งรายการ (ชื่อ, ผู้เขียน, ราคา) เพื่ออัปเดต" });
            }

            const sql = 'UPDATE books SET name = COALESCE($1, name), author = COALESCE($2, author), price = COALESCE($3, price) WHERE book_id = $4 RETURNING *';
            const { rows } = await postgre.query(sql, [name, author, price, req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "สำเร็จ", data: rows[0] });
            }

            res.status(404).json({ msg: "ไม่พบหนังสือ" });
        } catch (error) {
            res.status(500).json({ msg: "เกิดข้อผิดพลาดในการอัปเดตหนังสือ", error: error.message });
        }
    },
    
    deleteById: async (req, res) => {
        try {
            const sql = 'DELETE FROM books WHERE book_id = $1 RETURNING *';
            const { rows } = await postgre.query(sql, [req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "สำเร็จ", data: rows[0] });
            }

            return res.status(404).json({ msg: "ไม่พบหนังสือ" });
        } catch (error) {
            res.status(500).json({ msg: "เกิดข้อผิดพลาดในการลบหนังสือ", error: error.message });
        }
    }
}

module.exports = bookController;
