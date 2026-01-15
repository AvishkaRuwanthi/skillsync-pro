import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { fetchPersonnel, addPersonnel, updatePersonnel, deletePersonnel, fetchPersonnelSkills } from "../api";

interface Personnel {
  id: number;
  name: string;
  email: string;
  role: string;
  skills: Array<string | { name?: string; proficiency?: string | undefined }>;
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

  // Load all skills
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

  const uniqueRoles = Array.from(new Set(personnelList.map(p => p.role).filter(Boolean)));

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

  useEffect(() => {
    let mounted = true;
    const loadSkillsForEdit = async () => {
      if (!showModal || modalType !== 'edit' || !currentPersonnel || !currentPersonnel.id) return;
      try {
        const rows = await fetchPersonnelSkills(currentPersonnel.id as number);
        if (!mounted) return;
        const normalized = Array.isArray(rows) ? rows.map((r:any) => ({ name: r.skill_name, proficiency: r.proficiency })) : [];
        setCurrentPersonnel(cp => ({ ...(cp||{}), skills: normalized }));
      } catch (err) {
        console.error('Error loading personnel skills for edit', err);
      }
    };
    loadSkillsForEdit();
    return () => { mounted = false };
  }, [showModal, modalType, currentPersonnel && (currentPersonnel as any).id]);

  const closeModal = () => {
    setShowModal(false);
    setCurrentPersonnel({});
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const normalizedSkills = (Array.isArray(currentPersonnel.skills) ? currentPersonnel.skills : []).map((s:any) => {
      if (typeof s === 'string') return { name: s, proficiency: undefined };
      if (typeof s === 'object' && s !== null) return { name: s.name || s.skill_name || s.value || '', proficiency: s.proficiency || undefined };
      return null;
    }).filter(Boolean);

    const payload = { ...currentPersonnel, skills: normalizedSkills };
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Personnel Management</h1>
        <button onClick={() => openModal("add")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
          + Add Personnel
        </button>
      </div>

      <div className="space-y-4">
        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 shadow-sm flex-1 min-w-0">
                <FaSearch className="text-gray-400 mr-3 flex-shrink-0"/>
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  className="bg-transparent focus:outline-none w-full text-sm" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="All">All Roles</option>
                {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : displayedPersonnel.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No personnel found</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Skills</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedPersonnel.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{p.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{p.role}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(p.skills) && p.skills.map((s:any, idx:number) => {
                        const name = typeof s === 'string' ? s : (s.name || s.value || '');
                        const prof = typeof s === 'string' ? '' : (s.proficiency || '');
                        return <span key={name+idx} className="px-2 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs">{name} {prof && `(${prof})`}</span>;
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-1 justify-end">
                    <button title="Edit" onClick={() => openModal("edit", p)} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded transition-colors"><FaEdit /></button>
                    <button title="Delete" onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{modalType === "add" ? "Add Personnel" : "Edit Personnel"}</h3>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" placeholder="Enter name" value={currentPersonnel.name||""} onChange={e=>setCurrentPersonnel({...currentPersonnel, name:e.target.value})} className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required/>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" placeholder="Enter email" value={currentPersonnel.email||""} onChange={e=>setCurrentPersonnel({...currentPersonnel, email:e.target.value})} className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required/>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input type="text" placeholder="Enter role" value={currentPersonnel.role||""} onChange={e=>setCurrentPersonnel({...currentPersonnel, role:e.target.value})} className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required/>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <CreatableSelect
                  isMulti
                  options={allSkills.map(s=>({value:s,label:s}))}
                  value={(currentPersonnel.skills||[]).map((s:any)=>({value:(typeof s==='string'?s:(s.name||s.value)),label:(typeof s==='string'?s:(s.name||s.value))}))}
                  onChange={opts=>{
                    const selected = opts.map((o:any)=>o.value);
                    const cur = Array.isArray(currentPersonnel.skills)?currentPersonnel.skills:[];
                    const merged = selected.map((name:any)=>{
                      const found = cur.find((c:any)=>typeof c==='string'?c===name:c.name===name);
                      if(found) return typeof found==='string'?{name:found, proficiency:undefined}:{name:found.name, proficiency:found.proficiency||undefined};
                      return {name, proficiency:undefined};
                    });
                    setCurrentPersonnel({...currentPersonnel, skills:merged});
                  }}
                  onCreateOption={newSkill=>{
                    setAllSkills(prev=>[...prev,newSkill]);
                    const cur = Array.isArray(currentPersonnel.skills)?currentPersonnel.skills:[];
                    setCurrentPersonnel({...currentPersonnel, skills:[...cur,{name:newSkill, proficiency:undefined}]});
                  }}
                  placeholder="Select or create skills..."
                  styles={{
                    control: base=>({...base,borderColor:'#d1d5db',minHeight:'42px','&:hover':{borderColor:'#d1d5db'}}),
                    multiValue: base=>({...base,backgroundColor:'#eef2ff'}),
                    multiValueLabel: base=>({...base,color:'#4f46e5'})
                  }}
                />

                {/* Skill proficiency selectors */}
                {(currentPersonnel.skills && currentPersonnel.skills.length>0) && (
                  <div className="border border-gray-300 rounded p-1 mt-3 max-h-32 overflow-y-auto grid grid-cols-2 gap-2">
                    {currentPersonnel.skills.map((s:any, idx:number)=>{
                      const name = typeof s==='string'?s:(s.name||s.value||'');
                      const prof = typeof s==='string'?undefined:(s.proficiency||undefined);
                      return (
                        <div key={name+idx} className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs flex-shrink-0">{name}</div>
                          <select
                          aria-label={`Proficiency level for ${name}`}
                          className="h-[30px] px-2 py-1 text-sm border border-gray-200 rounded flex-1"
                          value={prof || ''}
                          onChange={e => {
                            const val = e.target.value || undefined;
                            const cur = Array.isArray(currentPersonnel.skills) ? [...currentPersonnel.skills] : [];
                            cur[idx] = { name, proficiency: val };
                            setCurrentPersonnel({ ...currentPersonnel, skills: cur });
                          }}
                          >
                            <option value="">(no proficiency)</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <button type="button" className="text-sm text-red-600 px-2 flex-shrink-0" onClick={()=>{
                            const cur = Array.isArray(currentPersonnel.skills)?[...currentPersonnel.skills]:[];
                            cur.splice(idx,1);
                            setCurrentPersonnel({...currentPersonnel, skills:cur});
                          }}>Remove</button>
                        </div>
                      )
                    })}
                  </div>
                )}

              </div>

              {modalError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{modalError}</div>}

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">{modalType==="add"?"Add":"Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Personnel;
