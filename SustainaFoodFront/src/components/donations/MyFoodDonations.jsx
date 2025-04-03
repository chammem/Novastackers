import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { toast } from 'react-toastify';

const MyFoodDonations = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserAndDonations = async () => {
      try {
        // Step 1: Get the logged-in user's ID
        const userRes = await axiosInstance.get('/user-details');
        const user = userRes.data.data;
        setUserId(user._id);

        // Step 2: Fetch food donations for that user
        const res = await axiosInstance.get(`/donations/get-donations-by-buisiness/${user._id}`);
        setFoodItems(res.data);
      } catch (error) {
        toast.error('Failed to fetch your food donations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndDonations();
  }, []);

  return (
    <>
      <HeaderMid />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6 text-primary">My Food Donations</h2>

        {isLoading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg" />
            <p className="mt-2">Loading...</p>
          </div>
        ) : foodItems.length === 0 ? (
          <p className="text-gray-500">You haven't donated any food yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Category</th>
                  <th>Donation Date</th>
                  <th>Status</th>
                  <th>Volunteer</th>
                </tr>
              </thead>
              <tbody>
                {foodItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.category}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      {item.status === 'picked-up' ? (
                        <span className="badge badge-success">Picked Up</span>
                      ) : (
                        <span className="badge badge-warning capitalize">{item.status || 'Pending'}</span>
                      )}
                    </td>
                    <td>{item.assignedVolunteer?.fullName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyFoodDonations;
