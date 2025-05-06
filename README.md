# Novastackers
this is a repository for our sustainaFood website project
🥗 Sustaina Food — Novastackers
A smart food donation and delivery application leveraging AI, React, Express.js, and DevOps principles.

📚 Overview
Sustaina Food is a web application designed to reduce food waste by connecting donors, restaurants, volunteers, and recipients through a smart logistics system. Built as part of an academic project at #Esprit_School_of_Engineering, the platform aims to optimize food redistribution using modern web technologies and artificial intelligence.

🚀 Features
🛒 Food donation management

📦 Delivery route & recommendation optimization using AI

👥 Role-based access: Restaurant, User, Admin, NGO, Driver

🔒 Secure authentication & authorization

📈 Real-time monitoring and analytics

🧪 CI/CD integration with DevOps tools

🤖 Machine Learning-based recommendation system (Python)

🛠️ Technologies Used
Frontend: React.js (Hooks, Context API)

Backend: Express.js (Node.js)

Database: MongoDB

AI/ML: Python (Recommendation system using recommendation-api.py)

DevOps:
  - Docker, Docker Compose
  - GitHub Actions or Jenkins
  - SonarQube, Nexus
  - Prometheus & Grafana (monitoring)

Tools: Git, Postman, Figma

⚙️ Setup Instructions
📦 Prerequisites
Node.js v18+

npm

Python 3.8+

Docker & Docker Compose

MongoDB (local or cloud)

💻 Local Installation
1. Clone the Repository

git clone https://github.com/alasalah123/Novastackers.git
cd Novastackers
2. Setup Backend

cd SustainaFoodBack
npm install
npm run dev
3. Setup Frontend

cd ../SustainaFoodFront
npm install
npm run dev
4. Run the Python Recommendation API
t
cd ../recommendation-api
pip install -r requirements.txt
python recommendation-api.py
📊 DevOps
To build and run the full system with Docker:


docker-compose up --build
Jenkins, SonarQube, Nexus, Prometheus, and Grafana are configured in the devops/ directory.
