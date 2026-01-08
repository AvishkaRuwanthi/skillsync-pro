import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { fetchPersonnel, addPersonnel, updatePersonnel, deletePersonnel } from "../api";

interface Personnel {
  id: number;
  name: string;
  email: string;
  role: string;
  skills: string[];
}

const Personnel: React.FC = () => {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentPersonnel, setCurrentPersonnel] = useState<Partial<Personnel>>({});
  const [modalError, setModalError] = useState<string | null>(null);

  // Load personnel
  const loadPersonnel = async () => {
    setLoading(true);
    try {
      const data = await fetchPersonnel();
      const sanitized = data.map((p: any) => ({
        ...p,
        skills: Array.isArray(p.skills) ? p.skills : [],
      }));
      setPersonnelList(sanitized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load all skills for multi-select
  const loadSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      const skills = (await res.json()).map((s: any) => s.name);
      setAllSkills(skills);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPersonnel();
    loadSkills();
  }, []);

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(personnelList.map(p => p.role).filter(Boolean)));

  // Filter and search personnel
  const displayedPersonnel = personnelList.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' || 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.role && p.role.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'All' || (p.role === roleFilter);
    return matchesSearch && matchesRole;
  });

  const openModal = (type: "add" | "edit", person?: Personnel) => {
    setModalType(type);
    setCurrentPersonnel(person ? { ...person } : {});
    setShowModal(true);
    setModalError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPersonnel({});
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const payload = {
      ...currentPersonnel,
      skills: Array.isArray(currentPersonnel.skills) ? currentPersonnel.skills : [],
    };
    try {
      if (modalType === "add") await addPersonnel(payload);
      else if (modalType === "edit" && currentPersonnel.id) await updatePersonnel(currentPersonnel.id, payload);
      await loadPersonnel();
      closeModal();
    } catch (err: any) {
      console.error(err);
      setModalError(err?.message || "An error occurred while saving personnel");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this personnel?")) return;
    try {
      await deletePersonnel(id);
      await loadPersonnel();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Personnel</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors" 
          onClick={() => openModal("add")}
        >
          Add Personnel
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Loading personnel...</p>
        </div>
      ) : personnelList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No personnel found.</p>
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
                    placeholder="Search personnel..." 
                    className="bg-transparent focus:outline-none w-full text-sm" 
                  />
                </div>
                <select 
                  value={roleFilter} 
                  onChange={e=>setRoleFilter(e.target.value)} 
                  className="px-3 py-1.5 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" 
                  title="Filter personnel by role"
                >
                  <option value="All">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Skills</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedPersonnel.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors align-top">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{p.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{p.email}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {p.role || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {p.skills && p.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {p.skills.map((skill, idx) => (
                              <div key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs">
                                {skill}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No skills</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            title="Edit" 
                            onClick={() => openModal("edit", p)} 
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            title="Delete" 
                            onClick={() => handleDelete(p.id)} 
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                          >
                            <FaTrash />
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
                {modalType === "add" ? "Add Personnel" : "Edit Personnel"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  placeholder="Enter name" 
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={currentPersonnel.name || ""}
                  onChange={(e) => setCurrentPersonnel({ ...currentPersonnel, name: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="Enter email" 
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={currentPersonnel.email || ""}
                  onChange={(e) => setCurrentPersonnel({ ...currentPersonnel, email: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input 
                  type="text" 
                  placeholder="Enter role" 
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={currentPersonnel.role || ""}
                  onChange={(e) => setCurrentPersonnel({ ...currentPersonnel, role: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <CreatableSelect
                  isMulti
                  options={allSkills.map(s => ({ value: s, label: s }))}
                  value={(currentPersonnel.skills || []).map(s => ({ value: s, label: s }))}
                  onChange={opts => setCurrentPersonnel({ ...currentPersonnel, skills: opts.map(o => o.value) })}
                  onCreateOption={newSkill => {
                    setAllSkills(prev => [...prev, newSkill]);
                    setCurrentPersonnel({ ...currentPersonnel, skills: [...(currentPersonnel.skills || []), newSkill] });
                  }}
                  placeholder="Select or create skills..."
                  className="text-gray-900"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      minHeight: '42px',
                      '&:hover': {
                        borderColor: '#d1d5db',
                      },
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#eef2ff',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#4f46e5',
                    }),
                  }}
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

export default Personnel;
