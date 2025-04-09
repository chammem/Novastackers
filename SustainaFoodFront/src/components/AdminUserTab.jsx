import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { useEffect, useState } from "react";
import AdminEditUsersForm from "./user/AdminEditUsersForm";
import { toast } from "react-toastify";


const AdminUsersTab = () => {
  
  const [confirmationDialog, setConfirmationDialog] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    data: null
  });

        const [users,setUsers] = useState([]);
        const [error,setError] = useState(null);
        const [loading,setLoading] = useState(true);
        const navigate = useNavigate();
        const [editingUser, setEditingUser] = useState(null);

        useEffect(() => {
            const fetchUsers = async () => {
              try {
                const response = await axiosInstance.get('/users');
                setUsers(response.data.data); // Assuming the response has a `data` field
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
        

  // Handle button actions
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
// Handle save changes
    const handleSave = async (userId, updatedData) => {
        try {
        const response = await axiosInstance.put(`/updateUser/${userId}`, updatedData);

        if (response.data.success) {
            // Update the user in the UI
            setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user._id === userId ? { ...user, ...updatedData } : user
            )
            );
            setEditingUser(null); // Close the modal
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

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
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
    <div className="mt-12 p-8 bg-white rounded-xl shadow-sm">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
        User Management
      </h2>
  
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Full Name", "Email", "Address", "Phone", "Status", "Role", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{user.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isDisabled ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">

            
          
                    <button
                      onClick={() => handleEdit(user._id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    
                     {/* Bouton Delete */}

                     <button
            onClick={() => showConfirmation(
              'delete', 
              user._id, 
              `Are you sure you want to delete ${user.fullName}?`,
              'Delete User'
            )}
            className="text-red-600 hover:text-red-900 transition-colors"
          >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>          </button>

    

      <button
            onClick={() => showConfirmation(
              'disable',
              { id: user._id, status: user.isDisabled },
              `Do you want to ${user.isDisabled ? 'enable' : 'disable'} ${user.fullName}?`,
              `${user.isDisabled ? 'Enable' : 'Disable'} User`
            )}
            className={`${user.isDisabled ? 'text-green-600' : 'text-orange-600'} hover:opacity-75`}
          >
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
            ))}
          </tbody>
        </table>
      </div>
{/* Boîte de dialogue de confirmation */}
{confirmationDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{confirmationDialog.title}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600">{confirmationDialog.message}</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmationDialog({ show: false, action: null, data: null })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    confirmationDialog.action === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                    confirmationDialog.action === 'disable' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{editingUser && (
        <AdminEditUsersForm
          user={editingUser}
          onSave={(userId, updates) => showConfirmation(
            'update',
            { id: userId, updates },
            `Confirm changes for ${editingUser.fullName}?`,
            'Update User'
          )}
          onClose={handleCloseModal}
         
        />
      )}
    </div>
  );
};


export default AdminUsersTab;