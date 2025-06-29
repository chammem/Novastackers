# -*- coding: utf-8 -*-
"""Untitled2.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1xWuovInWel8UD5izhNGYgH1iXVyg75Mf
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from joblib import dump, load
import os
import json
import sys
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)



from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_blobs
import matplotlib.pyplot as plt

# Données factices
X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.60, random_state=0)
X = StandardScaler().fit_transform(X)

# Modèles
kmeans = KMeans(n_clusters=4, random_state=42)
dbscan = DBSCAN(eps=0.3, min_samples=5)
agglo = AgglomerativeClustering(n_clusters=4)

# Prédictions
y_kmeans = kmeans.fit_predict(X)
y_dbscan = dbscan.fit_predict(X)
y_agglo = agglo.fit_predict(X)

# Visualisation
fig, axs = plt.subplots(1, 3, figsize=(15, 4))
axs[0].scatter(X[:, 0], X[:, 1], c=y_kmeans, cmap='rainbow')
axs[0].set_title("KMeans")
axs[1].scatter(X[:, 0], X[:, 1], c=y_dbscan, cmap='rainbow')
axs[1].set_title("DBSCAN")
axs[2].scatter(X[:, 0], X[:, 1], c=y_agglo, cmap='rainbow')
axs[2].set_title("Agglomerative")
plt.show()

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from joblib import dump, load
import os
import json
import sys
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Chargement des données
def load_data(file_path):
 try:
      df = pd.read_csv(file_path)
      logger.info(f"Données chargées depuis {file_path}, dimensions: {df.shape}")
      return df
 except Exception as e:
       logger.error(f"Erreur lors du chargement du fichier : {e}")
       sys.exit(1)

# Prétraitement
 def preprocess_data(df, features):
    df_clean = df.dropna(subset=features)
    X = df_clean[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    logger.info("Données normalisées pour la segmentation")
    return X_scaled, df_clean

# Segmentation avec KMeans
def segment_clients(X_scaled, n_clusters=5):
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(X_scaled)
    silhouette = silhouette_score(X_scaled, cluster_labels)
    logger.info(f"Score de silhouette: {silhouette:.2f}")
    return kmeans, cluster_labels

# Sauvegarde du modèle
def save_model(model, filename):
   dump(model, filename)
   logger.info(f"Modèle sauvegardé dans {filename}")

# Sauvegarde des résultats
def save_segmented_data(df, labels, output_file):
    df['Segment'] = labels
    df.to_csv(output_file, index=False)
    logger.info(f"Données segmentées sauvegardées dans {output_file}")

# Point d'entrée
    if __name__ == "__main__":
     file_path = '/content/drive/MyDrive/order.csv'  # Adapter le chemin
     output_path = 'segmented_clients.csv'
     model_path = 'kmeans_segmentation.joblib'

     features = ['order_count', 'avg_spending', 'recency_days']  # À adapter selon tes données

     df = load_data(file_path)
     X_scaled, df_clean = preprocess_data(df, features)
     model, labels = segment_clients(X_scaled, n_clusters=4)
     save_segmented_data(df_clean, labels, output_path)
     save_model(model, model_path)

import pandas as pd
import numpy as np

# Chargement des données
orders = pd.read_csv('orders.csv')
order_products = pd.read_csv('order_products__prior.csv')

# Merge des deux datasets
data = pd.merge(order_products, orders, on='order_id', how='inner')

# Calcul du nombre de commandes par utilisateur
order_count = data.groupby('user_id')['order_id'].nunique().reset_index()
order_count.columns = ['user_id', 'order_count']

# Calcul du nombre moyen de produits par commande (panier moyen)
avg_spending = data.groupby('user_id')['product_id'].count().reset_index()
avg_spending.columns = ['user_id', 'total_products']
avg_spending = avg_spending.merge(order_count, on='user_id')
avg_spending['avg_spending'] = avg_spending['total_products'] / avg_spending['order_count']
avg_spending = avg_spending[['user_id', 'avg_spending']]

# Calcul de la récence : combien de jours (ordres) depuis la dernière commande
last_orders = orders[orders['eval_set'] == 'prior'].groupby('user_id')['order_number'].max().reset_index()
last_orders.columns = ['user_id', 'last_order_number']
max_order = orders['order_number'].max()
last_orders['recency_days'] = max_order - last_orders['last_order_number']

# Fusion finale
segmentation_df = order_count.merge(avg_spending, on='user_id').merge(last_orders[['user_id', 'recency_days']], on='user_id')

# Sauvegarde
segmentation_df.to_csv('segmentation_input.csv', index=False)
print("✅ Fichier 'segmentation_input.csv' généré avec succès.")

file_path = 'segmentation_input.csv'

from google.colab import drive
drive.mount('/content/drive')

import os
file_path = '/content/drive/MyDrive/segmentation_input.csv'
print(os.path.exists(file_path))  # Cela devrait afficher True

import pandas as pd
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_data(file_path):
    try:
      if not os.path.exists(file_path):
          raise FileNotFoundError(f"Fichier introuvable à l'emplacement : {file_path}")
          df = pd.read_csv(file_path)
          logger.info(f"Données chargées depuis {file_path}, dimensions: {df.shape}")
          return df
    except FileNotFoundError as e:
            logger.error(f"Erreur lors du chargement du fichier : {e}")
            return None  # Évite les erreurs en chaîne dans Colab

import pandas as pd
import numpy as np

# Chargement des données
orders = pd.read_csv('orders.csv')
order_products = pd.read_csv('order_products__prior.csv')

# Merge des deux datasets
data = pd.merge(order_products, orders, on='order_id', how='inner')

# Calcul du nombre de commandes par utilisateur
order_count = data.groupby('user_id')['order_id'].nunique().reset_index()
order_count.columns = ['user_id', 'order_count']

# Calcul du nombre moyen de produits par commande (panier moyen)
avg_spending = data.groupby('user_id')['product_id'].count().reset_index()
avg_spending.columns = ['user_id', 'total_products']
avg_spending = avg_spending.merge(order_count, on='user_id')
avg_spending['avg_spending'] = avg_spending['total_products'] / avg_spending['order_count']
avg_spending = avg_spending[['user_id', 'avg_spending']]

# Calcul de la récence : combien de jours (ordres) depuis la dernière commande
last_orders = orders[orders['eval_set'] == 'prior'].groupby('user_id')['order_number'].max().reset_index()
last_orders.columns = ['user_id', 'last_order_number']
max_order = orders['order_number'].max()
last_orders['recency_days'] = max_order - last_orders['last_order_number']

# Fusion finale
segmentation_df = order_count.merge(avg_spending, on='user_id').merge(last_orders[['user_id', 'recency_days']], on='user_id')

# Sauvegarde
segmentation_df.to_csv('segmentation_input.csv', index=False)
print("✅ Fichier 'segmentation_input.csv' généré avec succès.")

file_path = 'segmentation_input.csv'

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from joblib import dump
import logging
import sys

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Chargement des données
def load_data(file_path):
  try:
     df = pd.read_csv(file_path)
     logger.info(f"Données chargées depuis {file_path}, dimensions: {df.shape}")
     return df
  except Exception as e:
      logger.error(f"Erreur lors du chargement du fichier : {e}")
      sys.exit(1)

# Prétraitement
def preprocess_data(df, features):
    df_clean = df.dropna(subset=features)
    X = df_clean[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    logger.info("Données normalisées pour la segmentation")
    return X_scaled, df_clean

# Segmentation KMeans
def segment_clients(X_scaled, n_clusters=4):
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(X_scaled)
    silhouette = silhouette_score(X_scaled, cluster_labels)
    logger.info(f"Score de silhouette: {silhouette:.2f}")
    return kmeans, cluster_labels

# Sauvegarde
def save_model(model, filename):
    dump(model, filename)
    logger.info(f"Modèle sauvegardé dans {filename}")

def save_segmented_data(df, labels, output_file):
    df['Segment'] = labels
    df.to_csv(output_file, index=False)
    logger.info(f"Données segmentées sauvegardées dans {output_file}")

# === Point d'entrée ===
if __name__ == "__main__":
   file_path = 'segmentation_input.csv'
   output_path = 'segmented_clients.csv'
   model_path = 'kmeans_segmentation.joblib'
   features = ['order_count', 'avg_spending', 'recency_days']

   df = load_data(file_path)
   X_scaled, df_clean = preprocess_data(df, features)
   model, labels = segment_clients(X_scaled, n_clusters=4)
   save_segmented_data(df_clean, labels, output_path)
   save_model(model, model_path)

df = pd.read_csv('segmented_clients.csv')
df.head()

from google.colab import drive
drive.mount('/content/drive')
# Définir le chemin du modèle
model_path = 'model/segmentation_model.joblib'

# Vérifier si le répertoire 'model' existe, sinon le créer
if not os.path.exists('model'):
    os.makedirs('model')

    # Sauvegarder le modèle
    dump(kmeans, model_path)
    print(f"Modèle sauvegardé dans {model_path}")

import os
from joblib import dump, load

MODEL_DIR = 'model'

# Vérifie si le modèle existe
model_path = os.path.join(MODEL_DIR, 'segmentation_model.joblib')

if not os.path.exists(model_path):
    print(f"Le modèle '{model_path}' n'existe pas. Création du modèle...")
        # Code pour entraîner et sauvegarder le modèle
            # Exemple avec un modèle KMeans
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Charger les données (exemple)
df = pd.read_csv('segmentation_input.csv')
features = ['order_count', 'avg_spending', 'recency_days']
X = df[features]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=2)
kmeans.fit(X_scaled)

# Sauvegarder le modèle
dump(kmeans, model_path)
print(f"Modèle sauvegardé dans {model_path}")
import os
for f in os.listdir("/content/drive/MyDrive"):
    print(f)