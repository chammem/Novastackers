import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeaderMid from '../HeaderMid';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';

const CharityEventDetails = () => {
  const { id } = useParams(); // donation ID from route
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [donation, setDonation] = useState(null);
  const [ngo, setNgo] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const userResponse = await axiosInstance.get('/user-details');
        setUser(userResponse.data?.data || {});

        const res = await axiosInstance.get(`/donations/${id}/details`);
        setDonation(res.data.donation);
        setNgo(res.data.ngo);
      } catch (error) {
        toast.error('Failed to load event or user info');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleDonateClick = () => {
    toast.info(`Redirect to donate for event: ${donation._id}`);
    // You can replace this with modal or route logic
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <span className="loading loading-spinner loading-lg" />
        <p>Loading details...</p>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Donation not found</h2>
      </div>
    );
  }

  return (
    <>
      <HeaderMid />

      {/* HERO / MAIN SECTION */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10 bg-base-100 rounded-xl p-6 shadow-xl">
          
          {/* Image */}
          {donation?.imageUrl && (
            <img
              src={`http://localhost:8082/${donation.imageUrl}`}
              alt={donation.name}
              className="w-full md:w-1/2 rounded-xl object-cover max-h-[400px] shadow-md"
            />
          )}

          {/* Text Info */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-bold text-primary mb-4">{donation.name}</h2>
            <p className="text-gray-700 text-base mb-4">{donation.description}</p>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Ends on:</strong>{' '}
              {donation.endingDate
                ? new Date(donation.endingDate).toLocaleDateString()
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Location:</strong> {donation.location || 'Not specified'}
            </p>

            {['restaurant', 'supermarket'].includes(user?.role) && (
              <button
                className="btn btn-primary btn-wide mt-4"
                onClick={handleDonateClick}
              >
                🍱 Donate to This Campaign
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ORGANIZER INFO */}
      <section className="py-8 px-4 max-w-6xl mx-auto">
        <div className="bg-base-100 p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-6 text-center">Organized By</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {ngo?.logoUrl && (
              <img
                src={`http://localhost:8082${ngo.logoUrl}`}
                alt="NGO logo"
                className="w-24 h-24 object-cover rounded-full shadow"
              />
            )}
            <div>
              <h4 className="text-xl font-semibold">{ngo?.organizationName || ngo?.fullName}</h4>
              <p className="text-sm text-gray-600 italic">{ngo?.mission}</p>
              <p className="mt-2">{ngo?.description}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {ngo?.website && (
                  <a
                    href={ngo.website}
                    className="btn btn-sm btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🌐 Website
                  </a>
                )}
                {ngo?.instagram && (
                  <a href={ngo.instagram} className="btn btn-sm btn-outline btn-info">
                    📷 Instagram
                  </a>
                )}
                {ngo?.twitter && (
                  <a href={ngo.twitter} className="btn btn-sm btn-outline btn-accent">
                    🐦 Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CharityEventDetails;
