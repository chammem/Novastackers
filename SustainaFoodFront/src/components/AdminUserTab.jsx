import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { useEffect, useState } from "react";
import AdminEditUsersForm from "./user/AdminEditUsersForm";
import { toast } from "react-toastify";


const AdminUsersTab = () => {

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



  // Handle button actions
  const handleEdit = (userId) => {
    const userToEdit = users.find((user) => user._id === userId);
    setEditingUser(userToEdit);
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
    return <div className="p-6">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  const handleDelete = async (userId) => {
    console.log(userId);
    try {
      setLoading(true);
  
      const response = await axiosInstance.delete(`/deleteUser/${userId}`);
  
      if (response.data.success) {
        // Remove the deleted user from the UI
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
  
        console.log("User deleted successfully:", response.data.message);
        toast.success("User deleted successfully!"); // Use toast for success message
      } else {
        console.error("Failed to delete user:", response.data.message);
        setError(response.data.message || "Failed to delete user");
        toast.error(response.data.message || "Failed to delete user"); // Use toast for error message
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message || "Failed to delete user");
      toast.error(error.message || "Failed to delete user"); // Use toast for error message
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (userId,currentStatus) => {
    try {
        setLoading(true);
    
        const response = await axiosInstance.put(`/disableUser/${userId}`);
    
        if (response.data.user) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
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
        console.error("Error disabling user:", error);
        toast.error(error.message || "Failed to disable user.");
      } finally {
        setLoading(false);
      }   

  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary mr-2"
                    onClick={() => handleEdit(user._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-error mr-2"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleDisable(user._id, user.isDisabled)}
                  >
                     {user.isDisabled ? "Enable" : "Disable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <AdminEditUsersForm
          user={editingUser}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminUsersTab;