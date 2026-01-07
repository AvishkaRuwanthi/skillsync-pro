import db from '../config/db.js';

export const getProjectMatches = async (req, res) => {
    const { projectId } = req.params;

    try {
        // Get project requirements
        const [requirements] = await db.query(
            `SELECT ps.skill_id, s.name AS skill_name, ps.min_proficiency
             FROM project_skills ps
             JOIN skills s ON ps.skill_id = s.id
             WHERE ps.project_id = ?`,
            [projectId]
        );

        if (requirements.length === 0) {
            return res.json({ project: projectId, requirements: [], matched_personnel: [] });
        }

        // Get all personnel
        const [personnelList] = await db.query(`SELECT * FROM personnel`);

        const proficiencyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
        const today = new Date().toISOString().split('T')[0]; // Current date for availability check

        let matchedPersonnel = [];

        for (let person of personnelList) {
            // Get skills of this personnel
            const [personSkills] = await db.query(
                `SELECT skill_id, proficiency
                 FROM personnel_skills
                 WHERE personnel_id = ?`,
                [person.id]
            );

            // Count matched skills
            let matchedSkillsCount = 0;
            for (let reqSkill of requirements) {
                const skill = personSkills.find(ps => ps.skill_id === reqSkill.skill_id);
                if (skill && proficiencyOrder[skill.proficiency] >= proficiencyOrder[reqSkill.min_proficiency]) {
                    matchedSkillsCount++;
                }
            }

            const matchPercentage = Math.round((matchedSkillsCount / requirements.length) * 100);

            if (matchPercentage >= 50) { // Only consider personnel with >=50% match
                // Check availability
                const [assignments] = await db.query(
                    `SELECT * FROM personnel_projects
                     WHERE personnel_id = ?
                     AND NOT (end_date < ? OR start_date > ?)`,
                    [person.id, today, today]
                );
                const available = assignments.length === 0;

                matchedPersonnel.push({
                    id: person.id,
                    name: person.name,
                    role: person.role,
                    match_percentage: matchPercentage,
                    available
                });
            }
        }

        // Sort by highest match percentage first
        matchedPersonnel.sort((a, b) => b.match_percentage - a.match_percentage);

        res.json({
            project: projectId,
            requirements,
            matched_personnel: matchedPersonnel
        });

    } catch (err) {
        console.error('Error in getProjectMatches:', err);
        res.status(500).json({ error: err.message });
    }
};
