#!/bin/bash
set -e

echo "🚀 Starting AfayaConekt deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from repository...${NC}"
git pull origin main

# Stop services
echo -e "${YELLOW}🛑 Stopping services...${NC}"
docker compose down

# Build services
echo -e "${YELLOW}🔨 Building services...${NC}"
docker compose build --no-cache

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Run database migrations
echo -e "${YELLOW}📊 Running database migrations...${NC}"
docker exec afayaconekt-backend npx prisma migrate deploy

# Check service status
echo -e "${YELLOW}📋 Checking service status...${NC}"
docker compose ps

# Test health endpoint
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
sleep 5
HEALTH_CHECK=$(curl -s http://localhost:3001/health || echo "failed")

if [[ $HEALTH_CHECK == *"OK"* ]]; then
  echo -e "${GREEN}✅ Health check passed!${NC}"
else
  echo -e "${RED}❌ Health check failed!${NC}"
  echo -e "${YELLOW}Checking logs...${NC}"
  docker compose logs backend --tail=50
fi

# Display running containers
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}Running containers:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}🎉 AfayaConekt is now deployed!${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend API: http://localhost:3001"
echo -e "API Docs: http://localhost:3001/api/docs"
echo -e "MinIO Console: http://localhost:9001"