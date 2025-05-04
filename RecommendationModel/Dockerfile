FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the Flask port
EXPOSE 5000

# Run the Flask application
CMD ["python", "recommendation_api.py"]
