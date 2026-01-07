import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FaEdit, FaTrash } from "react-icons/fa";
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
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentPersonnel, setCurrentPersonnel] = useState<Partial<Personnel>>({});

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

  const openModal = (type: "add" | "edit", person?: Personnel) => {
    setModalType(type);
    setCurrentPersonnel(person ? { ...person } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPersonnel({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...currentPersonnel,
      skills: Array.isArray(currentPersonnel.skills) ? currentPersonnel.skills : [],
    };
    try {
      if (modalType === "add") await addPersonnel(payload);
      else if (modalType === "edit" && currentPersonnel.id) await updatePersonnel(currentPersonnel.id, payload);
      await loadPersonnel();
      closeModal();
    } catch (err) {
      console.error(err);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Personnel</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={() => openModal("add")}>Add Personnel</button>
      </div>

      {loading ? (
        <p>Loading personnel...</p>
      ) : personnelList.length === 0 ? (
        <p>No personnel found.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {personnelList.map((p) => (
                  <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.skills.length ? p.skills.join(", ") : <span className="text-gray-400">No skills</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button title="Edit" onClick={() => openModal("edit", p)} className="text-indigo-600 hover:text-indigo-800 p-2 rounded"><FaEdit /></button>
                      <button title="Delete" onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 p-2 rounded"><FaTrash /></button>
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
            <h3 className="text-xl font-bold mb-4">{modalType === "add" ? "Add Personnel" : "Edit Personnel"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name" className="w-full p-2 rounded bg-gray-100 text-gray-900"
                     value={currentPersonnel.name || ""}
                     onChange={(e) => setCurrentPersonnel({ ...currentPersonnel, name: e.target.value })}
                     required />
              <input type="email" placeholder="Email" className="w-full p-2 rounded bg-gray-100 text-gray-900"
                     value={currentPersonnel.email || ""}
                     onChange={(e) => setCurrentPersonnel({ ...currentPersonnel, email: e.target.value })}
                     required />
              <input type="text" placeholder="Role" className="w-full p-2 rounded bg-gray-100 text-gray-900"
                     value={currentPersonnel.role || ""}
                     onChange={(e) => setCurrentPersonnel({ ...currentPersonnel, role: e.target.value })}
                     required />

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
              />

              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded" onClick={closeModal}>Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">{modalType === "add" ? "Add" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;
