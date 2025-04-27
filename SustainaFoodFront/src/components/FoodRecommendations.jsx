import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../services/recommendationService';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const FoodRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;

      try {
        const data = await getRecommendations(user._id);
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) {
    return <div className="text-center py-10">Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return <div className="text-center py-10">No recommendations available at the moment.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item, index) => (
          <motion.div
            key={item._id}
            className="card bg-base-100 shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <figure className="h-48 w-full relative">
              <img
                src={item.image || '/public/images/default-food.jpg'}
                alt={item.name || 'Recommended food'}
                className="h-full w-full object-cover"
              />
            </figure>
            <div className="card-body">
              <h3 className="card-title">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
              <div className="mt-2">
                <span className="text-lg font-semibold text-accent">${item.price}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoodRecommendations;