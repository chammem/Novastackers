import sys
import os
from flask import Flask, request, jsonify
from joblib import load
from scipy.sparse import load_npz

# Ensure current directory is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Now import from recommandation.py
from recommandation import content_based_recommendations, hybrid_recommendations

app = Flask(__name__)

# Print current working directory and files for debugging
print(f"Current working directory: {os.getcwd()}")
print(f"Files in directory: {os.listdir('.')}")
print(f"Files in model directory: {os.listdir('model') if os.path.exists('model') else 'model dir not found'}")

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
    try:
        # Log request details
        print(f"Received product recommendation request")
        data = request.json
        print(f"Request data: {data}")
        
        if not data:
            print("No request data received")
            return jsonify({'success': False, 'message': 'No request data provided'}), 400
            
        product_name = data.get('product_name')
        print(f"Product name: {product_name}")

        if not product_name:
            print("No product name in request")
            return jsonify({'success': False, 'message': 'Product name is required'}), 400

        try:
            # Add debug information
            print(f"Calling content_based_recommendations for product: {product_name}")
            recommendations = content_based_recommendations(product_name)
            print(f"Recommendations result: {recommendations}")
            
            return jsonify(recommendations)
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error in recommender function: {str(e)}")
            print(f"Traceback: {error_trace}")
            return jsonify({'success': False, 'message': f'Recommendation error: {str(e)}'}), 500
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Global error in endpoint: {str(e)}")
        print(f"Traceback: {error_trace}")
        return jsonify({'success': False, 'message': f'API error: {str(e)}'}), 500

# Add a simple test endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'recommendation-api'})

if __name__ == '__main__':
    # Listen on all network interfaces (0.0.0.0) instead of just localhost
    app.run(host='0.0.0.0', port=5000, debug=True)