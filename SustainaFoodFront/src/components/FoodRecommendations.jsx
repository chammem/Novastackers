<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { getFoodRecommendations } from '../services/foodService';
import { useAuth } from '../context/AuthContext';
=======
import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../services/recommendationService';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954

const FoodRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
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
=======

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;

      try {
        const data = await getRecommendations(user._id);
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

<<<<<<< HEAD
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
=======
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
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
        ))}
      </div>
    </div>
  );
};

export default FoodRecommendations;