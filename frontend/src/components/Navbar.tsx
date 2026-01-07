// src/components/Navbar.tsx
import React from "react";
import { FaBars, FaSearch, FaBell, FaUserCircle } from "react-icons/fa";

interface NavbarProps {
  title: string;
  toggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({toggleSidebar }) => {
  return (
    <nav className="bg-white flex items-center justify-between px-6 py-3 text-gray-800 border-b shadow-sm">
      <div className="flex items-center gap-4">
        {/* Hamburger for mobile */}
        {toggleSidebar && (
          <button
            className="md:hidden mr-2 p-2 rounded hover:bg-gray-100"
            onClick={toggleSidebar}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-lg" />
          </button>
        )}
      </div>

      <div className="flex-1 flex justify-center px-4">
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1 w-full max-w-xl shadow-sm">
          <FaSearch className="text-gray-400 mr-3" />
          <input
            className="bg-transparent focus:outline-none w-full text-sm"
            placeholder="Search personnel, skills, projects..."
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded hover:bg-gray-100 hidden md:inline-flex" title="Notifications">
          <FaBell className="text-gray-600" />
        </button>
        <button className="p-1 rounded-full bg-gray-100 flex items-center gap-2 px-3" title="Profile">
          <FaUserCircle className="text-gray-600 text-2xl" />
          <span className="hidden sm:inline-block text-sm">Admin</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
