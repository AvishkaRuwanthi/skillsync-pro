import express from 'express';
import {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    assignSkillsToProject,
    getMatchingPersonnel
} from '../controllers/project.controller.js';

const router = express.Router();

// CRUD
router.get('/', getAllProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Assign required skills
router.post('/assign-skills', assignSkillsToProject);

// Get matching personnel
router.get('/:project_id/match', getMatchingPersonnel);

export default router;
