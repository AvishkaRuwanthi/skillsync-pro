import express from 'express';
import dotenv from 'dotenv';

import personnelRoutes from './routes/personnel.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import projectRoutes from './routes/project.routes.js';
import matchRoutes from './routes/match.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/personnel', personnelRoutes);
app.use('/skills', skillsRoutes);
app.use('/projects', projectRoutes);
app.use('/match', matchRoutes);


app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
