import express from 'express';
import db from '../config/db.js';
import {
    getAllPersonnel,
    createPersonnel,
    updatePersonnel,
    deletePersonnel
} from '../controllers/personnel.controller.js';

const router = express.Router();

// Get all personnel with filtering, sorting & pagination
router.get('/', async (req, res) => {
    const { role, experience_level, sortBy, order, page, limit } = req.query;

    let query = 'SELECT * FROM personnel WHERE 1=1';
    const params = [];

    // Filtering
    if (role) {
        query += ' AND role = ?';
        params.push(role);
    }
    if (experience_level) {
        query += ' AND experience_level = ?';
        params.push(experience_level);
    }

    // Sorting
    if (sortBy) {
        const validSortFields = ['name', 'experience_level', 'role', 'created_at'];
        if (validSortFields.includes(sortBy)) {
            query += ` ORDER BY ${sortBy} ${order === 'desc' ? 'DESC' : 'ASC'}`;
        }
    } else {
        query += ' ORDER BY id ASC';
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Other CRUD routes
router.post('/', createPersonnel);
router.put('/:id', updatePersonnel);
router.delete('/:id', deletePersonnel);

export default router;
