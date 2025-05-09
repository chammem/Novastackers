# Novastackers
this is a repository for our sustainaFood website project
# 🥗 Sustaina Food

> A smart food donation and delivery application leveraging AI, React, Express.js, and DevOps principles.

## 📚 Overview

**Sustaina Food** is a web application designed to reduce food waste by connecting donors, restaurants, volunteers, and recipients through a smart logistics system. Built as part of an academic project at **#Esprit_school_of_engineering**, the platform aims to optimize food redistribution using modern web technologies and artificial intelligence.

---

## 🚀 Features

- 🛒 Food donation management
- 📦 Delivery route optimization using AI
- 👥 Role-based access: donors, volunteers, NGOs, and admins
- 🔒 Secure authentication & authorization
- 📈 Real-time monitoring and analytics
- 🧪 Integrated CI/CD with DevOps tools

---

## 🛠️ Technologies Used

- **Frontend**: React.js (with Hooks and Context API)
- **Backend**: Express.js (Node.js)
- **Database**: MongoDB 
- **AI**: ORS /Route optimization using algorithms (e.g., A*, Dijkstra or ML model)
- **ML** :recommendation
- **DevOps**:
  - Docker, Docker Compose
  - GitHub Actions / Jenkins
  - SonarQube, Nexus, Prometheus & Grafana
- **Other Tools**: Postman, Git, Figma (UI/UX)

---

## ⚙️ Setup Instructions

### 📦 Prerequisites

- Node.js v18+
- npm 
- Docker & Docker Compose (for DevOps setup)
- MongoDB

### 💻 Local Installation

```bash
# Clone the repository
git clone  https://github.com/alasalah123/Novastackers.git
cd Novastackers

# Setup backend
cd SustainaFoodBack
npm install
npm run dev
# Setup frontend
cd SustainaFoodFront
npm install
npm run dev
#run the python recommendation
python recommendation-api.py
#run devops 
docker-compose up --build
