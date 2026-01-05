import db from '../config/db.js';

export const getAllPersonnel = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM personnel');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Personnel
export const createPersonnel = async (req, res) => {
    const { name, email, role, experience_level } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Check duplicate email
        const [existing] = await db.query('SELECT * FROM personnel WHERE email=?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const [result] = await db.query(
            'INSERT INTO personnel (name, email, role, experience_level) VALUES (?, ?, ?, ?)',
            [name, email, role, experience_level]
        );
        res.status(201).json({ id: result.insertId, name, email, role, experience_level });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePersonnel = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, experience_level } = req.body;
    try {
        await db.query(
            'UPDATE personnel SET name=?, email=?, role=?, experience_level=? WHERE id=?',
            [name, email, role, experience_level, id]
        );
        res.json({ message: 'Personnel updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deletePersonnel = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM personnel WHERE id=?', [id]);
        res.json({ message: 'Personnel deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
