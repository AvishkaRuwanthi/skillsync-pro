import React, { useEffect, useState } from "react";
import { fetchProjects, fetchProjectMatches, fetchPersonnelSkills, assignPersonnelToProject, removePersonnelFromProject } from "../api";
import { FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";

interface Requirement {
  skill_id: number;
  skill_name: string;
  min_proficiency: string;
}

interface MatchedPerson {
  id: number;
  name: string;
  role: string;
  match_percentage: number;
  available: boolean;
  assigned_project?: { id: number; name: string } | null;
  assignment_id?: number | null;
}

interface Project {
  id: number;
  name: string;
}

// helper to manage assignState from inside MatchCard without prop drilling
let setAssignStateGlobal: React.Dispatch<React.SetStateAction<Record<string, { open: boolean; start_date: string; end_date: string }>>> | null = null;
const setAssignStateLocal = (key:string, field:string, value:string) => {
  if (!setAssignStateGlobal) return;
  setAssignStateGlobal((s:any)=> ({ ...s, [key]: { ...(s[key]||{}), [field]: value }}));
};

const Donut: React.FC<{ percent: number; size?: number; stroke?: number }> = ({ percent, size = 48, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  const color = percent >= 80 ? '#10b981' : percent >= 60 ? '#3b82f6' : percent >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="drop-shadow-sm">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle 
          r={r} 
          fill="none" 
          stroke={color} 
          strokeWidth={stroke} 
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} 
          transform={`rotate(-90)`}
          className="transition-all duration-300"
        />
        <text x="0" y="4" textAnchor="middle" fontSize={11} fontWeight="600" fill="#111827">{Math.round(percent)}%</text>
      </g>
    </svg>
  );
};

