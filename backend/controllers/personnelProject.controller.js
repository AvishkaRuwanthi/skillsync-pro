import db from '../config/db.js';

export const assignPersonnelToProject = async (req, res) => {
    const { personnel_id, project_id, start_date, end_date } = req.body;

    // Validation
    if (!personnel_id || !project_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check overlapping assignments (availability check)
        const [existing] = await db.query(
            `SELECT * FROM personnel_projects
             WHERE personnel_id = ?
             AND NOT (end_date < ? OR start_date > ?)`,
            [personnel_id, start_date, end_date]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Personnel is already assigned during this period'
            });
        }

        await db.query(
            `INSERT INTO personnel_projects (personnel_id, project_id, start_date, end_date)
             VALUES (?, ?, ?, ?)`,
            [personnel_id, project_id, start_date, end_date]
        );

        res.status(201).json({
            message: 'Personnel successfully assigned to project'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
