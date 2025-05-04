FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY ./RecommendationModel/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code from the RecommendationModel directory
COPY ./RecommendationModel/* . 

# Copy recommendation_api.py from the root of the project
COPY ./recommendation_api.py .

# Expose the Flask port
EXPOSE 5000

# Ensure the recommendation_api.py file is present
CMD ["python", "recommendation_api.py"]
