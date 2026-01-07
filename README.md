
Skillsync-pro
Project Description
The Skills & Resource Management System is a full-stack web application developed to help organizations manage personnel skills and efficiently match employees to project requirements.
The system allows administrators to maintain personnel profiles, define skill sets, create projects with required skills, and identify the best-matched personnel for each project based on skill proficiency.
This project was developed as part of an internship / academic assignment to demonstrate full-stack development skills.

Technology Stack
    Frontend
    •	React.js
    •	Vite
    •	Tailwind CSS
    •	TypeScript
    Backend
    •	Node.js
    •	Express.js
    Database
    •	MySQL

Prerequisites
Before running this project, ensure you have the following installed:
•	Node.js: v18.x or later
•	npm: v9.x or later (comes with Node.js)
•	MySQL: v8.0 or later

How to Run the Application
1. Clone the Repository
    git clone <repository-url>
    cd skillsync-pro

2. Backend Setup
    cd backend
    npm install

Configure Environment Variables
Create a .env file in the backend folder and add:
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=skillsync_db

Start the Backend Server
    npm run dev
    The backend will run at:
    http://localhost:5000

3. Frontend Setup
    cd frontend
    npm install
Start the Frontend Application
    npm run dev
    The frontend will run at:
    http://localhost:5173

4. Database Setup
•	Create a MySQL database named skillsync_db
•	Import the provided SQL file

Additional Feature: Personnel Availability Check

To enhance the project assignment and matching system, an availability check feature has been implemented. This ensures that when suggesting personnel for a project, users can immediately see who is currently available to take on new assignments.

How It Works:
    Every personnelâ€™s current project assignments are checked against the projectâ€™s start and end dates.
    When retrieving project matches, each personnel record now includes an available field:
        true â†’ Personnel is free to take on the project.
        false â†’ Personnel is already assigned to another project during the project timeline.
    This feature allows project managers to make informed decisions while still showing highly skilled personnel even if they are partially unavailable.
    Personnel are also filtered by match percentage (minimum 50%) so that only relevant candidates appear in the matching results.

Benefits:
    Prevents overbooking personnel and avoids schedule conflicts.
    Saves time by highlighting personnel who can immediately contribute. Improves resource planning and project execution efficiency.


Notes
•	Ensure the backend server is running before accessing the frontend.
•	Update API base URLs if ports are changed.
•	Screenshots and additional documentation can be found in the repository

