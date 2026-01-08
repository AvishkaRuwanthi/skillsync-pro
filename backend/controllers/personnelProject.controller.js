import db from '../config/db.js';

export const assignPersonnelToProject = async (req, res) => {
    const { personnel_id, project_id, start_date, end_date } = req.body;

    // Validation
    if (!personnel_id || !project_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check for overlapping assignments (availability)
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

        // Assign personnel to project
        const [result] = await db.query(
            `INSERT INTO personnel_projects (personnel_id, project_id, start_date, end_date)
             VALUES (?, ?, ?, ?)`,
            [personnel_id, project_id, start_date, end_date]
        );

        res.status(201).json({
            message: 'Personnel successfully assigned to project',
            assignmentId: result.insertId
        });

    } catch (err) {
        console.error('Error assigning personnel to project:', err);
        res.status(500).json({ error: err.message });
    }
};

// Remove personnel from a project
export const removePersonnelFromProject = async (req, res) => {
    const { personnel_id, project_id } = req.body;

    // Validation
    if (!personnel_id || !project_id) {
        return res.status(400).json({ error: 'personnel_id and project_id are required' });
    }

    try {
        // Delete the assignment
        const [result] = await db.query(
            `DELETE FROM personnel_projects
             WHERE personnel_id = ? AND project_id = ?`,
            [personnel_id, project_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json({
            message: 'Personnel successfully removed from project'
        });

    } catch (err) {
        console.error('Error removing personnel from project:', err);
        res.status(500).json({ error: err.message });
    }
};