-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 11, 2026 at 03:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skillsync_pro`
--

-- --------------------------------------------------------

--
-- Table structure for table `personnel`
--

CREATE TABLE `personnel` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `experience_level` enum('Junior','Mid','Senior') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personnel`
--

INSERT INTO `personnel` (`id`, `name`, `email`, `role`, `experience_level`, `created_at`) VALUES
(8, 'Alice Johnson', 'alice@example.com', 'Software Engineer', 'Mid', '2026-01-08 04:43:02'),
(9, 'Bob Smith', 'bob@example.com', 'Backend Developer', 'Senior', '2026-01-08 04:43:02'),
(10, 'Carol Lee', 'carol@example.com', 'Frontend Developer', 'Mid', '2026-01-08 04:43:02'),
(11, 'David Miller', 'david@example.com', 'Fullstack Developer', 'Senior', '2026-01-08 04:43:02'),
(12, 'David Perera', 'david.perera@example.com', 'Mobile Developer', 'Junior', '2026-01-08 04:43:02'),
(13, 'Anne Parker', 'anne.parker@example.com', 'UI/UX Designer', 'Mid', '2026-01-08 04:43:02'),
(14, 'Kevin Watson', 'kevin.watson@example.com', 'DevOps Engineer', 'Senior', '2026-01-08 04:43:02');

-- --------------------------------------------------------

--
-- Table structure for table `personnel_projects`
--

