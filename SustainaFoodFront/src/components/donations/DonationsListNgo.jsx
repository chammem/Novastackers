import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const DonationListNgo = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const userRes = await axiosInstance.get('/user-details');
        const user = userRes.data?.data;
        setUserRole(user.role || '');

        const campaignsRes = await axiosInstance.get(`/donations/get-donation-by-id/${user._id}`);
        setCampaigns(campaignsRes.data);
      } catch (error) {
        toast.error('Failed to load campaigns');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <span className="loading loading-spinner loading-lg" />
        <p className="mt-4 text-lg text-gray-600">Loading your campaigns...</p>
      </div>
    );
  }

  return (
    <>
      <HeaderMid />

      {/* HERO SECTION */}
      <section className="py-12 md:py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Text Column */}
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Manage Your Food Donation Campaigns
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mb-4">
              Keep track of your active campaigns, monitor food donations,
              and launch new initiatives to fight hunger and reduce food waste in your community.
            </p>
            <Link to="/donationForm"
              className="btn btn-primary"
              onClick={() => navigate('/create-donation')}
            >
              ➕ Create New Campaign
            </Link>
          </div>

          {/* Image Column */}
          <div className="w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-xl">
            <img
              src="/images/hungry.jpg"
              alt="Donation campaign visual"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* SEARCH SECTION - STYLED ONLY */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Find Your Campaigns</h2>
            <p className="text-gray-600 mt-2">
              Search by name or location to quickly access your donation drives
            </p>
          </div>

          <div className="mb-8 max-w-xl mx-auto">
            <div className="form-control">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search campaign by name..."
                  className="input input-lg input-bordered w-full pl-4 pr-14"
                  disabled
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-info btn-sm"
                  disabled
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAMPAIGN GRID SECTION */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-primary">
            Your Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="card bg-base-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-in-out border border-base-300"
                >
                  {campaign.imageUrl && (
                    <figure className="overflow-hidden">
                      <img
                        src={`http://localhost:8082/${campaign.imageUrl}`}
                        alt={campaign.name}
                        className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h3 className="card-title text-xl font-semibold text-primary-content">
                      {campaign.name}
                    </h3>
                    <p className="text-base text-gray-500 mt-2 line-clamp-3">
                      {campaign.description}
                    </p>
                    <div className="mt-4 text-sm text-gray-500 space-y-1">
                      📍 <strong>Location:</strong> {campaign.location || 'N/A'}<br />
                      🗓️ <strong>Ends:</strong>{' '}
                      {campaign.endingDate
                        ? new Date(campaign.endingDate).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div className="mt-4">
                      <button
                        className="btn btn-outline btn-accent btn-sm w-full"
                        onClick={() => navigate(`/my-campaigns/${campaign._id}`)}
                      >
                        🔍 View Campaign Progress
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto bg-base-100 p-6 rounded-xl shadow-md">
                  <span className="text-6xl">😕</span>
                  <h3 className="mt-4 text-2xl font-bold text-error">No campaigns yet</h3>
                  <p className="mt-2 text-gray-500">
                    Get started by creating your first campaign.
                  </p>
                  <button
                    onClick={() => navigate('/create-donation')}
                    className="mt-4 btn btn-primary"
                  >
                    ➕ Create Campaign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-base-200 py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Want to launch another campaign?</h2>
          <p className="text-gray-600 mb-6">
            You can create multiple campaigns to support different locations or needs.
            Let’s maximize your impact!
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              className="btn btn-outline btn-secondary"
              onClick={() => navigate('/contact')}
            >
              📞 Contact Support
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/create-donation')}
            >
              ➕ Launch New Campaign
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default DonationListNgo;
