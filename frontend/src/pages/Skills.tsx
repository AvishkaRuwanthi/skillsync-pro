// src/components/Skills.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Skill {
  id: number;
  name: string;
  level: string; // e.g., Beginner, Intermediate, Expert
}

const Skills: React.FC = () => {
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentSkill, setCurrentSkill] = useState<Partial<Skill>>({});

  const fetchSkills = async () => {
    try {
      const response = await axios.get("http://localhost:5000/skills");
      setSkillsList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openModal = (type: "add" | "edit", skill?: Skill) => {
    setModalType(type);
    setCurrentSkill(skill || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentSkill({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        await axios.post("http://localhost:5000/skills", currentSkill);
      } else if (modalType === "edit" && currentSkill.id) {
        await axios.put(
          `http://localhost:5000/skills/${currentSkill.id}`,
          currentSkill
        );
      }
      fetchSkills();
      closeModal();
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      await axios.delete(`http://localhost:5000/skills/${id}`);
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Skills</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => openModal("add")}
        >
          Add Skill
        </button>
      </div>

      {loading ? (
        <p>Loading skills...</p>
      ) : skillsList.length === 0 ? (
        <p>No skills found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-left bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Skill Name</th>
                <th className="border px-4 py-2">Level</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skillsList.map((skill) => (
                <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border px-4 py-2">{skill.id}</td>
                  <td className="border px-4 py-2">{skill.name}</td>
                  <td className="border px-4 py-2">{skill.level}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      onClick={() => openModal("edit", skill)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(skill.id)}
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
              {modalType === "add" ? "Add Skill" : "Edit Skill"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Skill Name"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentSkill.name || ""}
                onChange={(e) =>
                  setCurrentSkill({ ...currentSkill, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Level (Beginner/Intermediate/Expert)"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentSkill.level || ""}
                onChange={(e) =>
                  setCurrentSkill({ ...currentSkill, level: e.target.value })
                }
                required
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

export default Skills;
