# skillsync-pro
A full-stack web application for a small consultancy or tech agency to manage personnel skills and match them to project requirements. This system will help track who has what skills and suggest the best team members for upcoming projects.



Additional Feature: Personnel Availability Check

To enhance the project assignment and matching system, an availability check feature has been implemented. This ensures that when suggesting personnel for a project, users can immediately see who is currently available to take on new assignments.

How It Works:
    Every personnel’s current project assignments are checked against the project’s start and end dates.
    When retrieving project matches, each personnel record now includes an available field:
        true → Personnel is free to take on the project.
        false → Personnel is already assigned to another project during the project timeline.
    This feature allows project managers to make informed decisions while still showing highly skilled personnel even if they are partially unavailable.
    Personnel are also filtered by match percentage (minimum 50%) so that only relevant candidates appear in the matching results.

Benefits:
    Prevents overbooking personnel and avoids schedule conflicts.
    Saves time by highlighting personnel who can immediately contribute.
    Improves resource planning and project execution efficiency.
