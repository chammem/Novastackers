const Recommendation = require('../models/recommandation');

exports.getFoodRecommendations = async (req, res) => {
    const { userId } = req.params;

    try {
        const recommendations = await Recommendation.findOne({ user_id: userId }).populate('recommended_foods');
        if (!recommendations) {
            return res.status(404).json({
                success: false,
                message: 'No recommendations found for this user',
            });
        }

        res.status(200).json({
            success: true,
            data: recommendations.recommended_foods,
            message: 'Food recommendations fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching food recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch food recommendations',
            error: error.message,
        });
    }
};