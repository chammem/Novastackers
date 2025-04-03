import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';

const VolunteerDashboard = () => {
  const [user, setUser] = useState(null);
  const [assignedFoods, setAssignedFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');
  const [actionType, setActionType] = useState('pickup');
  const [inProgress, setInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axiosInstance.get('/user-details');
        setUser(userRes.data.data);

        const foodRes = await axiosInstance.get(`/volunteer/${userRes.data.data._id}/assignments`);
        const sorted = foodRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAssignedFoods(sorted);
        setFilteredFoods(sorted);
      } catch (error) {
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = assignedFoods;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(food => food.status === filterStatus);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(food =>
        food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFoods(filtered);
  }, [searchTerm, filterStatus, assignedFoods]);

  const refreshFoodList = async () => {
    if (!user) return;
    const res = await axiosInstance.get(`/volunteer/${user._id}/assignments`);
    const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setAssignedFoods(sorted);
  };

  const handleStartAction = async (food, type) => {
    setInProgress(true);
    setSelectedFood(food);
    setActionType(type);
    try {
      const endpoint = type === 'pickup' ? 'start-pickup' : 'start-delivery';
      await axiosInstance.patch(`/food/${food._id}/${endpoint}`);
      toast.info(`${type === 'pickup' ? 'Pickup' : 'Delivery'} code sent!`);
      setShowCodeInput(true);
    } catch (error) {
      toast.error(`Failed to start ${type}`);
    } finally {
      setInProgress(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!selectedFood) return;
    setInProgress(true);
    try {
      const endpoint = actionType === 'pickup' ? 'verify-pickup' : 'verify-delivery';
      await axiosInstance.post(`/food/${selectedFood._id}/${endpoint}`, { code });
      toast.success(`${actionType === 'pickup' ? 'Pickup' : 'Delivery'} confirmed!`);
      setShowCodeInput(false);
      setCode('');
      await refreshFoodList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setInProgress(false);
    }
  };

  return (
    <>
      <HeaderMid />

     

      {/* Section Title */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">📋 Your Assignments</h2>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white pt-0 pb-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 items-center justify-between">
          <select
            className="select select-bordered"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="assigned">Assigned</option>
            <option value="picked-up">Picked Up</option>
            <option value="delivered">Delivered</option>
          </select>

          <input
            type="text"
            placeholder="Search by name or category"
            className="input input-bordered w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-10">
            <span className="loading loading-spinner loading-lg" />
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        ) : filteredFoods.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredFoods.map((food) => (
              <div key={food._id} className="bg-base-100 shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{food.name}</h2>
                <p><strong>Quantity:</strong> {food.quantity}</p>
                <p><strong>Category:</strong> {food.category || 'N/A'}</p>
                <p><strong>Status:</strong> <span className="badge badge-info">{food.status}</span></p>

                {food.volunteerPickedUpAt && (
                  <p className="text-sm text-success mt-2">
                    Picked up at: {new Date(food.volunteerPickedUpAt).toLocaleString()}
                  </p>
                )}

                {!food.volunteerPickedUpAt && food.status === 'assigned' && (
                  <button
                    className="btn btn-primary btn-sm mt-4"
                    onClick={() => handleStartAction(food, 'pickup')}
                    disabled={inProgress}
                  >
                    🚚 Start Pickup
                  </button>
                )}

                {food.status === 'picked-up' && (
                  <button
                    className="btn btn-accent btn-sm mt-4"
                    onClick={() => handleStartAction(food, 'delivery')}
                    disabled={inProgress}
                  >
                    ✅ Deliver to NGO
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No assignments found.
          </div>
        )}
      </div>

      {/* Code Modal */}
      {showCodeInput && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Enter {actionType === 'pickup' ? 'Pickup' : 'Delivery'} Code
            </h3>
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              placeholder={`Code from ${actionType === 'pickup' ? 'business' : 'NGO'}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowCodeInput(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmCode} disabled={inProgress}>
                {inProgress ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </dialog>
      )}

      <Footer />
    </>
  );
};

export default VolunteerDashboard;
