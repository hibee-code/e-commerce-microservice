#!/bin/bash

echo "=== E-commerce Microservices Setup ==="

echo "1. Installing dependencies for all services..."
yarn install:all

echo "2. Building and starting all services with Docker..."
docker compose up --build -d

echo "3. Waiting for services to be ready..."
sleep 30

echo "4. Seeding initial data..."
yarn seed

echo "5. Testing the complete workflow..."
sleep 5
yarn test:workflow

echo "=== Setup Complete ==="
echo ""
echo "Services are running at:"
echo "- Customer Service: http://localhost:3001"
echo "- Product Service: http://localhost:3002"
echo "- Order Service: http://localhost:3003"
echo "- Payment Service: http://localhost:3004"
echo "- RabbitMQ Management: http://localhost:15672 (admin/password)"
echo ""
echo "To stop all services: yarn stop"
echo "To clean up volumes: yarn clean"