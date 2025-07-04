# -*- coding: utf-8 -*-
"""recommandation.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1VnjxYX04harE8S8fctVfgADl2u4oDDpZ
"""


# -*- coding: utf-8 -*-
"""recommandation_optimisee.py

Modèle de recommandation optimisé pour Instacart Market Basket Analysis
"""

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from joblib import dump, load
from scipy.sparse import csr_matrix, save_npz, load_npz
import os
import json
import sys
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constantes
SAMPLE_SIZE = 0.1  # Fraction des données à utiliser
MIN_PRODUCT_PURCHASES = 5  # Nombre minimum d'achats 
MIN_USER_ORDERS = 3  # Nombre minimum de commandes 
DATA_DIR = 'data'
MODEL_DIR = 'model'

def load_sample_data(dataset_path):
    """Charge un échantillon des données avec filtrage des utilisateurs/produits peu actifs"""
    logger.info("Chargement des données avec échantillonnage...")
    
    try:
        # Chargement avec types optimisés
        dtype = {
            'order_id': 'int32', 
            'user_id': 'int32',
            'product_id': 'int32',
            'add_to_cart_order': 'int16',
            'reordered': 'int8'
        }
        
        # Chargement partiel des données
        orders = pd.read_csv(os.path.join(dataset_path, 'orders.csv'), 
                          dtype={'order_id': 'int32', 'user_id': 'int32'},
                          nrows=int(1e6) if SAMPLE_SIZE < 1.0 else None)
        
        order_products = pd.read_csv(
            os.path.join(dataset_path, 'order_products__prior.csv'),
            dtype=dtype,
            nrows=int(3e6) if SAMPLE_SIZE < 1.0 else None
        )
        
        products = pd.read_csv(os.path.join(dataset_path, 'products.csv'),
                            dtype={'product_id': 'int32', 'aisle_id': 'int16', 'department_id': 'int8'})
        
        aisles = pd.read_csv(os.path.join(dataset_path, 'aisles.csv'))
        
        # Fusion des données
        merged = order_products.merge(orders, on='order_id')
        merged = merged.merge(products, on='product_id')
        merged = merged.merge(aisles, on='aisle_id')
        
        # Filtrage des utilisateurs et produits peu actifs
        user_counts = merged['user_id'].value_counts()
        active_users = user_counts[user_counts >= MIN_USER_ORDERS].index
        
        product_counts = merged['product_id'].value_counts()
        active_products = product_counts[product_counts >= MIN_PRODUCT_PURCHASES].index
        
        filtered_data = merged[
            (merged['user_id'].isin(active_users)) & 
            (merged['product_id'].isin(active_products))
        ]
        
        logger.info(f"Données filtrées: {len(filtered_data)} lignes "
                   f"({len(active_users)} utilisateurs, {len(active_products)} produits)")
        
        return filtered_data, products.merge(aisles, on='aisle_id')
    
    except Exception as e:
        logger.error(f"Erreur lors du chargement: {str(e)}")
        raise

def prepare_sparse_matrix(data):
    """Crée une matrice sparse utilisateur-produit optimisée"""
    logger.info("Préparation de la matrice sparse...")
    
    try:
        # Création des mappings
        user_ids = data['user_id'].unique()
        product_ids = data['product_id'].unique()
        
        user_map = {u: i for i, u in enumerate(user_ids)}
        product_map = {p: i for i, p in enumerate(product_ids)}
        
        # Pondération par réachat
        data['weight'] = data['reordered'].apply(lambda x: 1.5 if x else 1.0)
        
        # Construction de la matrice CSR directement pour économiser de la mémoire
        row_ind = data['user_id'].map(user_map)
        col_ind = data['product_id'].map(product_map)
        values = data['weight']
        
        matrix = csr_matrix(
            (values, (row_ind, col_ind)),
            shape=(len(user_ids), len(product_ids)))
        
        logger.info(f"Matrice créée: {matrix.shape[0]} utilisateurs x {matrix.shape[1]} produits")
        logger.info(f"Nombre d'interactions: {matrix.nnz}")
        
        return matrix, user_map, product_map
    
    except Exception as e:
        logger.error(f"Erreur lors de la création de la matrice: {str(e)}")
        raise

def train_hybrid_model(matrix, product_info):
    """Entraîne un modèle hybride KNN + contenu"""
    logger.info("Entraînement du modèle hybride...")
    
    try:
        # Modèle de similarité collaborative
        cf_model = NearestNeighbors(
            metric='cosine', 
            algorithm='brute', 
            n_neighbors=20
        )
        cf_model.fit(matrix)
        logger.info("Modèle collaboratif entraîné")
        
        # Modèle de similarité basé sur le contenu (TF-IDF sur les noms de produits)
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(product_info['product_name'])
        
        # Sauvegarde des artefacts
        os.makedirs(MODEL_DIR, exist_ok=True)
        dump({
            'cf_model': cf_model,
            'tfidf': tfidf,
            'tfidf_matrix': tfidf_matrix,
            'product_info': product_info
        }, os.path.join(MODEL_DIR, 'hybrid_model.joblib'))
        
        # Sauvegarde de la matrice sparse
        save_npz(os.path.join(MODEL_DIR, 'interaction_matrix.npz'), matrix)
        
        logger.info("Modèle hybride sauvegardé")
        
        return cf_model, tfidf, tfidf_matrix
    
    except Exception as e:
        logger.error(f"Erreur lors de l'entraînement: {str(e)}")
        raise

