import db from '../config/db.js';

// Get all projects
export const getAllProjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new project
export const createProject = async (req, res) => {
    const { name, description, start_date, end_date, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    try {
        const [result] = await db.query(
            'INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [name, description, start_date, end_date, status]
        );
        res.status(201).json({ id: result.insertId, name, description, start_date, end_date, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update project
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, start_date, end_date, status } = req.body;
    try {
        await db.query(
            'UPDATE projects SET name=?, description=?, start_date=?, end_date=?, status=? WHERE id=?',
            [name, description, start_date, end_date, status, id]
        );
        res.json({ message: 'Project updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete project
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM projects WHERE id=?', [id]);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Assign required skills to a project
export const assignSkillsToProject = async (req, res) => {
    const { project_id, skills } = req.body; // skills = [{ skill_id, min_proficiency }]
    if (!project_id || !skills || !Array.isArray(skills)) return res.status(400).json({ error: 'Invalid data' });

    try {
        // Clear existing skills
        await db.query('DELETE FROM project_skills WHERE project_id=?', [project_id]);

        // Insert new required skills
        for (let skill of skills) {
            const { skill_id, min_proficiency } = skill;
            await db.query(
                'INSERT INTO project_skills (project_id, skill_id, min_proficiency) VALUES (?, ?, ?)',
                [project_id, skill_id, min_proficiency]
            );
        }

        res.json({ message: 'Project skills assigned' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Matching algorithm: find suitable personnel for a project
export const getMatchingPersonnel = async (req, res) => {
    const { project_id } = req.params;

    try {
        // Get project required skills
        const [requiredSkills] = await db.query(
            `SELECT ps.skill_id, ps.min_proficiency, s.name
             FROM project_skills ps
             JOIN skills s ON ps.skill_id = s.id
             WHERE ps.project_id=?`,
            [project_id]
        );

        if (requiredSkills.length === 0) return res.json({ message: 'No skills defined for this project', personnel: [] });

        // Get all personnel with their skills
        const [personnelSkills] = await db.query(
            `SELECT p.id as personnel_id, p.name, p.role, s.name as skill_name, ps.proficiency
             FROM personnel_skills ps
             JOIN personnel p ON ps.personnel_id = p.id
             JOIN skills s ON ps.skill_id = s.id`
        );

        // Helper to convert proficiency to numeric level
        const levelMap = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

        // Filter personnel who meet ALL required skills
        const personnelMap = {};

        personnelSkills.forEach(ps => {
            if (!personnelMap[ps.personnel_id]) {
                personnelMap[ps.personnel_id] = { id: ps.personnel_id, name: ps.name, role: ps.role, skills: {} };
            }
            personnelMap[ps.personnel_id].skills[ps.skill_name] = ps.proficiency;
        });

        const matches = [];

        for (let p of Object.values(personnelMap)) {
            let matchedCount = 0;
            for (let rs of requiredSkills) {
                if (p.skills[rs.name] && levelMap[p.skills[rs.name]] >= levelMap[rs.min_proficiency]) {
                    matchedCount++;
                }
            }
            if (matchedCount === requiredSkills.length) {
                matches.push({ personnel: p, matchPercentage: 100 });
            }
        }

        res.json({ personnel: matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
