// ViewCampaignProgress.jsx

import React, { useEffect, useState } from 'react';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axiosInstance';

const ViewCampaignProgress = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [foods, setFoods] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('food');
  const [volunteers, setVolunteers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCampaign = async () => {
    try {
      const res = await axiosInstance.get(`/donations/${id}/details`);
      setCampaign(res.data.donation);
    } catch (err) {
      toast.error('Failed to load campaign');
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await axiosInstance.get(`/donations/${id}/foods/paginated`, {
        params: {
          page,
          limit: 10,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm || undefined,
        },
      });
      setFoods(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load food items');
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (view === 'food') {
      fetchFoods();
    } else if (view === 'volunteers') {
      axiosInstance.get(`/donations/${id}/volunteer`)
        .then(res => setVolunteers(res.data.volunteers || []))
        .catch(() => toast.error('Failed to load volunteers'));
    } else if (view === 'businesses') {
      axiosInstance.get(`/donations/${id}/businesses`)
        .then(res => setBusinesses(res.data.businesses || []))
        .catch(() => toast.error('Failed to load businesses'));
    }
  }, [view, id, page, filterStatus, searchTerm]);

  const openAssignModal = async (foodId) => {
    setSelectedFoodId(foodId);
    setSelectedVolunteer('');
    try {
      const res = await axiosInstance.get(`/donations/${id}/volunteer`);
      setVolunteers(res.data.volunteers || []);
      setModalOpen(true);
    } catch {
      toast.error('Failed to fetch volunteers');
    }
  };

  const assignVolunteer = async () => {
    if (!selectedVolunteer) return toast.warning('Please select a volunteer');
    try {
      await axiosInstance.post(`/donations/assign-volunteer/${selectedFoodId}`, {
        volunteerId: selectedVolunteer,
      });
      toast.success('Volunteer assigned!');
      setModalOpen(false);
      fetchFoods();
    } catch {
      toast.error('Failed to assign volunteer');
    }
  };

  return (
    <>
      <HeaderMid />

      {/* Campaign Header */}
      {campaign && (
        <section className="py-10 bg-base-200">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <img src={`http://localhost:8082/${campaign.imageUrl}`} alt={campaign.name} className="w-full h-64 object-cover rounded-xl shadow-md" />
            </div>
            <div className="md:w-1/2">
              <h1 className="text-4xl font-bold text-primary">{campaign.name}</h1>
              <p className="mt-2 text-gray-600">{campaign.description}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p><strong>Location:</strong> {campaign.location}</p>
                <p><strong>Ends:</strong> {new Date(campaign.endingDate).toLocaleDateString()}</p>
                <p><strong>Created:</strong> {new Date(campaign.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab Buttons */}
      <section className="py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex gap-4">
          {['food', 'businesses', 'volunteers'].map(tab => (
            <button
              key={tab}
              className={`btn btn-sm ${view === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setView(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* FOOD VIEW */}
      {view === 'food' && (
        <>
          <section className="bg-white py-4">
            <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="form-control w-64">
                <label className="label">
                  <span className="label-text font-medium">Filter by Status</span>
                </label>
                <select className="select select-bordered" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="picked-up">Picked Up</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Search food / business"
                className="input input-bordered w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          <section className="py-6 px-4 max-w-6xl mx-auto">
            {foods.length > 0 ? (
              <div className="overflow-x-auto bg-base-100 rounded-xl shadow">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Category</th>
                      <th>Business</th>
                      <th>Status</th>
                      <th>Volunteer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.category}</td>
                        <td>{item.buisiness_id?.fullName || 'Unknown'}</td>
                        <td><span className="badge badge-info">{item.status}</span></td>
                        <td>
                          {item.assignedVolunteer ? (
                            <span className="badge badge-success">{item.assignedVolunteer.fullName}</span>
                          ) : (
                            <button className="btn btn-xs btn-outline btn-primary" onClick={() => openAssignModal(item._id)}>
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="mt-6 flex justify-center gap-4">
                  <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                  <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-6">No matching food items found.</p>
            )}
          </section>
        </>
      )}

      {/* BUSINESS VIEW */}
      {view === 'businesses' && (
        <section className="py-10 max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">Contributing Businesses</h2>
          {businesses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => (
                <div key={b._id} className="bg-base-100 shadow p-4 rounded-xl border border-base-300">
                  <h3 className="font-bold text-lg text-primary">{b.fullName}</h3>
                  <p><strong>Email:</strong> {b.email}</p>
                  <p><strong>Role:</strong> {b.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No businesses found for this campaign.</p>
          )}
        </section>
      )}

      {/* VOLUNTEERS VIEW */}
      {view === 'volunteers' && (
        <section className="py-10 max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">Volunteers Who Joined</h2>
          {volunteers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteers.map((v) => (
                <div key={v._id} className="bg-base-100 shadow p-4 rounded-xl border border-base-300">
                  <h3 className="font-bold text-lg text-primary">{v.fullName}</h3>
                  <p><strong>Email:</strong> {v.email}</p>
                  <p><strong>Role:</strong> {v.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No volunteers have joined this campaign yet.</p>
          )}
        </section>
      )}

      {/* Volunteer Assignment Modal */}
      {modalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Assign Volunteer</h3>
            <select className="select select-bordered w-full mb-4" value={selectedVolunteer} onChange={(e) => setSelectedVolunteer(e.target.value)}>
              <option value="">Select a volunteer</option>
              {volunteers.map((vol) => (
                <option key={vol._id} value={vol._id}>
                  {vol.fullName || vol.email}
                </option>
              ))}
            </select>
            <div className="modal-action">
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={assignVolunteer} className="btn btn-primary">Assign</button>
            </div>
          </div>
        </dialog>
      )}

      <Footer />
    </>
  );
};

export default ViewCampaignProgress;
