FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Define Stripe environment variables (not recommended for production)
ENV STRIPE_SECRET_KEY=sk_test_51PBvGnLL07YA4hLRXv0sUDrs5GbVtAQwYcN6LApiBzqks31eCJG2HPJNVT5ikfZglkKUvzIg5yOD2HbmmoPICiAc00CCJWHDBB
ENV STRIPE_PUBLIC_KEY=pk_test_51PBvGnLL07YA4hLR0uA32N74XSqQe7t0vNYs1LECso1AdojU6hS4FDisCqLcuFYkBSKHLjDcWLfQk0Ofe7Ofgl9i00Fdsetk5J
ENV STRIPE_WEBHOOK_SECRET=whsec_6eca7d9c962d315079ce9a0753f252c558edbf7e048df396a139d42be66a9680

EXPOSE 8082
CMD ["npm", "start"]