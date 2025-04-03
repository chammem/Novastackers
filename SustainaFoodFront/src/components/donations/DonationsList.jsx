import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import HeaderMid from '../HeaderMid';
import { debounce } from 'lodash';
import Footer from '../Footer';
import AddFoodToDonation from './AddFoodToDonation';
import { useNavigate } from 'react-router-dom';


const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [businessId, setBusinessId] = useState('');
  const navigate = useNavigate();
  const [user,setUser] = useState();
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      try {
        setIsSearching(true);
        const response = await axiosInstance.get('/donations/get-donations-by-ngo', {
          params: { search: term },
        });
        setFilteredDonations(response.data);
      } catch (error) {
        toast.error('Failed to search donations');
        setFilteredDonations([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    debouncedSearch('');
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await axiosInstance.get('/user-details');
        setBusinessId(userResponse.data?.data?._id || '');
        setUserRole(userResponse.data?.data?.role || '');
        setUser(userResponse.data?.data)
        const donationsResponse = await axiosInstance.get('/donations/get-donations-by-ngo', {
          params: { search: '' },
        });
        setDonations(donationsResponse.data);
        setFilteredDonations(donationsResponse.data);
      } catch (error) {
        toast.error('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleVolunteer = async (donationId) => {
    try {
      await axiosInstance.post(`/donations/${donationId}/volunteer`, {
        userId: user._id,
      });
        toast.success("You've volunteered for this campaign!");
    } catch (error) {
      toast.error("Failed to volunteer for this campaign.");
      console.error(error);
    }
  };
  


  if (isLoading) {
    return (
      <div className="text-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
        <p>Loading donations...</p>
      </div>
    );
  }

  return (
    <>
      <HeaderMid />

      {/* HERO / TOP SECTION */}
      <section className="py-12 md:py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Text Column */}
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Where to Donate Surplus Food Now
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mb-4">
              Help prevent food waste and feed those in need by donating surplus food. 
              Every contribution makes a difference and ensures that perfectly good meals 
              don’t end up in the landfill. Together, let's fight hunger!
            </p>
          </div>

          {/* Image Column */}
          <div className="w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-xl">
          <img
            src="/images/hungry.jpg"
            alt="Child in hunger"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>


        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Find a Food Donation Campaign</h2>
            <p className="text-gray-600 mt-2">
              Search for organizations accepting donations now
            </p>
          </div>

          <div className="mb-8 max-w-xl mx-auto">
            <div className="form-control">
              <div className="relative">
              <input
                type="text"
                placeholder="Search NGO by name..."
                className="input input-lg input-bordered w-full pl-4 pr-14"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              />

              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-info btn-sm"
                type="button"
                onClick={() => debouncedSearch(searchTerm)}
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  '🔍'
                )}
              </button>

              </div>
            </div>
            {searchTerm && (
              <div className="mt-2 text-right">
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-primary hover:text-secondary transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DONATIONS GRID SECTION */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            Active Food Donation Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDonations.length > 0 ? (
              filteredDonations.map((donation) => (
                <div
                    key={donation._id}
                    className="card bg-base-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-in-out border border-base-300"
                  >
                    {donation.imageUrl && (
                      <figure className="overflow-hidden">
                        <img
                          src={`http://localhost:8082/${donation.imageUrl}`}
                          alt={donation.name}
                          className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </figure>
                    )}
                    <div className="card-body">
                      <h3 className="card-title text-xl font-semibold text-primary-content">
                        {donation.name}
                      </h3>
                      {donation.description && (
                        <p className="text-base text-gray-500 mt-2">{donation.description}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                      <button
                        className="btn btn-outline btn-accent btn-sm"
                        onClick={() => navigate(`/donations/${donation._id}`)}
                      >
                        View Details
                      </button>

                        {userRole === 'restaurant' && (
                          <button
                            onClick={() => setSelectedDonationId(donation._id)}
                            className="btn btn-primary btn-sm"
                          >
                            ➕ Donate Food
                          </button>
                        )}
                        {userRole === 'volunteer' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleVolunteer(donation._id)}
                          >
                            🙋 Volunteer
                          </button>
                        )}

                      </div>
                    </div>
                  </div>

              ))
            ) : (
              <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto bg-base-100 p-6 rounded-xl shadow-md">
                <span className="text-6xl">🙁</span>
                <h3 className="mt-4 text-2xl font-bold text-error">No donations found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search or clearing filters.</p>
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 btn btn-outline btn-error"
                  >
                    Clear Search Filters
                  </button>
                )}
              </div>
            </div>
            
            )}
          </div>

          {selectedDonationId && (
            <AddFoodToDonation
              donationId={selectedDonationId}
              businessId={businessId}
              onClose={() => setSelectedDonationId(null)}
              onFoodAdded={(updatedDonation) => {
                setFilteredDonations((prev) =>
                  prev.map((d) => (d._id === updatedDonation._id ? updatedDonation : d))
                );
              }}
            />
          )}
        </div>
      </section>

      <section className="bg-base-200 py-12">
  <div className="max-w-4xl mx-auto text-center px-4">
    <h2 className="text-2xl font-bold mb-4">Can’t find a campaign that fits?</h2>
    <p className="text-gray-600 mb-6">
      Don’t worry — new donation campaigns are launched regularly. Or you can even start your own!
    </p>
    <div className="flex justify-center gap-4 flex-wrap">
      <button
        className="btn btn-outline btn-secondary"
        onClick={() => navigate('/contact')}
      >
        📞 Contact Us
      </button>
      {['restaurant', 'supermarket'].includes(userRole) && (
        <button
          className="btn btn-primary"
          onClick={() => navigate('/create-donation')}
        >
          ➕ Start a Donation Campaign
        </button>
      )}
    </div>
  </div>
</section>


      <Footer />
    </>
  );
};

export default DonationsList;
