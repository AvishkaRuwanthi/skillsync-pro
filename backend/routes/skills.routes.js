import express from 'express';
import db from '../config/db.js';
import {
    getAllSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    assignSkillToPersonnel,
    getPersonnelSkills
} from '../controllers/skills.controller.js';

const router = express.Router();

// Get all skills with filtering, sorting, pagination
router.get('/', async (req, res) => {
    const { category, sortBy, order, page, limit } = req.query;

    let query = 'SELECT * FROM skills WHERE 1=1';
    const params = [];

    // Filtering
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    // Sorting
    if (sortBy) {
        const validSortFields = ['name', 'category', 'id'];
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
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

// Assign a skill to a personnel
router.post('/assign', assignSkillToPersonnel);

// Get all skills of a personnel
router.get('/personnel/:personnel_id', getPersonnelSkills);

export default router;
