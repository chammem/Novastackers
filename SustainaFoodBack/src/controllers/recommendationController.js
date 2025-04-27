const axios = require('axios');
const mongoose = require('mongoose');

// Controller to get food recommendations
exports.getFoodRecommendations = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing userId',
        });
    }

    try {
        const response = await axios.post('http://localhost:8082/update-recommendations');            user_id: parseInt(userId), // assure que c’est un integer si besoin
        });

        const recommendations = response.data.recommendations;

        if (!recommendations || recommendations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No recommendations found',
            });
        }

        return res.status(200).json({
            success: true,
            recommendations,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des recommandations:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message,
        });
    }
};

// Controller to update recommendations
exports.updateRecommendations = async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8082/api/recommendations/update');

        if (!response.data.success) {
            return res.status(500).json({
                success: false,
                message: response.data.message || 'Erreur inconnue du serveur FastAPI',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Recommandations mises à jour avec succès !',
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des recommandations:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message,
        });
    }
};

