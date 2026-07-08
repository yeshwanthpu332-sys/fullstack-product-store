import { useState, useEffect } from "react";
import { getUsers, updateUserRole } from "../api/api";
import { useAdminAuth } from "../context/AdminAuthContext";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { admin } = useAdminAuth();

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const confirm = window.confirm(
      `Are you sure you want to change this user's role to "${newRole}"?`
    );
    if (!confirm) return;

    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const filteredUsers = users
    .filter((user) => user.id !== admin?.id)
    .filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return <div className="text-center py-20">Loading users...</div>;
  }

  if (!users.length) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">No Users Yet</h1>
        <p className="text-gray-500">No users have registered yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ============ HEADER SECTION ============ */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 text-sm mt-1">
           Browse users and manage admin access
          </p>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="🔍 Search by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ============ USERS TABLE ============ */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                #
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.role === "user" ? (
                    <button
                      onClick={() => handleRoleChange(user.id, "admin")}
                      className="px-4 py-1.5 bg-purple-50 text-purple-600 font-semibold rounded-lg hover:bg-purple-100 transition text-sm"
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(user.id, "user")}
                      className="px-4 py-1.5 bg-gray-50 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition text-sm"
                    >
                      Remove Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total Users: {filteredUsers.length}
      </div>
    </div>
  );
}

export default Users;