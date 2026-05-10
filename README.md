# 🏗️ Enterprise Microservices E-Commerce Platform

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue)

## 📋 Overview

Production-ready e-commerce platform built with microservices architecture, demonstrating enterprise patterns and best practices.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                  │
├─────────────────────────────────────────────────────────┤
│                       API Gateway                       │
│                       (Port 8080)                       │
└────┬────────┬────────┬────────┬────────┬────────────────┘
     │        │        │        │        │
┌────▼──┐ ┌───▼───┐ ┌─▼────┐ ┌─▼───┐ ┌─▼──────────┐
│ Auth  │ │Product│ │Order │ │ Pay │ │Notification│
│Service│ │Service│ │Serv. │ │Serv.│ │  Service   │
│(3001) │ │(3002) │ │(3003)│ │(3004│ │   (3005)   │
│Node.js│ │Node.js│ │  Go  │ │Pyth.│ │  Node.js   │
└───┬───┘ └───┬───┘ └──┬───┘ └──┬──┘ └────┬───────┘
    │         │        │        │         │
┌───▼──┐  ┌───▼──┐  ┌──▼──┐  ┌──▼──┐  ┌───▼────────┐
│Post- │  │Mongo │  │Post-│  │Post-│  │  RabbitMQ  │
│greSQL│  │  DB  │  │greSQL  │greSQL  │  + Redis   │
└──────┘  └──────┘  └─────┘  └─────┘  └────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React / Next.js |
| **API Gateway** | Node.js + Express |
| **Services** | Node.js, Go, Python |
| **Databases** | PostgreSQL, MongoDB, Redis |
| **Message Queue** | RabbitMQ |
| **Containers** | Docker + Docker Compose |
| **Orchestration** | Kubernetes |
| **Monitoring** | Prometheus + Grafana |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local dev)
- Go 1.21+ (for order service)
- Python 3.11+ (for payment service)

### Running the Platform

```bash
# Clone the repository
git clone https://github.com/yourusername/ecommerce-microservices.git
cd ecommerce-microservices

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# Test the API
curl http://localhost:8080/health
```

---

## 📡 API Endpoints

### Authentication

```bash
# Register
POST /api/auth/register
Body: { "email", "password", "firstName", "lastName" }

# Login
POST /api/auth/login
Body: { "email", "password" }

# Get Profile
GET /api/auth/profile
Header: Authorization: Bearer <token>
```

### Products

```bash
# List Products
GET /api/products?page=1&limit=20&search=laptop

# Get Product
GET /api/products/:id

# Create Product
POST /api/products
Body: { "name", "description", "price", "category", "stock" }
```

### Orders

```bash
# Create Order
POST /api/orders
Body: { "user_id", "items": [{ "product_id", "quantity", "price" }] }

# Get Orders
GET /api/orders
```

### Payments

```bash
# Process Payment
POST /api/payments
Body: { "order_id", "amount", "user_id" }

# Get Payment
GET /api/payments/:id
```

---

## 📁 Project Structure

```
ecommerce-microservices/
├── services/
│   ├── api-gateway/          # Express API Gateway
│   ├── auth-service/         # Authentication (Node.js)
│   ├── product-service/      # Product Catalog (Node.js)
│   ├── order-service/        # Order Management (Go)
│   ├── payment-service/      # Payment Processing (Python)
│   └── notification-service/ # Notifications (Node.js)
├── infrastructure/
│   └── kubernetes/           # K8s deployment configs
├── monitoring/
│   ├── prometheus/
│   └── grafana/
├── .github/
│   └── workflows/            # CI/CD pipelines
└── docker-compose.yml
```

---

## 🏛️ Design Patterns

| Pattern | Description |
|---|---|
| **API Gateway** | Single entry point for all clients |
| **Database per Service** | Data isolation per microservice |
| **Event-Driven Architecture** | Async communication via RabbitMQ |
| **CQRS** | Separate read/write models where needed |
| **Saga Pattern** | Distributed transaction management |
| **Circuit Breaker** | Fault tolerance between services |
| **Service Discovery** | Dynamic routing via container networking |

---

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js for HTTP security headers
- CORS configuration
- Input validation
- Container isolation

---

## 🧪 Testing

```bash
# Unit tests
cd services/auth-service && npm test
cd services/product-service && npm test
cd services/order-service && go test ./...

# Integration tests (coming soon)
npm run test:integration

# E2E tests (coming soon)
npm run test:e2e
```

---

## 📈 Performance

- Redis caching for product queries
- Connection pooling for databases
- Stateless services for horizontal scaling
- Message queuing for async operations

---

## 📊 Monitoring

| Dashboard | URL | Credentials |
|---|---|---|
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| RabbitMQ Admin | http://localhost:15672 | admin / admin |

---

## 🚢 Deployment

### Docker Compose (Development)

```bash
docker-compose up -d
```

### Kubernetes (Production)

```bash
kubectl apply -f infrastructure/kubernetes/
```

---

## 📝 License

MIT

## 👤 Author

Kartikey Gautam

---

⭐ Star this repo if you find it useful!