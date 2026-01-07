import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { fetchSkills, addSkill, updateSkill, deleteSkill } from "../api";

interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

const Skills: React.FC = () => {
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentSkill, setCurrentSkill] = useState<Partial<Skill>>({});

  // Load skills
  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await fetchSkills();
      setSkillsList(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
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
        await addSkill(currentSkill);
      } else if (modalType === "edit" && currentSkill.id) {
        await updateSkill(currentSkill.id, currentSkill);
      }
      await loadSkills();
      closeModal();
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      await deleteSkill(id);
      await loadSkills();
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
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skillsList.map((skill) => (
                  <tr key={skill.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{skill.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{skill.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{skill.category || <span className="text-gray-400">Uncategorized</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button title="Edit" onClick={() => openModal("edit", skill)} className="text-indigo-600 hover:text-indigo-800 p-2 rounded"><FaEdit/></button>
                      <button title="Delete" onClick={() => handleDelete(skill.id)} className="text-red-600 hover:text-red-800 p-2 rounded"><FaTrash/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <select
                aria-label="Skill category"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentSkill.category || ""}
                onChange={(e) =>
                  setCurrentSkill({ ...currentSkill, category: e.target.value })
                }
                required
              >
                <option value="">Select category</option>
                <option value="Programming Languages">Programming Languages</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Databases">Databases</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="DevOps / Deployment">DevOps / Deployment</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Testing & QA">Testing & QA</option>
                <option value="Version Control">Version Control</option>
                <option value="Other / Soft Skills">Other / Soft Skills</option>
              </select>
              <textarea
                placeholder="Description (optional)"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentSkill.description || ""}
                onChange={(e) =>
                  setCurrentSkill({ ...currentSkill, description: e.target.value })
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

export default Skills;
