import express from 'express';
import { assignPersonnelToProject, removePersonnelFromProject } from '../controllers/personnelProject.controller.js';

const router = express.Router();

// POST: Assign a personnel to a project
router.post('/', assignPersonnelToProject);

// DELETE: Remove a personnel from a project
router.delete('/', removePersonnelFromProject);

export default router;