CREATE TABLE `personnel_projects` (
  `id` int(11) NOT NULL,
  `personnel_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personnel_projects`
--

INSERT INTO `personnel_projects` (`id`, `personnel_id`, `project_id`, `start_date`, `end_date`) VALUES
(4, 8, 7, '2026-01-08', '2026-02-07'),
(5, 9, 8, '2026-01-08', '2026-02-07');

-- --------------------------------------------------------

--
-- Table structure for table `personnel_skills`
--

CREATE TABLE `personnel_skills` (
  `id` int(11) NOT NULL,
  `personnel_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `proficiency` enum('Beginner','Intermediate','Advanced','Expert') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personnel_skills`
--

INSERT INTO `personnel_skills` (`id`, `personnel_id`, `skill_id`, `proficiency`) VALUES
(26, 8, 20, 'Advanced'),
(27, 8, 22, 'Expert'),
(28, 8, 28, 'Advanced'),
(29, 8, 29, 'Advanced'),
(30, 8, 38, 'Advanced'),
(31, 8, 47, 'Intermediate'),
(32, 8, 64, 'Intermediate'),
(40, 10, 20, 'Advanced'),
(41, 10, 28, 'Advanced'),
(42, 10, 29, 'Advanced'),
(43, 10, 30, 'Intermediate'),
(44, 10, 31, 'Intermediate'),
(45, 10, 52, 'Intermediate'),
(46, 10, 53, 'Intermediate'),
(47, 11, 20, 'Expert'),
(48, 11, 28, 'Advanced'),
(49, 11, 29, 'Advanced'),
(50, 11, 32, 'Advanced'),
(51, 11, 33, 'Expert'),
(52, 11, 38, 'Advanced'),
(53, 11, 47, 'Advanced'),
(54, 12, 20, 'Advanced'),
(55, 12, 32, 'Advanced'),
(56, 12, 33, 'Intermediate'),
(57, 13, 52, 'Expert'),
(58, 13, 53, 'Advanced'),
(59, 13, 54, 'Advanced'),
(60, 13, 55, 'Intermediate'),
(64, 14, 46, 'Advanced'),
(65, 14, 47, 'Expert'),
(66, 14, 48, 'Advanced'),
(67, 14, 49, 'Intermediate'),
(68, 14, 50, 'Intermediate'),
(69, 14, 51, 'Intermediate'),
(71, 8, 52, 'Intermediate'),
(75, 11, 28, 'Intermediate'),
(76, 11, 29, 'Intermediate'),
(77, 11, 34, 'Intermediate'),
(78, 11, 46, 'Intermediate'),
(98, 9, 20, 'Advanced'),
(99, 9, 32, 'Expert'),
(100, 9, 33, 'Advanced'),
(101, 9, 47, 'Advanced'),
(102, 9, 52, 'Advanced'),
(103, 9, 26, 'Advanced'),
(104, 9, 28, 'Expert'),
(105, 9, 29, 'Advanced'),
(106, 9, 31, 'Advanced');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('Planning','Active','Completed') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(7, 'Student Management System Upgrade', 'Enhance an existing student management system by adding role-based access, advanced search, reporting, and improved UI/UX.', '2026-02-01', '2026-05-15', 'Active', '2026-01-08 04:31:43'),
(8, 'Cross-Platform Mobile App Development', 'Develop a mobile application for appointment management and notifications, compatible with Android and iOS devices.', '2026-03-01', '2026-06-30', 'Planning', '2026-01-08 04:31:43'),
(9, 'E-Commerce Platform Optimization', 'Upgrade an existing e-commerce platform with performance improvements, secure payment integration, and enhanced frontend responsiveness.', '2026-01-15', '2026-04-30', 'Completed', '2026-01-08 04:31:43');

-- --------------------------------------------------------

--
-- Table structure for table `project_skills`
--

CREATE TABLE `project_skills` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `min_proficiency` enum('Beginner','Intermediate','Advanced','Expert') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_skills`
--

INSERT INTO `project_skills` (`id`, `project_id`, `skill_id`, `min_proficiency`) VALUES
(22, 7, 20, 'Advanced'),
(23, 7, 22, 'Expert'),
(24, 7, 28, 'Advanced'),
(25, 7, 29, 'Advanced'),
(26, 7, 38, 'Advanced'),
(27, 7, 47, 'Intermediate'),
(28, 7, 52, 'Intermediate'),
(29, 7, 64, 'Intermediate'),
(37, 8, 20, 'Advanced'),
(38, 8, 32, 'Expert'),
(39, 8, 33, 'Advanced'),
(40, 8, 47, 'Intermediate'),
(41, 8, 52, 'Intermediate'),
(44, 9, 20, 'Advanced'),
(45, 9, 28, 'Advanced'),
(46, 9, 29, 'Advanced'),
(47, 9, 33, 'Expert'),
(48, 9, 34, 'Expert'),
(49, 9, 38, 'Advanced'),
(50, 9, 46, 'Intermediate'),
(51, 9, 47, 'Intermediate');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `name`, `category`, `description`) VALUES
(20, 'JavaScript', 'Programming Languages', 'Widely used language for web development'),
(21, 'TypeScript', 'Programming Languages', 'Typed superset of JavaScript'),
(22, 'PHP', 'Programming Languages', 'Server-side scripting language'),
(23, 'Python', 'Programming Languages', 'General-purpose programming language'),
(24, 'Java', 'Programming Languages', 'Object-oriented programming language'),
(25, 'C#', 'Programming Languages', 'Language for .NET and enterprise applications'),
(26, 'React.js', 'Frontend Development', 'JavaScript library for building user interfaces'),
(27, 'Next.js', 'Frontend Development', 'React framework with server-side rendering'),
(28, 'HTML', 'Frontend Development', 'Markup language for structuring web content'),
(29, 'CSS', 'Frontend Development', 'Styling language for web pages'),
(30, 'Bootstrap', 'Frontend Development', 'CSS framework for responsive design'),
(31, 'Tailwind CSS', 'Frontend Development', 'Utility-first CSS framework'),
(32, 'React Native', 'Frontend Development', 'Framework for building mobile apps using React'),
(33, 'Node.js', 'Backend Development', 'JavaScript runtime for server-side development'),
(34, 'Express.js', 'Backend Development', 'Web framework for Node.js'),
(35, 'Laravel', 'Backend Development', 'PHP framework for web applications'),
(36, 'Django', 'Backend Development', 'Python-based web framework'),
(37, 'Spring Boot', 'Backend Development', 'Java-based backend framework'),
(38, 'MySQL', 'Databases', 'Relational database management system'),
(39, 'PostgreSQL', 'Databases', 'Advanced open-source relational database'),
(40, 'MongoDB', 'Databases', 'NoSQL document-oriented database'),
(41, 'Firebase', 'Databases', 'Backend-as-a-Service platform'),
(42, 'Supabase', 'Databases', 'Open-source Firebase alternative'),
(43, 'Flutter', 'Mobile Development', 'Cross-platform UI toolkit by Google'),
(44, 'Android SDK', 'Mobile Development', 'Tools for Android app development'),
(45, 'iOS Swift', 'Mobile Development', 'Swift language for iOS development'),
(46, 'Docker', 'DevOps / Deployment', 'Containerization platform'),
(47, 'Git', 'DevOps / Deployment', 'Version control system'),
(48, 'CI/CD', 'DevOps / Deployment', 'Continuous Integration and Deployment'),
(49, 'AWS', 'DevOps / Deployment', 'Cloud computing services'),
(50, 'Heroku', 'DevOps / Deployment', 'Cloud platform for app deployment'),
(51, 'Netlify', 'DevOps / Deployment', 'Platform for deploying frontend applications'),
(52, 'Figma', 'UI/UX Design', 'UI/UX design and prototyping tool'),
(53, 'Adobe XD', 'UI/UX Design', 'Design tool for user experiences'),
(54, 'Wireframing', 'UI/UX Design', 'Low-fidelity design structure'),
(55, 'Responsive Design', 'UI/UX Design', 'Design approach for multiple screen sizes'),
(56, 'Jest', 'Testing & QA', 'JavaScript testing framework'),
(57, 'Cypress', 'Testing & QA', 'End-to-end testing framework'),
(58, 'Selenium', 'Testing & QA', 'Automated browser testing tool'),
(59, 'Unit Testing', 'Testing & QA', 'Testing individual components'),
(60, 'Integration Testing', 'Testing & QA', 'Testing interactions between components'),
(61, 'GitHub', 'Version Control', 'Git-based code hosting platform'),
(62, 'Bitbucket', 'Version Control', 'Repository hosting by Atlassian'),
(63, 'Sourcetree', 'Version Control', 'Git GUI client'),
(64, 'Agile/Scrum', 'Other / Soft Skills', 'Agile project management methodology'),
(65, 'Communication', 'Other / Soft Skills', 'Effective communication skills'),
(66, 'Problem Solving', 'Other / Soft Skills', 'Analytical and logical thinking'),
(67, 'Project Management', 'Other / Soft Skills', 'Planning and managing projects');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `personnel`
--
ALTER TABLE `personnel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `personnel_projects`
--
ALTER TABLE `personnel_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `personnel_skills`
--
ALTER TABLE `personnel_skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_skills`
--
ALTER TABLE `project_skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `personnel`
--
ALTER TABLE `personnel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `personnel_projects`
--
ALTER TABLE `personnel_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `personnel_skills`
--
ALTER TABLE `personnel_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `project_skills`
--
ALTER TABLE `project_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `personnel_projects`
--
ALTER TABLE `personnel_projects`
  ADD CONSTRAINT `personnel_projects_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `personnel_projects_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `personnel_skills`
--
ALTER TABLE `personnel_skills`
  ADD CONSTRAINT `personnel_skills_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `personnel_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_skills`
--
ALTER TABLE `project_skills`
  ADD CONSTRAINT `project_skills_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
