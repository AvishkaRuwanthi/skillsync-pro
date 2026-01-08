import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentSkill, setCurrentSkill] = useState<Partial<Skill>>({});
  const [modalError, setModalError] = useState<string | null>(null);

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

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(skillsList.map(s => s.category).filter(Boolean)));

  // Filter and search skills
  const displayedSkills = skillsList.filter(s => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' || 
      (s.name && s.name.toLowerCase().includes(q)) || 
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === 'All' || (s.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const openModal = (type: "add" | "edit", skill?: Skill) => {
    setModalType(type);
    setCurrentSkill(skill || {});
    setShowModal(true);
    setModalError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentSkill({});
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      if (modalType === "add") {
        await addSkill(currentSkill);
      } else if (modalType === "edit" && currentSkill.id) {
        await updateSkill(currentSkill.id, currentSkill);
      }
      await loadSkills();
      closeModal();
    } catch (error: any) {
      console.error("Error saving skill:", error);
      setModalError(error?.message || "An error occurred while saving skill");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Skills</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          onClick={() => openModal("add")}
        >
          Add Skill
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Loading skills...</p>
        </div>
      ) : skillsList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No skills found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 shadow-sm flex-1 min-w-0">
                  <FaSearch className="text-gray-400 mr-3 flex-shrink-0" />
                  <input 
                    value={searchQuery} 
                    onChange={e=>setSearchQuery(e.target.value)} 
                    placeholder="Search skills..." 
                    className="bg-transparent focus:outline-none w-full text-sm" 
                  />
                </div>
                <select 
                  value={categoryFilter} 
                  onChange={e=>setCategoryFilter(e.target.value)} 
                  className="px-3 py-1.5 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" 
                  title="Filter skills by category"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedSkills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-gray-50 transition-colors align-top">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{skill.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {skill.category ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {skill.category}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="max-w-md" title={skill.description}>
                          {skill.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            title="Edit" 
                            onClick={() => openModal("edit", skill)} 
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded transition-colors"
                          >
                            <FaEdit/>
                          </button>
                          <button 
                            title="Delete" 
                            onClick={() => handleDelete(skill.id)} 
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                          >
                            <FaTrash/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === "add" ? "Add Skill" : "Edit Skill"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="Enter skill name"
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={currentSkill.name || ""}
                  onChange={(e) =>
                    setCurrentSkill({ ...currentSkill, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  title="Category"
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  placeholder="Enter skill description"
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                  value={currentSkill.description || ""}
                  onChange={(e) =>
                    setCurrentSkill({ ...currentSkill, description: e.target.value })
                  }
                />
              </div>
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {modalError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
