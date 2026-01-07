// src/components/Projects.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Project {
  id: number;
  name: string;
  description: string;
  requiredSkills: string[];
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/projects");
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openModal = (type: "add" | "edit", project?: Project) => {
    setModalType(type);
    setCurrentProject(project || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProject({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        await axios.post("http://localhost:5000/projects", currentProject);
      } else if (modalType === "edit" && currentProject.id) {
        await axios.put(
          `http://localhost:5000/projects/${currentProject.id}`,
          currentProject
        );
      }
      fetchProjects();
      closeModal();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`http://localhost:5000/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => openModal("add")}
        >
          Add Project
        </button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-left bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Required Skills</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border px-4 py-2">{proj.id}</td>
                  <td className="border px-4 py-2">{proj.name}</td>
                  <td className="border px-4 py-2">{proj.description}</td>
                  <td className="border px-4 py-2">{proj.requiredSkills.join(", ")}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      onClick={() => openModal("edit", proj)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(proj.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {modalType === "add" ? "Add Project" : "Edit Project"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Project Name"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentProject.name || ""}
                onChange={(e) =>
                  setCurrentProject({ ...currentProject, name: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentProject.description || ""}
                onChange={(e) =>
                  setCurrentProject({ ...currentProject, description: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Required Skills (comma separated)"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentProject.requiredSkills?.join(", ") || ""}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
                    requiredSkills: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {modalType === "add" ? "Add" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
