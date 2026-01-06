import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import personnelRoutes from './routes/personnel.routes.js';
import skillRoutes from './routes/skills.routes.js';
import projectRoutes from './routes/project.routes.js';
import matchRoutes from './routes/match.routes.js';
import personnelProjectRoutes from './routes/personnelProject.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/personnel', personnelRoutes);
app.use('/skills', skillRoutes);
app.use('/projects', projectRoutes);
app.use('/api/match', matchRoutes);
app.use('/personnel-project', personnelProjectRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('SkillSync Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
