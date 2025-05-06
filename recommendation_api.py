import os
from flask import Flask, request, jsonify
from joblib import load
import pandas as pd

app = Flask(__name__)

# Définir le répertoire des modèles correctement
MODEL_DIR = 'C:/Users/pc/Desktop/Sinda pi 2/Novastackers/model'  # Mets à jour ce chemin si nécessaire

try:
    # Chargement des artefacts de segmentation
    segmentation_model = load(os.path.join(MODEL_DIR, 'segmentation_model.joblib'))
    scaler = load(os.path.join(MODEL_DIR, 'scaler.joblib'))
    features = load(os.path.join(MODEL_DIR, 'features.joblib'))
except FileNotFoundError as e:
    print(f"Erreur lors du chargement des modèles: {e}")
    exit(1)  # Quitter le programme si les fichiers ne sont pas trouvés

@app.route('/segment', methods=['POST'])
def segment_data():
    data = request.json

    try:
        df = pd.DataFrame([data])  # Une seule instance par appel
        missing = [col for col in features if col not in df.columns]
        if missing:
            return jsonify({'success': False, 'message': f'Missing features: {missing}'}), 400

        X_scaled = scaler.transform(df[features])
        segment = segmentation_model.predict(X_scaled)[0]

        return jsonify({'success': True, 'segment': int(segment)})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
