import React, { useState, useEffect } from 'react';
import { getFoodRecommendations } from '../services/foodService';
import { useAuth } from '../context/AuthContext';

const FoodRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !user._id) return;

      try {
        const data = await getFoodRecommendations(user._id);
        setRecommendations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Recommended for You</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item) => (
          <div key={item._id} className="card bg-base-100 shadow-md p-4">
            <img src={item.image_url} alt={item.name} className="h-32 w-full object-cover rounded mb-4" />
            <h2 className="text-lg font-bold">{item.name}</h2>
            <p>Price: ${item.price}</p>
            {item.discountedPrice && <p>Discounted Price: ${item.discountedPrice}</p>}
            <p>Category: {item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodRecommendations;