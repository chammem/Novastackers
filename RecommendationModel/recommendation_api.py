from flask import Flask, request, jsonify
from recommandation import content_based_recommendations, hybrid_recommendations
from joblib import load
from scipy.sparse import load_npz
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

if __name__ == '__main__':
    # Listen on all network interfaces (0.0.0.0) instead of just localhost
    app.run(host='0.0.0.0', port=5000, debug=True)