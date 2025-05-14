import React, { useState, useEffect } from 'react';
import { getMysteryPacks } from '../services/mysteryPackApi';

const MysteryPackList = () => {
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState(null);

  const fetchPacks = async () => {
    try {
      const response = await getMysteryPacks();
      setPacks(response.data);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setError('Failed to fetch mystery packs');
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Mystery Packs</h1>
      <ul>
        {packs.map(pack => (
          <li key={pack._id}>
            <h2>{pack.name}</h2>
            <p>{pack.description}</p>
            <p>Original Price: {pack.originalPrice}</p>
            <p>Discounted Price: {pack.discountedPrice}</p>
            <p>Available Quantity: {pack.availableQuantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MysteryPackList;