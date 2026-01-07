const API_BASE = "http://localhost:5000/api";

// -------------------
// Personnel APIs
// -------------------
export const fetchPersonnel = async () => {
  try {
    const res = await fetch(`${API_BASE}/personnel`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching personnel:", err);
    return [];
  }
};

export const addPersonnel = async (data: any) => {
  try {
    const res = await fetch(`${API_BASE}/personnel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Error adding personnel:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export const updatePersonnel = async (id: number, data: any) => {
  try {
    const res = await fetch(`${API_BASE}/personnel/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating personnel:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export const deletePersonnel = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/personnel/${id}`, { method: "DELETE" });
    return await res.json();
  } catch (err) {
    console.error("Error deleting personnel:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

// -------------------
// Skills APIs
// -------------------
export const fetchSkills = async () => {
  try {
    const res = await fetch(`${API_BASE}/skills`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching skills:", err);
    return [];
  }
};

export const addSkill = async (data: any) => {
  try {
    const res = await fetch(`${API_BASE}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Error adding skill:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export const updateSkill = async (id: number, data: any) => {
  try {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating skill:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export const deleteSkill = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/skills/${id}`, { method: "DELETE" });
    return await res.json();
  } catch (err) {
    console.error("Error deleting skill:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

// -------------------
// Projects APIs
// -------------------
export const fetchProjects = async () => {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
};

export const addProject = async (data: any) => {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Error adding project:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export const updateProject = async (id: number, data: any) => {
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating project:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export const deleteProject = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" });
    return await res.json();
  } catch (err) {
    console.error("Error deleting project:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

// -------------------
// Matching API
// -------------------
export const fetchMatches = async () => {
  try {
    const res = await fetch(`${API_BASE}/match`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching matches:", err);
    return [];
  }
};

// Get project matches (requirements, matched_personnel)
export const fetchProjectMatches = async (projectId: number) => {
  try {
    const res = await fetch(`${API_BASE}/match/project/${projectId}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching project matches:', err);
    return null;
  }
};

// Get skills for a personnel (including proficiency)
export const fetchPersonnelSkills = async (personnelId: number) => {
  try {
    const res = await fetch(`${API_BASE}/skills/personnel/${personnelId}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching personnel skills:', err);
    return [];
  }
};

// Assign personnel to a project
export const assignPersonnelToProject = async (payload: any) => {
  try {
    const res = await fetch(`${API_BASE}/personnel-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('Error assigning personnel to project:', err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};
