// src/components/Sidebar.tsx
import React from "react";
import { FaUsers, FaClipboardList, FaTasks, FaProjectDiagram, FaTimes, FaLayerGroup } from "react-icons/fa";

interface SidebarProps {
  onSelect: (section: string) => void;
  activeSection: string;
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelect, open = true, onClose }) => {
  const menuItems = [
    { name: "Personnel", icon: <FaUsers /> },
    { name: "Skills", icon: <FaClipboardList /> },
    { name: "Projects", icon: <FaTasks /> },
    { name: "Matching", icon: <FaProjectDiagram /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed md:relative z-50 top-0 left-0 h-full bg-white text-gray-900 w-64 p-6 flex flex-col
        transform ${open ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 border-r shadow-lg rounded-r-xl`}
      >
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-2xl font-bold">Menu</h2>
          <button onClick={onClose} title="Close menu" className="p-2 rounded hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
            <FaLayerGroup className="text-lg" />
          </div>
          <div>
            <div className="font-semibold text-lg">SkillSync Pro</div>
            <div className="text-sm text-gray-500">Manage skills & projects</div>
          </div>
        </div>

        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`relative flex items-center gap-3 p-2 pr-4 rounded-lg cursor-pointer transition-colors ${
                activeSection === item.name
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                onSelect(item.name);
                if (onClose && typeof window !== "undefined" && window.innerWidth < 768) {
                  onClose();
                }
              }}
            >
              {/* Left indicator */}
              {activeSection === item.name && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-r bg-blue-600"></span>
              )}

              <div className={`p-2 rounded-md flex items-center justify-center ${activeSection === item.name ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {item.icon}
              </div>
              <span className="ml-1 font-medium">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4 border-t">
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">A</div>
            <div>
              <div className="text-sm font-medium">Admin</div>
              <div className="text-xs text-gray-500">View profile</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
