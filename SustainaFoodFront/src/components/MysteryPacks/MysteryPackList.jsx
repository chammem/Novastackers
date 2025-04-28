import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MysteryPackCard from './MysteryPackCard';

const MysteryPackList = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await axios.get('http://localhost:8082/api/mystery-packs');

        setPacks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load mystery packs');
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-8">
      {packs.map((pack) => (
        <MysteryPackCard key={pack._id} pack={pack} />
      ))}
    </div>
  );
};

export default MysteryPackList;
