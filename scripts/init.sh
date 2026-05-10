#!/bin/bash

# Initialize E-Commerce Microservices Project

set -e

echo "🚀 Initializing E-Commerce Microservices Project..."

# Create directory structure
echo "Creating directory structure..."
mkdir -p services/{api-gateway,auth-service,product-service,order-service,payment-service,notification-service}
mkdir -p frontend/nextjs-app
mkdir -p infrastructure/{kubernetes,docker,terraform}
mkdir -p monitoring/{prometheus,grafana,alertmanager}
mkdir -p ci-cd/.github/workflows
mkdir -p scripts

# Copy .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
fi

# Install dependencies for each service
echo "Installing dependencies..."

# API Gateway
cd services/api-gateway
npm init -y
npm install express express-http-proxy cors helmet morgan
cd ../..

# Auth Service
cd services/auth-service
npm init -y
npm install express pg bcrypt jsonwebtoken ioredis express-validator
cd ../..

# Product Service
cd services/product-service
npm init -y
npm install express mongoose ioredis express-validator cors helmet morgan winston
cd ../..

# Notification Service
cd services/notification-service
npm init -y
npm install amqplib ioredis nodemailer express handlebars winston dotenv
cd ../..

# Order Service
cd services/order-service
if command -v go &> /dev/null; then
    go mod init github.com/your-org/order-service
    go get github.com/gorilla/mux
    go get github.com/jackc/pgx/v4/pgxpool
    go get github.com/streadway/amqp
    go get github.com/rs/cors
fi
cd ../..

# Payment Service
cd services/payment-service
cat > requirements.txt << EOF
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
psycopg2-binary==2.9.9
pika==1.3.2
stripe==7.5.0
python-dotenv==1.0.0
EOF
cd ../..

# Frontend
cd frontend/nextjs-app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ../..

# Set up Git repository
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit: E-Commerce Microservices Architecture"
    echo "Initialized Git repository"
fi

# Create .gitignore
cat > .gitignore << EOF
node_modules/
.env
*.log
dist/
build/
.next/
coverage/
*.pyc
__pycache__/
.pytest_cache/
*.db
*.sqlite
.DS_Store
temp/
tmp/
EOF

echo "✅ Project initialization complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file with your configurations"
echo "2. Run 'docker-compose up -d' to start all services"
echo "3. Access API Gateway at http://localhost:8080"
echo "4. Access Grafana at http://localhost:3000 (admin/admin)"