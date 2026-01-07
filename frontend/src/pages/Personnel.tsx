// src/components/Personnel.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Personnel {
  id: number;
  name: string;
  email: string;
  role: string;
  skills: string[];
}

const Personnel: React.FC = () => {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [currentPersonnel, setCurrentPersonnel] = useState<Partial<Personnel>>({});

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get("http://localhost:5000/personnel");
      setPersonnelList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  // Open modal for Add or Edit
  const openModal = (type: "add" | "edit", personnel?: Personnel) => {
    setModalType(type);
    setCurrentPersonnel(personnel || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPersonnel({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        await axios.post("http://localhost:5000/personnel", currentPersonnel);
      } else if (modalType === "edit" && currentPersonnel.id) {
        await axios.put(
          `http://localhost:5000/personnel/${currentPersonnel.id}`,
          currentPersonnel
        );
      }
      fetchPersonnel();
      closeModal();
    } catch (error) {
      console.error("Error saving personnel:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this personnel?")) return;
    try {
      await axios.delete(`http://localhost:5000/personnel/${id}`);
      fetchPersonnel();
    } catch (error) {
      console.error("Error deleting personnel:", error);
    }
  };

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Personnel</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => openModal("add")}
        >
          Add Personnel
        </button>
      </div>

      {loading ? (
        <p>Loading personnel...</p>
      ) : personnelList.length === 0 ? (
        <p>No personnel found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-left bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Skills</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {personnelList.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border px-4 py-2">{person.id}</td>
                  <td className="border px-4 py-2">{person.name}</td>
                  <td className="border px-4 py-2">{person.email}</td>
                  <td className="border px-4 py-2">{person.role}</td>
                  <td className="border px-4 py-2">{person.skills.join(", ")}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      onClick={() => openModal("edit", person)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(person.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {modalType === "add" ? "Add Personnel" : "Edit Personnel"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentPersonnel.name || ""}
                onChange={(e) =>
                  setCurrentPersonnel({ ...currentPersonnel, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentPersonnel.email || ""}
                onChange={(e) =>
                  setCurrentPersonnel({ ...currentPersonnel, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Role"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentPersonnel.role || ""}
                onChange={(e) =>
                  setCurrentPersonnel({ ...currentPersonnel, role: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Skills (comma separated)"
                className="w-full p-2 rounded bg-gray-100 text-gray-900"
                value={currentPersonnel.skills?.join(", ") || ""}
                onChange={(e) =>
                  setCurrentPersonnel({
                    ...currentPersonnel,
                    skills: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
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

export default Personnel;
