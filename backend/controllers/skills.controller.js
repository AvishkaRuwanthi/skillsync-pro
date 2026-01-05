import db from '../config/db.js';

// Get all skills
export const getAllSkills = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM skills');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Skill
export const createSkill = async (req, res) => {
    const { name, category } = req.body;

    if (!name) return res.status(400).json({ error: 'Skill name is required' });
    if (!category) return res.status(400).json({ error: 'Skill category is required' });

    try {
        // Check duplicate skill
        const [existing] = await db.query('SELECT * FROM skills WHERE name=?', [name]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Skill already exists' });
        }

        const [result] = await db.query(
            'INSERT INTO skills (name, category, description) VALUES (?, ?, ?)',
            [name, category, req.body.description || null]
        );

        res.status(201).json({ id: result.insertId, name, category, description: req.body.description || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Update a skill
export const updateSkill = async (req, res) => {
    const { id } = req.params;
    const { name, category, description } = req.body;
    try {
        await db.query(
            'UPDATE skills SET name=?, category=?, description=? WHERE id=?',
            [name, category, description, id]
        );
        res.json({ message: 'Skill updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a skill
export const deleteSkill = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM skills WHERE id=?', [id]);
        res.json({ message: 'Skill deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Assign a skill to a personnel
export const assignSkillToPersonnel = async (req, res) => {
    const { personnel_id, skill_id, proficiency } = req.body;
    if (!personnel_id || !skill_id || !proficiency) {
        return res.status(400).json({ error: 'personnel_id, skill_id, and proficiency are required' });
    }

    try {
        const [existing] = await db.query(
            'SELECT * FROM personnel_skills WHERE personnel_id=? AND skill_id=?',
            [personnel_id, skill_id]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE personnel_skills SET proficiency=? WHERE personnel_id=? AND skill_id=?',
                [proficiency, personnel_id, skill_id]
            );
            return res.json({ message: 'Skill proficiency updated' });
        }

        await db.query(
            'INSERT INTO personnel_skills (personnel_id, skill_id, proficiency) VALUES (?, ?, ?)',
            [personnel_id, skill_id, proficiency]
        );

        res.status(201).json({ message: 'Skill assigned to personnel' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all skills of a personnel
export const getPersonnelSkills = async (req, res) => {
    const { personnel_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT ps.id, s.name as skill_name, s.category, ps.proficiency
             FROM personnel_skills ps
             JOIN skills s ON ps.skill_id = s.id
             WHERE ps.personnel_id=?`,
            [personnel_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
