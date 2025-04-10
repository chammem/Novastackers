import React, { useEffect, useState } from "react";
import axios from "axios";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token"); // ou "accessToken" selon ton app
        const response = await axios.get("http://localhost:5000/api/recommendations", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRecommendations(response.data.recommended_foods || []);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des recommandations:", error);
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <p>Chargement des recommandations...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Vos recommandations</h2>
      {recommendations.length > 0 ? (
        <ul className="space-y-2">
          {recommendations.map((food, index) => (
            <li key={index} className="p-3 bg-gray-100 rounded shadow">
              <strong>{food.name}</strong>
              <p>{food.description}</p>
              {food.image && (
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-32 h-32 object-cover mt-2 rounded"
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune recommandation pour le moment.</p>
      )}
    </div>
  );
};

export default Recommendations;
