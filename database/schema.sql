-- Active: 1752471218644@@13.234.242.165@3306@a1
CREATE DATABASE skillsync_pro;
USE skillsync_pro;

-- Personnel
CREATE TABLE personnel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(100),
  experience_level ENUM('Junior','Mid','Senior'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT
);

-- Personnel Skills
CREATE TABLE personnel_skills (
  personnel_id INT,
  skill_id INT,
  proficiency INT CHECK (proficiency BETWEEN 1 AND 4),
  PRIMARY KEY (personnel_id, skill_id),
  FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Projects
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('Planning','Active','Completed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Required Skills
CREATE TABLE project_skills (
  project_id INT,
  skill_id INT,
  min_proficiency INT CHECK (min_proficiency BETWEEN 1 AND 4),
  PRIMARY KEY (project_id, skill_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE personnel_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personnel_id INT NOT NULL,
  project_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (personnel_id, project_id)
);