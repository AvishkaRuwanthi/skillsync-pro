// src/components/Dashboard.tsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Personnel from "../pages/Personnel";
import Skills from "../pages/Skills";
import Projects from "../pages/Projects";
import Matching from "../pages/Matching";

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("Personnel");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true); // toggle for mobile

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar title="SkillSync Pro" toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="p-6 flex-1 overflow-auto">
          {activeSection === "Personnel" && <Personnel />}
          {activeSection === "Skills" && <Skills />}
          {activeSection === "Projects" && <Projects />}
          {activeSection === "Matching" && <Matching />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
