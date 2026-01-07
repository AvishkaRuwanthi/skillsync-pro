import React, { useEffect, useState } from "react";
import { fetchProjects, fetchProjectMatches, fetchPersonnelSkills, assignPersonnelToProject } from "../api";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

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
  return (
    <svg width={size} height={size}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={r} fill="none" stroke="#e6e6e6" strokeWidth={stroke} />
        <circle r={r} fill="none" stroke="#4f46e5" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90)`} />
        <text x="0" y="4" textAnchor="middle" fontSize={12} fill="#111827">{percent}%</text>
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
      // refresh matches for this project to update availability
      setMatches(s => ({ ...s, [projectId]: null }));
      await loadMatches(projectId);
      closeAssign(projectId, personId);
    } else {
      alert(resp.error || 'Failed to assign');
    }
  };

  const sortPeople = (people: MatchedPerson[]) => {
    const copy = [...people];
    if (sortKey === 'match') copy.sort((a,b)=> b.match_percentage - a.match_percentage);
    if (sortKey === 'name') copy.sort((a,b)=> a.name.localeCompare(b.name));
    if (sortKey === 'available') copy.sort((a,b)=> (a.available === b.available)? 0 : a.available? -1:1);
    return copy;
  };

  return (
    <div className="text-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Skill Matching</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort:</label>
          <select value={sortKey} onChange={e=>setSortKey(e.target.value as any)} title="Sort personnel by" className="px-2 py-1 border rounded">
            <option value="match">Match %</option>
            <option value="name">Name</option>
            <option value="available">Availability</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white border p-4 rounded shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{project.name}</h3>
                </div>
              </div>

              {/* Matches area */}
              {matches[project.id] === undefined ? null : matches[project.id] === null ? (
                <p className="mt-4 text-sm text-gray-600">Loading matches...</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches[project.id]!.matched_personnel.length === 0 ? (
                    <p className="text-sm text-gray-600">No recommended personnel.</p>
                  ) : (
                    sortPeople(matches[project.id]!.matched_personnel).map(person => (
                      <MatchCard key={person.id} project={project} person={person} requirements={matches[project.id]!.requirements} assignState={assignState} openAssign={openAssign} closeAssign={closeAssign} confirmAssign={confirmAssign} />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MatchCard: React.FC<{ project: Project; person: MatchedPerson; requirements: Requirement[]; assignState: Record<string, any>; openAssign: (projectId:number, personId:number)=>void; closeAssign: (projectId:number, personId:number)=>void; confirmAssign: (projectId:number, personId:number)=>void }>= ({ project, person, requirements, assignState, openAssign, closeAssign, confirmAssign }) => {
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

  return (
    <div className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{person.name}</div>
          <div className="text-sm text-gray-500">{person.role}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12"><Donut percent={person.match_percentage} /></div>
          <div className={`text-sm ${person.available? 'text-green-600':'text-red-600'}`}>
            {person.available? <><FaCheckCircle className="inline mr-1"/>Available</> : <><FaTimesCircle className="inline mr-1"/>Unavailable</>}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium mb-2">Required skills</div>
        <div className="flex flex-wrap gap-2">
          {reqInfo.map(r=> (
            <div key={r.name} className={`px-2 py-1 text-sm rounded-full ${r.has? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {r.name} {r.has && <span className="ml-1 text-xs text-gray-500">({r.proficiency})</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Match: <span className="font-medium">{person.match_percentage}%</span></div>
        <div>
          <button disabled={!person.available} onClick={()=> openAssign(project.id, person.id)} className={`px-3 py-1 rounded ${person.available? 'bg-indigo-600 text-white hover:bg-indigo-700':'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            Assign
          </button>
        </div>
      </div>

      {/* Assign form */}
      {assignData.open && (
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center gap-2">
            <input type="date" title="Start date" value={assignData.start_date} onChange={e=> setAssignStateLocal(key,'start_date', e.target.value)} className="px-2 py-1 border rounded" />
            <input type="date" title="End date" value={assignData.end_date} onChange={e=> setAssignStateLocal(key,'end_date', e.target.value)} className="px-2 py-1 border rounded" />
            <button onClick={()=> confirmAssign(project.id, person.id)} className="px-3 py-1 bg-green-600 text-white rounded">Confirm</button>
            <button onClick={()=> closeAssign(project.id, person.id)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// helper to manage assignState from inside MatchCard without prop drilling
// (moved to top of file)



export default Matching;
