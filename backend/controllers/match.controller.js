import db from '../config/db.js';

// Proficiency mapping for sorting
const proficiencyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

export const getProjectMatches = async (req, res) => {
    const { projectId } = req.params;

    try {
        // Get project required skills
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

        // Find personnel who meet each skill requirement
        let matchedPersonnelBySkill = [];

        for (let reqSkill of requirements) {
            const [rows] = await db.query(
                `SELECT p.id, p.name, p.role, ps.proficiency
                 FROM personnel_skills ps
                 JOIN personnel p ON ps.personnel_id = p.id
                 WHERE ps.skill_id = ? 
                   AND FIELD(ps.proficiency, 'Beginner','Intermediate','Advanced','Expert') >=
                       FIELD(?, 'Beginner','Intermediate','Advanced','Expert')`,
                [reqSkill.skill_id, reqSkill.min_proficiency]
            );

            matchedPersonnelBySkill.push(rows);
        }

        // Combine matched personnel who satisfy ALL skills
        let finalMatches = [];
        if (matchedPersonnelBySkill.length > 0) {
            finalMatches = matchedPersonnelBySkill.reduce((a, b) =>
                a.filter(personA => b.some(personB => personA.id === personB.id))
            );
        }

        // Fetch all skills for each matched personnel
        for (let person of finalMatches) {
            const [skills] = await db.query(
                `SELECT s.name AS skill_name, ps.proficiency
                 FROM personnel_skills ps
                 JOIN skills s ON ps.skill_id = s.id
                 WHERE ps.personnel_id = ?`,
                [person.id]
            );
            person.skills = skills;
        }

        // Sort by average proficiency
        finalMatches.sort((a, b) => {
            const aScore = a.skills.reduce((sum, s) => sum + proficiencyOrder[s.proficiency], 0) / a.skills.length;
            const bScore = b.skills.reduce((sum, s) => sum + proficiencyOrder[s.proficiency], 0) / b.skills.length;
            return bScore - aScore; // highest first
        });

        // Send response
        res.json({
            project: projectId,
            requirements,
            matched_personnel: finalMatches
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
