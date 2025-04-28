const axios = require('axios');

exports.getUserRecommendations = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required',
        });
    }

    try {
        const response = await axios.post('http://127.0.0.1:5000/recommend/user', {
            user_id: userId,
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || 'Error fetching user recommendations',
        });
    }
};

exports.getProductRecommendations = async (req, res) => {
    const { productName } = req.body;

    if (!productName) {
        return res.status(400).json({
            success: false,
            message: 'Product name is required',
        });
    }

    try {
        const response = await axios.post('http://127.0.0.1:5000/recommend/product', {
            product_name: productName,
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || 'Error fetching product recommendations',
        });
    }
};

exports.getFoodRecommendations = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required',
        });
    }

    try {
        const response = await axios.post('http://127.0.0.1:5000/recommend/user', {
            user_id: userId,
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || 'Error fetching food recommendations',
        });
    }
};
