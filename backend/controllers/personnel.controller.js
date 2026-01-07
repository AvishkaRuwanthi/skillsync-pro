import db from '../config/db.js';

// Get all personnel with their skills
export const getAllPersonnel = async (req, res) => {
  try {
    const [personnel] = await db.query("SELECT * FROM personnel");

    const personnelWithSkills = await Promise.all(
      personnel.map(async (p) => {
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
    res.status(500).json({ error: err.message });
  }
};

// Helper: ensure skill exists in skills table
const ensureSkill = async (skillName) => {
  const [existing] = await db.query('SELECT id FROM skills WHERE name=?', [skillName]);
  if (existing.length > 0) return existing[0].id;

  const [result] = await db.query(
    'INSERT INTO skills (name, category, description) VALUES (?, ?, ?)',
    [skillName, 'General', null]
  );
  return result.insertId;
};

// Create personnel
export const createPersonnel = async (req, res) => {
  const { name, email, role, experience_level, skills } = req.body;

  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  try {
    const [existing] = await db.query('SELECT * FROM personnel WHERE email=?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const [result] = await db.query(
      'INSERT INTO personnel (name, email, role, experience_level) VALUES (?, ?, ?, ?)',
      [name, email, role, experience_level || '']
    );
    const personnel_id = result.insertId;

    // Insert skills
    if (Array.isArray(skills)) {
      for (const skillName of skills) {
        const skill_id = await ensureSkill(skillName);
        await db.query(
          'INSERT INTO personnel_skills (personnel_id, skill_id) VALUES (?, ?)',
          [personnel_id, skill_id]
        );
      }
    }

    res.status(201).json({ id: personnel_id, name, email, role, experience_level, skills });
  } catch (err) {
    console.error('Error creating personnel:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update personnel
export const updatePersonnel = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, experience_level, skills } = req.body;

  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  try {
    await db.query(
      'UPDATE personnel SET name=?, email=?, role=?, experience_level=? WHERE id=?',
      [name, email, role, experience_level || '', id]
    );

    // Remove old skills
    await db.query('DELETE FROM personnel_skills WHERE personnel_id=?', [id]);

    // Insert new skills
    if (Array.isArray(skills)) {
      for (const skillName of skills) {
        const skill_id = await ensureSkill(skillName);
        await db.query(
          'INSERT INTO personnel_skills (personnel_id, skill_id) VALUES (?, ?)',
          [id, skill_id]
        );
      }
    }

    res.json({ message: 'Personnel updated' });
  } catch (err) {
    console.error('Error updating personnel:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete personnel
export const deletePersonnel = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM personnel_skills WHERE personnel_id=?', [id]);
    await db.query('DELETE FROM personnel WHERE id=?', [id]);
    res.json({ message: 'Personnel deleted' });
  } catch (err) {
    console.error('Error deleting personnel:', err);
    res.status(500).json({ error: err.message });
  }
};
