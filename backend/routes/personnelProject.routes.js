import express from 'express';
import { assignPersonnelToProject } from '../controllers/personnelProject.controller.js';

const router = express.Router();

router.post('/', assignPersonnelToProject);

export default router;