def hybrid_recommendations(user_id, user_map, matrix, n=10):
    """Génère des recommandations hybrides pour un utilisateur"""
    try:
        # Charger le modèle hybride
        artifacts = load(os.path.join(MODEL_DIR, 'hybrid_model.joblib'))
        cf_model = artifacts['cf_model']
        product_info = artifacts['product_info']
        
        # Vérifier si l'utilisateur existe
        if user_id not in user_map:
            return {'success': False, 'message': 'User not found'}
        
        user_idx = user_map[user_id]
        
        # 1. Recommandations collaboratives
        distances, indices = cf_model.kneighbors(matrix[user_idx])
        
        # Obtenir les IDs des produits recommandés
        product_ids = [list(product_map.keys())[list(product_map.values()).index(i)] for i in indices[0]]
        
        # 2. Fusion avec similarité de contenu
        recommendations = []
        for pid in product_ids[:n*2]:  # Prendre plus que nécessaire pour filtrer
            product = product_info[product_info['product_id'] == pid].iloc[0]
            recommendations.append({
                'product_id': int(pid),
                'product_name': product['product_name'],
                'aisle': product['aisle'],
                'score': 1.0  # Score initial basé sur CF
            })
        
        # 3. Diversification (éviter trop de produits similaires)
        unique_aisles = set()
        final_recommendations = []
        
        for rec in sorted(recommendations, key=lambda x: -x['score']):
            if rec['aisle'] not in unique_aisles or len(unique_aisles) >= 5:
                final_recommendations.append(rec)
                unique_aisles.add(rec['aisle'])
                if len(final_recommendations) >= n:
                    break
        
        return {'success': True, 'recommendations': final_recommendations}
    
    except Exception as e:
        return {'success': False, 'message': str(e)}

def content_based_recommendations(product_name, n=10):
    """Recommandations basées sur le contenu pour un produit"""
    try:
        artifacts = load(os.path.join(MODEL_DIR, 'hybrid_model.joblib'))
        tfidf = artifacts['tfidf']
        tfidf_matrix = artifacts['tfidf_matrix']
        product_info = artifacts['product_info']
        
        # Trouver le produit
        product_row = product_info[product_info['product_name'].str.lower() == product_name.lower()]
        if product_row.empty:
            return {'success': False, 'message': 'Product not found'}
        
        # Calculer la similarité avec TF-IDF
        product_idx = product_row.index[0]
        cosine_similarities = linear_kernel(tfidf_matrix[product_idx], tfidf_matrix).flatten()
        related_indices = cosine_similarities.argsort()[-n-1:-1][::-1]
        
        recommendations = []
        for idx in related_indices:
            product = product_info.iloc[idx]
            recommendations.append({
                'product_id': int(product['product_id']),
                'product_name': product['product_name'],
                'aisle': product['aisle'],
                'score': float(cosine_similarities[idx])
            })
        
        # Filtrer les recommandations basées sur la similarité > 0.75
        recommendations = [
            rec for rec in recommendations if isinstance(rec['score'], (int, float)) and rec['score'] > 0.75
        ]

        return {'success': True, 'recommendations': recommendations}
    
    except Exception as e:
        return {'success': False, 'message': str(e)}

def main():
    try:
        # Chargement des données
        dataset_path = "data"  # Modifier selon votre structure
        data, product_info = load_sample_data(dataset_path)
        
        # Préparation de la matrice
        matrix, user_map, product_map = prepare_sparse_matrix(data)
        
        # Entraînement du modèle
        train_hybrid_model(matrix, product_info)
        
        # Sauvegarde des mappings
        dump({
            'user_map': user_map,
            'product_map': product_map
        }, os.path.join(MODEL_DIR, 'mappings.joblib'))
        
        # Exemple de recommandation
        sample_user = next(iter(user_map.keys()))
        logger.info(f"\nExemple de recommandation pour l'utilisateur {sample_user}:")
        print(json.dumps(hybrid_recommendations(sample_user, user_map, matrix), indent=2))
        
        sample_product = product_info.iloc[0]['product_name']
        logger.info(f"\nExemple de recommandation pour le produit '{sample_product}':")
        print(json.dumps(content_based_recommendations(sample_product), indent=2))
        
    except Exception as e:
        logger.error(f"Erreur dans le main: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Mode API
        try:
            mappings = load(os.path.join(MODEL_DIR, 'mappings.joblib'))
            matrix = load_npz(os.path.join(MODEL_DIR, 'interaction_matrix.npz'))
            
            if sys.argv[1] == '--user':
                user_id = int(sys.argv[2])
                result = hybrid_recommendations(user_id, mappings['user_map'], matrix)
            else:
                product_name = " ".join(sys.argv[1:])
                result = content_based_recommendations(product_name)
            
            print(json.dumps(result))
            
        except Exception as e:
            print(json.dumps({'success': False, 'message': str(e)}))
    else:
        # Mode entraînement
        main()