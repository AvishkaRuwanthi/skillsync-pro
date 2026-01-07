import db from '../config/db.js';

// Get all projects
export const getAllProjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');

        // Attach required skills for each project
        const projectsWithSkills = await Promise.all(
            rows.map(async (proj) => {
                const [skills] = await db.query(
                    `SELECT ps.skill_id, ps.min_proficiency, s.name
                     FROM project_skills ps
                     JOIN skills s ON ps.skill_id = s.id
                     WHERE ps.project_id = ?`,
                    [proj.id]
                );

                return {
                    ...proj,
                    requiredSkills: skills.map((s) => ({ skill_id: s.skill_id, skill_name: s.name, min_proficiency: s.min_proficiency })),
                    // Attach assigned personnels (if any)
                    assignedPersonnel: await (async () => {
                        const [assignedRows] = await db.query(
                            `SELECT p.id, p.name, p.role, pp.start_date, pp.end_date
                             FROM personnel_projects pp
                             JOIN personnel p ON pp.personnel_id = p.id
                             WHERE pp.project_id = ?`,
                            [proj.id]
                        );
                        return assignedRows.map((a) => ({ id: a.id, name: a.name, role: a.role, start_date: a.start_date, end_date: a.end_date }));
                    })(),
                };
            })
        );

        res.json(projectsWithSkills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new project
export const createProject = async (req, res) => {
    const { name, description, start_date, end_date, status, requiredSkills } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    try {
        const [result] = await db.query(
            'INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [name, description, start_date, end_date, status]
        );
        const projectId = result.insertId;

        // Insert required skills if provided (skills as names)
        if (Array.isArray(requiredSkills)) {
            for (const item of requiredSkills) {
                let skillName = null;
                let skillId = null;
                let minProf = 1;

                if (typeof item === 'string') {
                    skillName = item;
                } else if (typeof item === 'object' && item !== null) {
                    skillName = item.skill_name || item.name || null;
                    skillId = item.skill_id || null;
                    minProf = item.min_proficiency ? Number(item.min_proficiency) : 1;
                }

                if (!skillId && skillName) {
                    const [existing] = await db.query('SELECT id FROM skills WHERE name=?', [skillName]);
                    if (existing.length > 0) skillId = existing[0].id;
                    else {
                        const [r] = await db.query('INSERT INTO skills (name, category, description) VALUES (?, ?, ?)', [skillName, 'General', null]);
                        skillId = r.insertId;
                    }
                }

                if (skillId) {
                    await db.query('INSERT INTO project_skills (project_id, skill_id, min_proficiency) VALUES (?, ?, ?)', [projectId, skillId, minProf]);
                }
            }
        }

        res.status(201).json({ id: projectId, name, description, start_date, end_date, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update project
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, start_date, end_date, status, requiredSkills } = req.body;
    try {
        await db.query(
            'UPDATE projects SET name=?, description=?, start_date=?, end_date=?, status=? WHERE id=?',
            [name, description, start_date, end_date, status, id]
        );
        // Update project_skills: remove old and insert new if provided
        if (Array.isArray(requiredSkills)) {
            await db.query('DELETE FROM project_skills WHERE project_id=?', [id]);
            for (const item of requiredSkills) {
                let skillName = null;
                let skillId = null;
                let minProf = 1;

                if (typeof item === 'string') {
                    skillName = item;
                } else if (typeof item === 'object' && item !== null) {
                    skillName = item.skill_name || item.name || null;
                    skillId = item.skill_id || null;
                    minProf = item.min_proficiency ? Number(item.min_proficiency) : 1;
                }

                if (!skillId && skillName) {
                    const [existing] = await db.query('SELECT id FROM skills WHERE name=?', [skillName]);
                    if (existing.length > 0) skillId = existing[0].id;
                    else {
                        const [r] = await db.query('INSERT INTO skills (name, category, description) VALUES (?, ?, ?)', [skillName, 'General', null]);
                        skillId = r.insertId;
                    }
                }

                if (skillId) {
                    await db.query('INSERT INTO project_skills (project_id, skill_id, min_proficiency) VALUES (?, ?, ?)', [id, skillId, minProf]);
                }
            }
        }

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
