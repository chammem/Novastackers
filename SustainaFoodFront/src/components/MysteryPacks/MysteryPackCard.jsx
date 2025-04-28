import React from 'react';
import axios from 'axios';

const MysteryPackCard = ({ pack }) => {
  const handleReserve = async () => {
    try {
      await axios.post(`http://localhost:5000/api/mystery-packs/${pack._id}/reserve`);
      alert('Mystery pack reserved successfully!');
    } catch (error) {
      alert('Failed to reserve mystery pack');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{pack.name}</h3>
          <div className="flex flex-col items-end">
            {pack.originalPrice && (
              <span className="text-gray-500 line-through">${pack.originalPrice}</span>
            )}
            <span className="text-green-600 font-bold">${pack.discountedPrice}</span>
          </div>
        </div>
        <p className="mt-2 text-gray-700">{pack.description}</p>
        <button
          onClick={handleReserve}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Reserve
        </button>
      </div>
    </div>
  );
};

export default MysteryPackCard;
//