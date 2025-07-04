import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { useEffect, useState } from "react";
import AdminEditUsersForm from "./user/AdminEditUsersForm";
import { toast } from "react-toastify";


const AdminUsersTab = ({ sidebarOpen }) => {
  // All state hooks must be declared at the top
  const [confirmationDialog, setConfirmationDialog] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    data: null
  });

  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setUsers(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const showConfirmation = (action, data, message, title) => {
    setConfirmationDialog({
      show: true,
      title: title || 'Confirmation Required',
      message,
      action,
      data
    });
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      switch (confirmationDialog.action) {
        case 'delete':
          await handleDelete(confirmationDialog.data);
          break;
        case 'disable':
          await handleDisable(confirmationDialog.data.id, confirmationDialog.data.status);
          break;
        case 'update':
          await handleSave(confirmationDialog.data.id, confirmationDialog.data.updates);
          break;
      }
    } finally {
      setConfirmationDialog({ show: false, action: null, data: null });
      setLoading(false);
    }
  };

  const handleEdit = (userId) => {
    const userToEdit = users.find((user) => user._id === userId);
    setEditingUser(userToEdit);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await axiosInstance.delete(`/deleteUser/${userId}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        toast.success("User deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete user");
      }
    } catch (err) {
      toast.error(err.message || "Error deleting user");
    }
  };

  const handleDisable = async (userId, currentStatus) => {
    try {
      const response = await axiosInstance.put(`/disableUser/${userId}`);

      if (response.data.user) {
        setUsers(prev =>
          prev.map(user =>
            user._id === userId ? { ...user, isDisabled: !currentStatus } : user
          )
        );

        toast.success(
          `User ${currentStatus ? "enabled" : "disabled"} successfully!`
        );
      } else {
        toast.error(response.data.message || "Failed to disable user.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to disable user.");
    }
  };

  const handleSave = async (userId, updatedData) => {
    try {
      const response = await axiosInstance.put(`/updateUser/${userId}`, updatedData);

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, ...updatedData } : user
          )
        );
        setEditingUser(null);
        toast.success("User updated successfully!");
      } else {
        setError(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user');
    }
  };

  const handleCloseModal = () => {
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => {
    const lowerSearch = searchTerm.toLowerCase();
    switch(searchFilter) {
      case 'name':
        return user.fullName.toLowerCase().includes(lowerSearch);
      case 'email':
        return user.email.toLowerCase().includes(lowerSearch);
      case 'role':
        return user.role.toLowerCase().includes(lowerSearch);
      case 'status':
        return user.isDisabled ? 'disabled' : 'active' === lowerSearch;
      default:
        return Object.values(user).some(value => 
          String(value).toLowerCase().includes(lowerSearch)
        );
    }
  });

  // Ajout d'un compteur rapide et d'un bouton d'ajout utilisateur (fictif ici)
  const quickStats = [
    {
      label: "Total Users",
      value: users.length,
      color: "bg-blue-100 text-blue-700",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-8 0 4 4 0 008 0z" />
        </svg>
      )
    },
    {
      label: "Active",
      value: users.filter(u => !u.isDisabled).length,
      color: "bg-green-100 text-green-700",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      label: "Disabled",
      value: users.filter(u => u.isDisabled).length,
      color: "bg-red-100 text-red-700",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ];

  // Pagination logic
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="p-8 space-y-4 bg-base-100 dark:bg-neutral">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-12 p-8 rounded-xl shadow-sm transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-20'} bg-base-100 dark:bg-neutral`}>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} pt-20 pb-8 px-2 md:px-8`}
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Innovative Header with Animated Background */}
        <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-white rounded-full transform translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute right-20 top-10 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute left-20 top-20 w-32 h-32 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                  User Management
                </h1>
                <p className="text-green-50 text-sm md:text-base max-w-2xl">
                  Manage all platform users, roles and permissions in one place.
                </p>
              </div>
              
              {/* Add search bar to header with white background */}
              <div className="md:w-96">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-4 py-3 pr-10 rounded-xl border-none bg-white text-gray-700 shadow-md placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchTerm('')}
                    >
                      <svg className="w-5 h-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats cards - keep existing code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {quickStats.map(stat => (
            <div key={stat.label} className={`flex items-center gap-3 p-4 rounded-xl shadow bg-white hover:shadow-lg transition ${stat.color}`}>
              <div>{stat.icon}</div>
              <div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Move filter dropdown to be positioned above the table, directly below the stats cards */}
        <div className="flex items-center mb-4">
          <select 
            className="px-4 py-2 border rounded-lg bg-white"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            aria-label="Filter by field"
          >
            <option value="all">All Fields</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>
          <span className="text-sm text-gray-500 ml-2">Filter by field</span>
        </div>

        {/* Users table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className={`w-full table-fixed ${
            sidebarOpen ? 'min-w-[75vw]' : 'min-w-[85vw]'
          } transition-all duration-300`}>
            <thead className="bg-gray-50">
              <tr>
                {["Full Name", "Email", "Address", "Phone", "Status", "Role", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    style={{ width: `${100/7}%` }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                  No users found</td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium truncate max-w-[15vw]">
                      {user.fullName}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[20vw]">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[25vw]">
                      {user.address}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap max-w-[10vw]">
                      {user.phoneNumber}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap max-w-[10vw]">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isDisabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap max-w-[10vw]">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap max-w-[15vw]">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => handleEdit(user._id)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Edit">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => showConfirmation('delete', user._id, `Are you sure you want to delete ${user.fullName}?`, 'Delete User')} className="text-red-600 hover:text-red-900 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button onClick={() => showConfirmation('disable', { id: user._id, status: user.isDisabled }, `Do you want to ${user.isDisabled ? 'enable' : 'disable'} ${user.fullName}?`, `${user.isDisabled ? 'Enable' : 'Disable'} User`)} className={`${user.isDisabled ? 'text-green-600' : 'text-orange-600'} hover:opacity-75`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {user.isDisabled ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.948 4.29l1.643 3.169 3.446.5a1 1 0 01.554 1.706l-2.492 2.431.589 3.47a1 1 0 01-1.45 1.054L12 14.527l-3.172 1.67a1 1 0 01-1.45-1.054l.589-3.47-2.492-2.431a1 1 0 01.554-1.706l3.446-.5 1.643-3.169a1 1 0 011.792 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmationDialog.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">{confirmationDialog.title}</h3>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-600">{confirmationDialog.message}</p>

                <div className="flex justify-end space-x-3">
                  <button onClick={() => setConfirmationDialog({ show: false, action: null, data: null })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleConfirm} className={`px-4 py-2 rounded-lg text-white transition-colors ${confirmationDialog.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : confirmationDialog.action === 'disable' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <AdminEditUsersForm
            user={editingUser}
            onSave={(userId, updates) => showConfirmation('update', { id: userId, updates }, `Confirm changes for ${editingUser.fullName}?`, 'Update User')}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsersTab;