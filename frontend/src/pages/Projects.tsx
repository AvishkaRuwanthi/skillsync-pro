import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { fetchProjects, addProject, updateProject, deleteProject, fetchSkills } from "../api";

interface Project {
  id: number;
  name: string;
  description: string;
  requiredSkills: any[];
  assignedPersonnel?: { id: number; name: string; role?: string; start_date?: string; end_date?: string }[];
  start_date?: string;
  end_date?: string;
  status?: string;
  created_at?: string;
}

const proficiencyLabel = (n: number | string | undefined) => {
  const v = Number(n);
  if (v === 1) return 'Beginner';
  if (v === 2) return 'Intermediate';
  if (v === 3) return 'Advanced';
  if (v === 4) return 'Expert';
  return String(n || 'N/A');
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<'created'|'start'|'name'>('created');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});

  // Load projects from API
  const loadProjects = async () => {
    setLoading(true);
      try {
        const data = await fetchProjects();
        // Sanitize data: ensure requiredSkills is always an array of objects {skill_name, min_proficiency}
        const sanitized = data.map((p: any) => ({
          ...p,
          requiredSkills: Array.isArray(p.requiredSkills)
            ? p.requiredSkills.map((rs: any) => (typeof rs === 'string' ? { skill_name: rs, min_proficiency: 1 } : rs))
            : [],
          assignedPersonnel: Array.isArray(p.assignedPersonnel) ? p.assignedPersonnel : [],
        }));
        setProjects(sanitized);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // load skills for modal
    (async () => {
      try {
        const sk = await fetchSkills();
        setSkillsList(sk || []);
      } catch (err) {
        console.error('Error loading skills:', err);
      }
    })();
  }, []);

  const displayedProjects = projects.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' || (p.name && p.name.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All' || (p.status === statusFilter);
    return matchesSearch && matchesStatus;
  }).sort((a,b)=>{
    if (sortKey === 'created') {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDir === 'asc' ? ta - tb : tb - ta;
    }
    if (sortKey === 'start') {
      const ta = a.start_date ? new Date(a.start_date).getTime() : 0;
      const tb = b.start_date ? new Date(b.start_date).getTime() : 0;
      return sortDir === 'asc' ? ta - tb : tb - ta;
    }
    const na = (a.name||'').toLowerCase();
    const nb = (b.name||'').toLowerCase();
    return sortDir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
  });

  const openModal = (type: "add" | "edit", project?: Project) => {
    setModalType(type);
    // Ensure requiredSkills is an array of objects { skill_id, skill_name, min_proficiency }
    if (project) {
      const normalized = (project.requiredSkills || []).map((rs: any) => {
        if (typeof rs === 'string') return { skill_name: rs, min_proficiency: 1 };
        return { skill_id: rs.skill_id || rs.id || null, skill_name: rs.skill_name || rs.name || rs.skill || null, min_proficiency: rs.min_proficiency || rs.min || 1 };
      });
      setCurrentProject({ ...project, requiredSkills: normalized });
    } else {
      setCurrentProject({ status: 'Planning', requiredSkills: [] });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProject({});
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate dates
    setModalError(null);
    if (currentProject.start_date && currentProject.end_date) {
      const s = new Date(currentProject.start_date);
      const t = new Date(currentProject.end_date);
      if (s > t) {
        setModalError('Start date must be before or equal to end date');
        return;
      }
    }
    try {
      if (modalType === "add") {
        // send structured requiredSkills (skill_id/skill_name + min_proficiency)
        await addProject(currentProject);
      } else if (modalType === "edit" && currentProject.id) {
        await updateProject(currentProject.id, currentProject);
      }
      await loadProjects();
      closeModal();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      await loadProjects();
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
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-2">
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search projects..." className="px-3 py-1 border rounded w-64" />
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-2 py-1 border rounded" title="Filter projects by status">
                <option value="All">All Statuses</option>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select value={sortKey} onChange={e=>setSortKey(e.target.value as any)} className="px-2 py-1 border rounded" title="Sort projects by">
                <option value="created">Created</option>
                <option value="start">Start Date</option>
                <option value="name">Name</option>
              </select>
              <button onClick={()=>setSortDir(d=> d==='asc' ? 'desc' : 'asc')} className="px-2 py-1 border rounded">{sortDir==='asc' ? '↑' : '↓'}</button>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Required Skills (Min)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedProjects.map((proj) => (
                  <tr key={proj.id} className="odd:bg-white even:bg-gray-50 align-top">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{proj.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proj.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                      <div className="truncate max-w-md" title={proj.description}>{proj.description || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{proj.start_date ? new Date(proj.start_date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{proj.end_date ? new Date(proj.end_date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{proj.status || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{proj.created_at ? new Date(proj.created_at).toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {proj.requiredSkills && proj.requiredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {proj.requiredSkills.map((s: any, idx: number) => (
                            <div key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-800 rounded-full text-sm">{s.skill_name} <span className="ml-1 text-xs text-indigo-600">({s.min_proficiency})</span></div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No skills</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button title="Edit" onClick={() => openModal("edit", proj)} className="text-indigo-600 hover:text-indigo-800 p-2 rounded"><FaEdit/></button>
                      <button title="Delete" onClick={() => handleDelete(proj.id)} className="text-red-600 hover:text-red-800 p-2 rounded"><FaTrash/></button>
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
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-sm text-gray-600">Start Date</label>
                  <input type="date" className="w-full p-2 rounded bg-gray-100" title="Start Date" value={currentProject.start_date || ''} onChange={e=> setCurrentProject({...currentProject, start_date: e.target.value})} />
                </div>
                <div className="w-1/2">
                  <label className="text-sm text-gray-600">End Date</label>
                  <input type="date" className="w-full p-2 rounded bg-gray-100" title="End Date" value={currentProject.end_date || ''} onChange={e=> setCurrentProject({...currentProject, end_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select className="w-full p-2 rounded bg-gray-100" title="Select project status" value={currentProject.status || 'Planning'} onChange={e=> setCurrentProject({...currentProject, status: e.target.value})}>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              {modalError && <div className="text-sm text-red-600">{modalError}</div>}
              <div>
                <div className="text-sm text-gray-600 mb-2">Select required skills and set minimum proficiency</div>
                <div className="border rounded p-2 max-h-48 overflow-auto">
                  {skillsList.length === 0 ? (
                    <div className="text-sm text-gray-500">No skills available</div>
                  ) : (
                    skillsList.map((sk: any) => {
                      const selected = (currentProject.requiredSkills || []).find((rs: any) => (rs.skill_id ? String(rs.skill_id) === String(sk.id) : rs.skill_name === sk.name));
                      const minVal = selected ? (selected.min_proficiency || 1) : 1;
                      return (
                        <label key={sk.id} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={!!selected} onChange={(e)=>{
                              const checked = e.target.checked;
                              const cur = Array.isArray(currentProject.requiredSkills) ? [...currentProject.requiredSkills] : [];
                              if (checked) {
                                cur.push({ skill_id: sk.id, skill_name: sk.name, min_proficiency: 1 });
                              } else {
                                const idx = cur.findIndex((c:any)=> (c.skill_id? String(c.skill_id)===String(sk.id) : c.skill_name===sk.name));
                                if (idx>=0) cur.splice(idx,1);
                              }
                              setCurrentProject({ ...currentProject, requiredSkills: cur });
                            }} />
                            <span className="text-sm text-gray-800">{sk.name}</span>
                          </div>
                          <select value={minVal} onChange={(e)=>{
                            const val = Number(e.target.value);
                            const cur = Array.isArray(currentProject.requiredSkills) ? [...currentProject.requiredSkills] : [];
                            const idx = cur.findIndex((c:any)=> (c.skill_id? String(c.skill_id)===String(sk.id) : c.skill_name===sk.name));
                            if (idx >= 0) {
                              cur[idx] = { ...(cur[idx]||{}), min_proficiency: val };
                            } else {
                              // if not selected, add it
                              cur.push({ skill_id: sk.id, skill_name: sk.name, min_proficiency: val });
                            }
                            setCurrentProject({ ...currentProject, requiredSkills: cur });
                          }} className="ml-2 px-2 py-1 border rounded text-sm">
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                          </select>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
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
