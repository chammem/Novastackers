# Use a slim Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy requirements.txt from RecommendationModel directory
COPY ./RecommendationModel/requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy recommendation_api.py from the root directory
COPY ./recommendation_api.py /app/

# Expose the Flask port
EXPOSE 5000

# Run the Flask application
CMD ["python", "recommendation_api.py"]
