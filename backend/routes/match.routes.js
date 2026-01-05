import express from 'express';
import { getProjectMatches } from '../controllers/match.controller.js';

const router = express.Router();
router.get('/project/:projectId', getProjectMatches);

export default router;
