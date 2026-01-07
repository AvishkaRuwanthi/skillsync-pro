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

    // Pagination (template literals instead of placeholders)
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    query += ` LIMIT ${limitNum} OFFSET ${offset}`;

    try {
        const [rows] = await db.query(query, params);

        // Attach skills for each personnel row
        const personnelWithSkills = await Promise.all(
            rows.map(async (p) => {
                const [skills] = await db.query(
                    `SELECT s.name
                     FROM personnel_skills ps
                     JOIN skills s ON ps.skill_id = s.id
                     WHERE ps.personnel_id = ?`,
                    [p.id]
                );

                return {
                    ...p,
                    skills: skills.map((s) => s.name),
                };
            })
        );

        res.json(personnelWithSkills);
    } catch (err) {
        console.error("Error fetching personnel:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Create new personnel
router.post('/', async (req, res) => {
    try {
        await createPersonnel(req, res);
    } catch (err) {
        console.error("Error creating personnel:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Update personnel by ID
router.put('/:id', async (req, res) => {
    try {
        await updatePersonnel(req, res);
    } catch (err) {
        console.error("Error updating personnel:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Delete personnel by ID
router.delete('/:id', async (req, res) => {
    try {
        await deletePersonnel(req, res);
    } catch (err) {
        console.error("Error deleting personnel:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

export default router;
