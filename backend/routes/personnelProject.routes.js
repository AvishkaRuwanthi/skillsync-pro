import express from 'express';
import { assignPersonnelToProject } from '../controllers/personnelProject.controller.js';

const router = express.Router();

// POST: Assign a personnel to a project
router.post('/', assignPersonnelToProject);

export default router;
