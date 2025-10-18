# AfayaConekt - Hostinger VPS Deployment Guide

This guide walks you through deploying the AfayaConekt platform to your Hostinger VPS.

## Prerequisites

- Hostinger VPS subscription (active)
- Domain name configured in Hostinger
- SSH access to your VPS
- Git installed on your local machine

## Step 1: Prepare Your VPS

### 1.1 Connect to Your VPS via SSH

```bash
ssh root@your-vps-ip-address
# Or use the credentials provided by Hostinger
```

### 1.2 Update System Packages

```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker service
systemctl start docker
systemctl enable docker

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version
```

### 1.4 Install Git

```bash
apt install git -y
git --version
```

## Step 2: Clone Your Repository

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/your-username/afayaconekt.git
cd afayaconekt

# Or if using afayaS as folder name
mv afayaconekt afayaS
cd afayaS
```

## Step 3: Configure Environment Variables

### 3.1 Backend Environment

```bash
cd backend
cp .env.example .env
nano .env
```

Update the following values in `.env`:

```env
# Database - Use strong password
DATABASE_URL="postgresql://afayaconekt:STRONG_PASSWORD_HERE@postgres:5432/afayaconekt?schema=public"

# JWT - Generate strong secret
JWT_SECRET="GENERATE_STRONG_SECRET_HERE"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# MinIO
MINIO_ENDPOINT="http://minio:9000"
MINIO_ACCESS_KEY="CHANGE_THIS_ACCESS_KEY"
MINIO_SECRET_KEY="CHANGE_THIS_SECRET_KEY"
MINIO_BUCKET_NAME="afayaconekt-media"

# Server Configuration - Use your domain
PORT=3001
FRONTEND_URL="https://yourdomain.com"
API_URL="https://api.yourdomain.com"

# CORS - Use your domain
CORS_ORIGIN="https://yourdomain.com"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# Logging
LOG_LEVEL="info"
```

### 3.2 Frontend Environment

```bash
cd ../frontend
cp .env.example .env
nano .env
```

Update:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_DEFAULT_LANGUAGE=en
```

## Step 4: Update Docker Compose for Production

```bash
cd ..
nano docker-compose.yml
```

Update the postgres password and MinIO credentials to match your `.env` files.

## Step 5: Configure Nginx for Your Domain

### 5.1 Update Nginx Configuration

```bash
nano nginx/conf.d/default.conf
```

Replace `localhost` with your domain:

```nginx
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  client_max_body_size 100M;

  # Redirect HTTP to HTTPS (after SSL is set up)
  # return 301 https://$server_name$request_uri;

  # Frontend routes (SPA)
  location / {
    proxy_pass http://frontend:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_buffering off;
  }

  # Backend API routes
  location /api/ {
    proxy_pass http://backend:3001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
    proxy_pass_request_headers on;
  }

  # Socket.io for real-time chat
  location /socket.io/ {
    proxy_pass http://backend:3001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Health check
  location /health {
    proxy_pass http://backend:3001/health;
  }

  # API docs
  location /api/docs/ {
    proxy_pass http://backend:3001/api/docs/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Step 6: Configure Domain DNS

In your Hostinger control panel:

1. Go to **Domains** → **DNS Zone**
2. Add/Update A Record:
   - **Type**: A
   - **Name**: @ (for root domain)
   - **Points to**: Your VPS IP address
   - **TTL**: 14400
3. Add A Record for www:
   - **Type**: A
   - **Name**: www
   - **Points to**: Your VPS IP address
   - **TTL**: 14400
4. Add A Record for API subdomain:
   - **Type**: A
   - **Name**: api
   - **Points to**: Your VPS IP address
   - **TTL**: 14400

Wait 15-30 minutes for DNS propagation.

## Step 7: Build and Start Services

```bash
# Build all services
docker compose build

# Start services in detached mode
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Step 8: Run Database Migrations

```bash
# Access backend container
docker exec -it afayaconekt-backend sh

# Run migrations
npx prisma migrate deploy

# Exit container
exit
```

## Step 9: Set Up SSL with Let's Encrypt

### 9.1 Install Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 9.2 Stop Nginx Container Temporarily

```bash
docker compose stop nginx
```

### 9.3 Obtain SSL Certificate

