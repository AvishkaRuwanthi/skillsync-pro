import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Routes
import personnelRoutes from './routes/personnel.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import projectRoutes from './routes/project.routes.js';
import matchRoutes from './routes/match.routes.js';
import personnelProjectRoutes from './routes/personnelProject.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('SkillSync Backend Running');
});

// API Routes
app.use('/api/personnel', personnelRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/personnel-project', personnelProjectRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
