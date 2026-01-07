// src/components/Matching.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Personnel {
  id: number;
  name: string;
  skills: string[];
}

interface Project {
  id: number;
  name: string;
  requiredSkills: string[];
}

const Matching: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [projectsRes, personnelRes] = await Promise.all([
        axios.get("http://localhost:5000/projects"),
        axios.get("http://localhost:5000/personnel"),
      ]);
      setProjects(projectsRes.data);
      setPersonnel(personnelRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const matchPersonnel = (project: Project) => {
    return personnel.filter((p) =>
      project.requiredSkills.every((skill) => p.skills.includes(skill))
    );
  };

  return (
    <div className="text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Skill Matching</h2>
      {loading ? (
        <p>Loading matching results...</p>
      ) : projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border p-4 rounded shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="mb-2">
                <strong>Required Skills:</strong> {project.requiredSkills.join(", ")}
              </p>
              <p className="font-semibold">Recommended Personnel:</p>
              {matchPersonnel(project).length > 0 ? (
                <ul className="list-disc list-inside">
                  {matchPersonnel(project).map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No personnel match this project.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matching;