```bash
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to share email

Certificates will be saved to:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

### 9.4 Update Nginx for HTTPS

Create SSL configuration:

```bash
nano nginx/conf.d/ssl.conf
```

Add:

```nginx
server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;
  client_max_body_size 100M;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Frontend routes (SPA)
  location / {
    proxy_pass http://frontend:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_buffering off;
  }

  # Backend API routes
  location /api/ {
    proxy_pass http://backend:3001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
    proxy_pass_request_headers on;
  }

  # Socket.io for real-time chat
  location /socket.io/ {
    proxy_pass http://backend:3001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Health check
  location /health {
    proxy_pass http://backend:3001/health;
  }

  # API docs
  location /api/docs/ {
    proxy_pass http://backend:3001/api/docs/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  return 301 https://$server_name$request_uri;
}
```

### 9.5 Update Docker Compose for SSL

```bash
nano docker-compose.yml
```

Add SSL certificate volumes to nginx service:

```yaml
  nginx:
    image: nginx:alpine
    container_name: afayaconekt-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    networks:
      - afayaconekt-network
```

### 9.6 Restart Services

```bash
docker compose up -d
```

### 9.7 Set Up Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Add cron job for auto-renewal
crontab -e
```

Add this line:

```
0 3 * * * certbot renew --quiet && docker compose -f /var/www/afayaS/docker-compose.yml restart nginx
```

## Step 10: Verify Deployment

### 10.1 Check Services

```bash
docker compose ps
```

All services should show "Up" status.

### 10.2 Check Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs frontend
docker compose logs backend
docker compose logs nginx
```

### 10.3 Test Endpoints

```bash
# Health check
curl https://yourdomain.com/health

# API docs
curl https://yourdomain.com/api/docs
```

### 10.4 Access Your Application

Open your browser and navigate to:
- **Frontend**: https://yourdomain.com
- **API Docs**: https://yourdomain.com/api/docs
- **MinIO Console**: http://your-vps-ip:9001

## Step 11: Set Up Monitoring (Optional but Recommended)

### 11.1 Install Monitoring Tools

```bash
# Install htop for system monitoring
apt install htop -y

# Install Docker stats
docker stats
```

### 11.2 Set Up Log Rotation

```bash
nano /etc/docker/daemon.json
```

Add:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
systemctl restart docker
docker compose up -d
```

## Step 12: Backup Strategy

### 12.1 Database Backup Script

Create backup script:

```bash
nano /root/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec afayaconekt-postgres pg_dump -U afayaconekt afayaconekt > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql"
```

Make executable:

```bash
chmod +x /root/backup-db.sh
```

### 12.2 Schedule Daily Backups

```bash
crontab -e
```

Add:

```
0 2 * * * /root/backup-db.sh >> /var/log/db-backup.log 2>&1
```

## Step 13: Security Hardening

### 13.1 Configure Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

### 13.2 Disable Root SSH Login (After creating sudo user)

```bash
# Create new user
adduser deployuser
usermod -aG sudo deployuser

# Test sudo access
su - deployuser
sudo ls

# Disable root login
nano /etc/ssh/sshd_config
```

Change:

```
PermitRootLogin no
PasswordAuthentication no  # If using SSH keys
```

Restart SSH:

```bash
systemctl restart sshd
```

## Step 14: Continuous Deployment

### 14.1 Create Deployment Script

```bash
nano /var/www/afayaS/deploy.sh
```

Add:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker compose down
docker compose build --no-cache
docker compose up -d

# Run migrations
docker exec afayaconekt-backend npx prisma migrate deploy

echo "✅ Deployment completed successfully!"
```

Make executable:

```bash
chmod +x deploy.sh
```

### 14.2 Deploy Updates

```bash
cd /var/www/afayaS
./deploy.sh
```

## Troubleshooting

### Issue: Containers won't start

```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check memory
free -m
```

### Issue: Database connection errors

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Verify DATABASE_URL in backend/.env
```

### Issue: SSL certificate errors

```bash
# Renew certificate manually
certbot renew

# Check certificate expiry
certbot certificates

# Restart nginx
docker compose restart nginx
```

### Issue: Out of memory

```bash
# Check memory usage
docker stats

# Increase VPS resources in Hostinger panel
# Or optimize Docker resource limits in docker-compose.yml
```

## Maintenance Commands

```bash
# View all containers
docker compose ps

# View logs
docker compose logs -f

# Restart specific service
docker compose restart frontend

# Stop all services
docker compose down

# Remove all containers and volumes (CAUTION: deletes data)
docker compose down -v

# Update images
docker compose pull
docker compose up -d

# Clean up unused Docker resources
docker system prune -a
```

## Performance Optimization

### Enable Gzip Compression

Already configured in `nginx/nginx.conf`.

### Database Connection Pooling

Update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 10
}
```

### Redis Caching (Optional)

Add Redis to `docker-compose.yml`:

```yaml
  redis:
    image: redis:alpine
    container_name: afayaconekt-redis
    restart: always
    ports:
      - "6379:6379"
    networks:
      - afayaconekt-network
```

## Monitoring and Alerts

### Set Up Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor:
- https://yourdomain.com
- https://yourdomain.com/health
- https://yourdomain.com/api/docs

### Log Monitoring

```bash
# Real-time logs
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100
```

## Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
docker compose down

# Checkout previous version
git log --oneline
git checkout <previous-commit-hash>

# Rebuild and start
docker compose up -d --build

# Restore database backup if needed
docker exec -i afayaconekt-postgres psql -U afayaconekt afayaconekt < /root/backups/db_backup_YYYYMMDD_HHMMSS.sql
```

## Support

For deployment issues:
- Check logs: `docker compose logs`
- Verify DNS: `nslookup yourdomain.com`
- Test SSL: `openssl s_client -connect yourdomain.com:443`
- Contact Hostinger support for VPS-specific issues

---

**Deployment Checklist:**
- [ ] VPS set up with Docker and Docker Compose
- [ ] Repository cloned to /var/www/afayaS
- [ ] Environment variables configured
- [ ] Domain DNS configured
- [ ] SSL certificates obtained
- [ ] Services built and running
- [ ] Database migrated
- [ ] HTTPS working
- [ ] Backups scheduled
- [ ] Firewall configured
- [ ] Monitoring set up

🎉 Your AfayaConekt platform is now live on Hostinger!