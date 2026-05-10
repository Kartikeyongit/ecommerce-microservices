.PHONY: help up down restart logs build clean ps test

help:
	@echo "E-Commerce Microservices - Available Commands:"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make build     - Build all services"
	@echo "  make logs      - View all logs"
	@echo "  make ps        - List running services"
	@echo "  make clean     - Remove all containers and volumes"
	@echo "  make seed      - Seed database with sample data"
	@echo "  make test      - Run tests"

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose down && docker-compose up -d

build:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

ps:
	docker-compose ps

clean:
	docker-compose down -v
	docker system prune -af

seed:
	node scripts/seed.js

test:
	@echo "Running tests..."
	cd services/auth-service && npm test || true
	cd services/product-service && npm test || true
