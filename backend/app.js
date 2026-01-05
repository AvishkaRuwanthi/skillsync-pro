import express from 'express';
import dotenv from 'dotenv';
import personnelRoutes from './routes/personnel.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import projectRoutes from './routes/project.routes.js';

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use('/personnel', personnelRoutes);
app.use('/skills', skillsRoutes);
app.use('/projects', projectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
