# E-commerce Microservices

A microservices architecture for an e-commerce platform with Customer, Product, Order, and Payment services.

## Architecture

- **Customer Service** (Port 3001): Manages customer data
- **Product Service** (Port 3002): Manages product catalog
- **Order Service** (Port 3003): Handles order processing and coordinates with other services
- **Payment Service** (Port 3004): Processes payments and publishes transaction details to RabbitMQ

## Quick Start

### Option 1: Automated Setup
```bash
./scripts/setup.sh
```

### Option 2: Manual Setup
```bash
yarn install:all
yarn start
yarn seed
yarn test:workflow
```

### Access Services:
- Customer Service: http://localhost:3001
- Product Service: http://localhost:3002
- Order Service: http://localhost:3003
- Payment Service: http://localhost:3004
- RabbitMQ Management: http://localhost:15672 (admin/password)

## Workflow

1. Customer places an order via Order Service
2. Order Service validates customer and product with respective services
3. Order Service sends payment request to Payment Service
4. Payment Service publishes transaction details to RabbitMQ
5. Transaction worker processes and saves transaction history

## Available Commands

```bash
# Development
yarn start          # Start all services with Docker
yarn dev           # Start in development mode
yarn stop          # Stop all services
yarn clean         # Clean up volumes

# Testing
yarn test          # Run all tests
yarn test:customer # Test customer service
yarn test:product  # Test product service
yarn test:order    # Test order service
yarn test:payment  # Test payment service
yarn test:workflow # Test complete workflow

# Data Management
yarn seed          # Seed initial data
yarn install:all   # Install deps for all services
```

## Individual Service Testing

```bash
cd customer-service && yarn test
cd product-service && yarn test
cd order-service && yarn test
cd payment-service && yarn test
```