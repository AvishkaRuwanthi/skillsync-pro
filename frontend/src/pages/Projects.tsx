import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          onClick={() => openModal("add")}
        >
          Add Project
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No projects found.</p>
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
                    placeholder="Search projects..." 
                    className="bg-transparent focus:outline-none w-full text-sm" 
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={e=>setStatusFilter(e.target.value)} 
                  className="px-3 py-1.5 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" 
                  title="Filter projects by status"
                >
                  <option value="All">All Statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={sortKey} 
                  onChange={e=>setSortKey(e.target.value as any)} 
                  className="px-3 py-1.5 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" 
                  title="Sort projects by"
                >
                  <option value="created">Created</option>
                  <option value="start">Start Date</option>
                  <option value="name">Name</option>
                </select>
                <button 
                  onClick={()=>setSortDir(d=> d==='asc' ? 'desc' : 'asc')} 
                  className="px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
                  title={`Sort ${sortDir === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  {sortDir==='asc' ? '↑' : '↓'}
                </button>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Required Skills</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-gray-50 transition-colors align-top">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{proj.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proj.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="max-w-md" title={proj.description}>
                          {proj.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {proj.start_date ? new Date(proj.start_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {proj.end_date ? new Date(proj.end_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          proj.status === 'Active' ? 'bg-green-100 text-green-800' :
                          proj.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {proj.status || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {proj.created_at ? new Date(proj.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {proj.requiredSkills && proj.requiredSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {proj.requiredSkills.map((s: any, idx: number) => (
                              <div key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs">
                                {s.skill_name} <span className="ml-1 text-indigo-600">({s.min_proficiency})</span>
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
                            onClick={() => openModal("edit", proj)} 
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded transition-colors"
                          >
                            <FaEdit/>
                          </button>
                          <button 
                            title="Delete" 
                            onClick={() => handleDelete(proj.id)} 
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 py-8 px-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === "add" ? "Add Project" : "Edit Project"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="overflow-y-auto p-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={currentProject.name || ""}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                  value={currentProject.description || ""}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    title="Start Date" 
                    value={currentProject.start_date || ''} 
                    onChange={e=> setCurrentProject({...currentProject, start_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    title="End Date" 
                    value={currentProject.end_date || ''} 
                    onChange={e=> setCurrentProject({...currentProject, end_date: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  title="Select project status" 
                  value={currentProject.status || 'Planning'} 
                  onChange={e=> setCurrentProject({...currentProject, status: e.target.value})}
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {modalError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <div className="border border-gray-300 rounded p-2 max-h-32 overflow-y-auto bg-gray-50">
                  {skillsList.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">No skills available</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {skillsList.map((sk: any) => {
                        const selected = (currentProject.requiredSkills || []).find((rs: any) => (rs.skill_id ? String(rs.skill_id) === String(sk.id) : rs.skill_name === sk.name));
                        const minVal = selected ? (selected.min_proficiency || 1) : 1;
                        return (
                          <label key={sk.id} className="flex items-center justify-between p-2 hover:bg-white rounded transition-colors gap-3 w-full">
                            <div className="flex items-center gap-2 min-w-0">
                              <input 
                                type="checkbox" 
                                checked={!!selected} 
                                onChange={(e)=>{
                                  const checked = e.target.checked;
                                  const cur = Array.isArray(currentProject.requiredSkills) ? [...currentProject.requiredSkills] : [];
                                  if (checked) {
                                    cur.push({ skill_id: sk.id, skill_name: sk.name, min_proficiency: 1 });
                                  } else {
                                    const idx = cur.findIndex((c:any)=> (c.skill_id? String(c.skill_id)===String(sk.id) : c.skill_name===sk.name));
                                    if (idx>=0) cur.splice(idx,1);
                                  }
                                  setCurrentProject({ ...currentProject, requiredSkills: cur });
                                }} 
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-800 truncate">{sk.name}</span>
                            </div>
                            <select 
                              value={minVal} 
                              onChange={(e)=>{
                                const val = Number(e.target.value);
                                const cur = Array.isArray(currentProject.requiredSkills) ? [...currentProject.requiredSkills] : [];
                                const idx = cur.findIndex((c:any)=> (c.skill_id? String(c.skill_id)===String(sk.id) : c.skill_name===sk.name));
                                if (idx >= 0) {
                                  cur[idx] = { ...(cur[idx]||{}), min_proficiency: val };
                                } else {
                                  cur.push({ skill_id: sk.id, skill_name: sk.name, min_proficiency: val });
                                }
                                setCurrentProject({ ...currentProject, requiredSkills: cur });
                              }} 
                              className="ml-4 w-28 flex-shrink-0 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={!selected}
                            >
                              <option value={1}>Beginner (1)</option>
                              <option value={2}>Intermediate (2)</option>
                              <option value={3}>Advanced (3)</option>
                              <option value={4}>Expert (4)</option>
                            </select>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-3 bg-white">
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

export default Projects;
