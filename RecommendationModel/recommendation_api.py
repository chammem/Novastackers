from flask import Flask, request, jsonify
from recommandation import content_based_recommendations, hybrid_recommendations
from joblib import load
from scipy.sparse import load_npz
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import os

app = Flask(__name__)

# Charger les artefacts nécessaires
MODEL_DIR = 'model'
mappings = load(os.path.join(MODEL_DIR, 'mappings.joblib'))
interaction_matrix = load_npz(os.path.join(MODEL_DIR, 'interaction_matrix.npz'))

@app.route('/recommend/user', methods=['POST'])
def recommend_for_user():
    data = request.json
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'success': False, 'message': 'User ID is required'}), 400

    try:
        recommendations = hybrid_recommendations(user_id, mappings['user_map'], interaction_matrix)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/recommend/product', methods=['POST'])
def recommend_for_product():
    data = request.json
    product_name = data.get('product_name')

    if not product_name:
        return jsonify({'success': False, 'message': 'Product name is required'}), 400

    try:
        recommendations = content_based_recommendations(product_name)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route("/recommendations/content", methods=["GET"])
def content_recommendations():
    content_based_recommendations()
    return {"message": "Content-based recommendations executed successfully."}

@app.route("/recommendations/hybrid", methods=["GET"])
def hybrid_recommendations_route():
    hybrid_recommendations()
    return {"message": "Hybrid recommendations executed successfully."}

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
