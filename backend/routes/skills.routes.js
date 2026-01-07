import express from 'express';
import {
    getAllSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    assignSkillToPersonnel,
    getPersonnelSkills
} from '../controllers/skills.controller.js';

const router = express.Router();

// Get all skills
router.get('/', getAllSkills);

// CRUD
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

// Assign skill to personnel
router.post('/assign', assignSkillToPersonnel);

// Get personnel skills
router.get('/personnel/:personnel_id', getPersonnelSkills);

export default router;
