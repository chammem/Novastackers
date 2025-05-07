# Use a slim Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional dependencies explicitly if not listed in requirements.txt
RUN pip install pandas numpy scikit-learn joblib scipy flask

# Ensure the data and model directories are copied only if they exist


# Copy the entire RecommendationModel directory into the container
COPY . /app/

# Expose the Flask port
EXPOSE 5000

# Run recommandation.py first, then recommendation_api.py
CMD ["sh", "-c", "python recommandation.py && python recommendation_api.py"]