const Matching: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // matches cache by project id
  const [matches, setMatches] = useState<Record<number, { requirements: Requirement[]; matched_personnel: MatchedPerson[] } | null>>({});

  // UI state to show assign form per person
  const [assignState, setAssignState] = useState<Record<string, { open: boolean; start_date: string; end_date: string }>>({});

  useEffect(() => {
    // expose setter to MatchCard helpers
    setAssignStateGlobal = setAssignState;
    return () => { setAssignStateGlobal = null };
  }, [setAssignState]);

  const [sortKey, setSortKey] = useState<'match' | 'name' | 'available'>('match');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const projs = await fetchProjects();
        setProjects(projs.map((p: any) => ({ id: p.id, name: p.name })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When projects are available, auto-load matches for each project (if not already loaded)
  useEffect(() => {
    if (!projects || projects.length === 0) return;
    projects.forEach((p) => {
      if (matches[p.id] === undefined) {
        // fire-and-forget; loadMatches will set loading state for that project
        loadMatches(p.id).catch((e) => console.error(e));
      }
    });
    // intentionally depend on projects and matches so we only request when undefined
  }, [projects, matches]);

  const loadMatches = async (projectId: number) => {
    if (matches[projectId]) return; // cached
    setMatches(s => ({ ...s, [projectId]: null }));
    const res = await fetchProjectMatches(projectId);
    if (!res) return;
    setMatches((m) => ({ ...m, [projectId]: { requirements: res.requirements || [], matched_personnel: res.matched_personnel || [] } }));
  };

  const openAssign = (projectId: number, personId: number) => {
    const key = `${projectId}:${personId}`;
    const today = new Date().toISOString().split('T')[0];
    const plus30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setAssignState(s => ({ ...s, [key]: { open: true, start_date: today, end_date: plus30 } }));
  };

  const closeAssign = (projectId: number, personId: number) => {
    const key = `${projectId}:${personId}`;
    setAssignState(s => ({ ...s, [key]: { ...(s[key] || {}), open: false } }));
  };

  const confirmAssign = async (projectId: number, personId: number) => {
    const key = `${projectId}:${personId}`;
    const state = assignState[key];
    if (!state) return;
    const payload = { personnel_id: personId, project_id: projectId, start_date: state.start_date, end_date: state.end_date };
    const resp = await assignPersonnelToProject(payload);
    if (resp && !resp.error) {
      // refresh matches for all projects to update availability
      setMatches({});
      projects.forEach(p => {
        loadMatches(p.id).catch(e => console.error(e));
      });
      closeAssign(projectId, personId);
    } else {
      alert(resp.error || 'Failed to assign');
    }
  };

  const handleRemove = async (projectId: number, personId: number) => {
    if (!window.confirm("Are you sure you want to remove this personnel from the project?")) return;
    const payload = { personnel_id: personId, project_id: projectId };
    const resp = await removePersonnelFromProject(payload);
    if (resp && !resp.error) {
      // refresh matches for all projects to update availability
      setMatches({});
      projects.forEach(p => {
        loadMatches(p.id).catch(e => console.error(e));
      });
    } else {
      alert(resp.error || 'Failed to remove');
    }
  };

  const sortPeople = (people: MatchedPerson[]) => {
    const copy = [...people];
    if (sortKey === 'match') copy.sort((a,b)=> b.match_percentage - a.match_percentage);
    if (sortKey === 'name') copy.sort((a,b)=> a.name.localeCompare(b.name));
    if (sortKey === 'available') copy.sort((a,b)=> (a.available === b.available)? 0 : a.available? -1:1);
    return copy;
  };

  // Filter projects by search query
  const displayedProjects = projects.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    return q === '' || (p.name && p.name.toLowerCase().includes(q));
  });

  return (
    <div className="text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Skill Matching</h2>
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
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select 
                  value={sortKey} 
                  onChange={e=>setSortKey(e.target.value as any)} 
                  title="Sort personnel by" 
                  className="px-3 py-1.5 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                >
                  <option value="match">Match %</option>
                  <option value="name">Name</option>
                  <option value="available">Availability</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {displayedProjects.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No projects match your search.</p>
              </div>
            ) : (
              displayedProjects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                  </div>

                  {/* Matches area */}
                  {matches[project.id] === undefined ? null : matches[project.id] === null ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-600">Loading matches...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matches[project.id]!.matched_personnel.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-sm text-gray-600">No recommended personnel.</p>
                        </div>
                      ) : (
                        sortPeople(matches[project.id]!.matched_personnel).map(person => (
                          <MatchCard key={person.id} project={project} person={person} requirements={matches[project.id]!.requirements} assignState={assignState} openAssign={openAssign} closeAssign={closeAssign} confirmAssign={confirmAssign} handleRemove={handleRemove} />
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MatchCard: React.FC<{ project: Project; person: MatchedPerson; requirements: Requirement[]; assignState: Record<string, any>; openAssign: (projectId:number, personId:number)=>void; closeAssign: (projectId:number, personId:number)=>void; confirmAssign: (projectId:number, personId:number)=>void; handleRemove: (projectId:number, personId:number)=>void }>= ({ project, person, requirements, assignState, openAssign, closeAssign, confirmAssign, handleRemove }) => {
  const [personSkills, setPersonSkills] = useState<{ skill_name: string; proficiency: string }[]>([]);
  const key = `${project.id}:${person.id}`;

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      const rows = await fetchPersonnelSkills(person.id);
      if (!mounted) return;
      setPersonSkills(rows.map((r:any)=> ({ skill_name: r.skill_name, proficiency: r.proficiency })));
    };
    load();
    return ()=>{ mounted=false };
  }, [person.id]);

  const reqInfo = requirements.map(r=>{
    const found = personSkills.find(ps=> ps.skill_name === r.skill_name);
    return { name: r.skill_name, required: r.min_proficiency, has: !!found, proficiency: found?.proficiency || null };
  });

  const assignData = assignState[key] || { open: false, start_date: '', end_date: '' };
  
  // Check if person is assigned to current project or different project
  const isAssignedToCurrentProject = person.assigned_project && person.assigned_project.id === project.id;
  const isAssignedToDifferentProject = person.assigned_project && person.assigned_project.id !== project.id;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-900">{person.name}</div>
          <div className="text-sm text-gray-500 mt-0.5">{person.role}</div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="w-12 h-12 flex-shrink-0"><Donut percent={person.match_percentage} /></div>
          <div className={`text-xs font-medium flex items-center gap-1 ${person.available && !isAssignedToDifferentProject? 'text-green-600':'text-red-600'}`}>
            {person.available && !isAssignedToDifferentProject? <><FaCheckCircle className="inline"/>Available</> : <><FaTimesCircle className="inline"/>Unavailable</>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Required Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {reqInfo.map(r=> (
            <div key={r.name} className={`px-2 py-1 text-xs rounded-full ${r.has? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
              {r.name} {r.has && <span className="ml-1 text-gray-500">({r.proficiency})</span>}
            </div>
          ))}
        </div>
      </div>

      {isAssignedToDifferentProject && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          Assigned to <span className="font-semibold">"{person.assigned_project?.name}"</span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Match: <span className="font-semibold text-gray-900">{person.match_percentage}%</span>
        </div>
        <div>
          {isAssignedToCurrentProject ? (
            <button 
              onClick={()=> handleRemove(project.id, person.id)} 
              className="px-4 py-2 rounded text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Remove
            </button>
          ) : (
            <button 
              disabled={!person.available || isAssignedToDifferentProject} 
              onClick={()=> openAssign(project.id, person.id)} 
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                person.available && !isAssignedToDifferentProject
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Assign
            </button>
          )}
        </div>
      </div>

      {/* Assign form */}
      {assignData.open && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">Assignment Dates</div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input 
                type="date" 
                title="Start date" 
                value={assignData.start_date} 
                onChange={e=> setAssignStateLocal(key,'start_date', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input 
                type="date" 
                title="End date" 
                value={assignData.end_date} 
                onChange={e=> setAssignStateLocal(key,'end_date', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
            </div>
            <div className="flex items-end gap-2 mt-2 sm:mt-0">
              <button 
                onClick={()=> confirmAssign(project.id, person.id)} 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Confirm
              </button>
              <button 
                onClick={()=> closeAssign(project.id, person.id)} 
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// helper to manage assignState from inside MatchCard without prop drilling
// (moved to top of file)



export default Matching;
