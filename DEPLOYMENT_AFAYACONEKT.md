# AfayaConekt Deployment to Hostinger VPS
## Domain: afayaconekt.care | VPS IP: 147.93.104.185

This is your personalized deployment guide for deploying AfayaConekt to your Hostinger VPS.

## 🔐 Your VPS Credentials

- **VPS IP**: 147.93.104.185
- **SSH User**: root
- **Domain**: afayaconekt.care
- **SSH Command**: `ssh root@147.93.104.185`

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:
- [ ] SSH access to your VPS (test with `ssh root@147.93.104.185`)
- [ ] Domain afayaconekt.care pointing to 147.93.104.185 in DNS
- [ ] Git repository ready (GitHub/GitLab)
- [ ] Email SMTP credentials for notifications

## Step 1: Connect to Your VPS

Open your terminal and connect:

```bash
ssh root@147.93.104.185
# Enter password: AfayaConekt2025@
```

## Step 2: Update System and Install Docker

```bash
# Update system packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version
```

Expected output:
- Docker version 24.x or higher
- Docker Compose version v2.x or higher

## Step 3: Install Git and Clone Repository

```bash
# Install Git
apt install git -y

# Navigate to web directory
cd /var/www

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/afayaconekt.git afayaS

# Navigate to project
cd afayaS

# Verify files
ls -la
```

You should see: backend/, frontend/, nginx/, docker-compose.yml, etc.

## Step 4: Configure Environment Variables

### 4.1 Backend Environment

```bash
cd /var/www/afayaS/backend

# Create .env from example
cp .env.example .env

# Edit with nano
nano .env
```

Update these values:

```env
# Database - Use a strong password
DATABASE_URL="postgresql://afayaconekt:AfayaDB2025SecurePass@postgres:5432/afayaconekt?schema=public"

# JWT - Generate with: openssl rand -base64 32
JWT_SECRET="YOUR_GENERATED_SECRET_HERE"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# MinIO
MINIO_ENDPOINT="http://minio:9000"
MINIO_ACCESS_KEY="afayaminio2025"
MINIO_SECRET_KEY="AfayaMinIO2025SecureKey"
MINIO_BUCKET_NAME="afayaconekt-media"

# Server Configuration
PORT=3001
FRONTEND_URL="https://afayaconekt.care"
API_URL="https://afayaconekt.care"

# CORS
CORS_ORIGIN="https://afayaconekt.care"

# Email (update with your SMTP details)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Logging
LOG_LEVEL="info"
PRISMA_LOG_LEVEL="warn"
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 4.2 Frontend Environment

```bash
cd /var/www/afayaS/frontend

# Create .env
cp .env.example .env

# Edit
nano .env
```

Update:

```env
VITE_API_URL=https://afayaconekt.care
VITE_SOCKET_URL=https://afayaconekt.care
VITE_DEFAULT_LANGUAGE=en
VITE_PWA_ENABLED=true
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 4.3 Update Docker Compose

```bash
cd /var/www/afayaS

# Edit docker-compose.yml
nano docker-compose.yml
```

Update the postgres and minio environment variables to match your .env files:

```yaml
  postgres:
    environment:
      POSTGRES_DB: afayaconekt
      POSTGRES_USER: afayaconekt
      POSTGRES_PASSWORD: AfayaDB2025SecurePass  # Match DATABASE_URL password

  minio:
    environment:
      MINIO_ROOT_USER: afayaminio2025  # Match MINIO_ACCESS_KEY
      MINIO_ROOT_PASSWORD: AfayaMinIO2025SecureKey  # Match MINIO_SECRET_KEY
```

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Configure Domain DNS

In your Hostinger control panel:

1. Go to **Domains** → **afayaconekt.care** → **DNS Zone**
2. Add/Update these records:

| Type | Name | Points To | TTL |
|------|------|-----------|-----|
| A | @ | 147.93.104.185 | 14400 |
| A | www | 147.93.104.185 | 14400 |
| A | api | 147.93.104.185 | 14400 |

3. Save changes and wait 15-30 minutes for DNS propagation

## Step 6: Update Nginx Configuration

```bash
cd /var/www/afayaS

# Update Nginx default config
nano nginx/conf.d/default.conf
```

Replace `localhost` with `afayaconekt.care`:

```nginx
server {
  listen 80;
  server_name afayaconekt.care www.afayaconekt.care;
  client_max_body_size 100M;

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

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 7: Build and Start Services

```bash
cd /var/www/afayaS

# Build all services
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps
```

All services should show "Up" status.

## Step 8: Run Database Migrations

```bash
# Wait for database to be ready (30 seconds)
sleep 30

# Run migrations
docker exec afayaconekt-backend npx prisma migrate deploy

# Verify migration
docker exec afayaconekt-backend npx prisma db push
```

## Step 9: Test Your Deployment

```bash
# Test health endpoint
curl http://147.93.104.185/health

# Should return: {"status":"OK","timestamp":"..."}
```

Visit in browser:
- http://afayaconekt.care (may take time for DNS)
- http://147.93.104.185 (should work immediately)

## Step 10: Set Up SSL with Let's Encrypt

### 10.1 Install Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 10.2 Stop Nginx Container

```bash
cd /var/www/afayaS
docker compose stop nginx
```

### 10.3 Obtain SSL Certificate

```bash
certbot certonly --standalone \
  -d afayaconekt.care \
  -d www.afayaconekt.care \
  --email your-email@gmail.com \
  --agree-tos \
  --no-eff-email
```

Follow prompts. Certificates will be saved to:
- `/etc/letsencrypt/live/afayaconekt.care/fullchain.pem`
- `/etc/letsencrypt/live/afayaconekt.care/privkey.pem`

### 10.4 Create SSL Configuration

```bash
nano /var/www/afayaS/nginx/conf.d/ssl.conf
```

Add:

```nginx
server {
  listen 443 ssl http2;
  server_name afayaconekt.care www.afayaconekt.care;
  client_max_body_size 100M;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/afayaconekt.care/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/afayaconekt.care/privkey.pem;
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

  # Socket.io
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
  server_name afayaconekt.care www.afayaconekt.care;
  return 301 https://$server_name$request_uri;
}
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 10.5 Update Docker Compose for SSL

```bash
nano docker-compose.yml
```

Find the nginx service and update volumes:

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
      - /etc/letsencrypt:/etc/letsencrypt:ro  # Add this line
    depends_on:
      - frontend
      - backend
    networks:
      - afayaconekt-network
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 10.6 Restart Services

```bash
docker compose up -d
```

### 10.7 Set Up Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Add cron job
crontab -e
```

Select nano (option 1), then add:

```
0 3 * * * certbot renew --quiet && docker compose -f /var/www/afayaS/docker-compose.yml restart nginx
```

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 11: Configure Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH (IMPORTANT: Do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

## Step 12: Verify Deployment

### 12.1 Check Services

```bash
cd /var/www/afayaS
docker compose ps
```

All should show "Up".

### 12.2 Check Logs

```bash
# All services
docker compose logs --tail=50

# Specific service
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
```

### 12.3 Test Endpoints

```bash
# Health check
curl https://afayaconekt.care/health

# Should return: {"status":"OK","timestamp":"..."}
```

### 12.4 Access Your Application

Open browser:
- **Frontend**: https://afayaconekt.care
- **API Docs**: https://afayaconekt.care/api/docs
- **MinIO Console**: http://147.93.104.185:9001

## Step 13: Set Up Database Backups

```bash
# Create backup directory
mkdir -p /root/backups

# Create backup script
nano /root/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec afayaconekt-postgres pg_dump -U afayaconekt afayaconekt > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql"
```

Save and make executable:

```bash
chmod +x /root/backup-db.sh

# Test backup
/root/backup-db.sh

# Schedule daily backups
crontab -e
```

Add:

```
0 2 * * * /root/backup-db.sh >> /var/log/db-backup.log 2>&1
```

## Step 14: Security Hardening

### 14.1 Change Root Password

```bash
passwd
# Enter new strong password
```

### 14.2 Create Deploy User (Recommended)

```bash
# Create user
adduser deployuser
# Set password when prompted

# Add to sudo group
usermod -aG sudo deployuser
usermod -aG docker deployuser

# Test
su - deployuser
sudo docker ps
exit
```

### 14.3 Disable Root SSH (After testing deploy user)

```bash
nano /etc/ssh/sshd_config
```

Change:

```
PermitRootLogin no
```

Restart SSH:

```bash
systemctl restart sshd
```

## 🎯 Quick Commands Reference

```bash
# Navigate to project
cd /var/www/afayaS

# View logs
docker compose logs -f

# Restart service
docker compose restart frontend

# Stop all
docker compose down

# Start all
docker compose up -d

# Rebuild and restart
docker compose down && docker compose up -d --build

# Check status
docker compose ps

# View resource usage
docker stats
```

## 🔧 Troubleshooting

### Issue: Can't connect to VPS

```bash
# Test connection
ping 147.93.104.185

# Check if SSH port is open
telnet 147.93.104.185 22
```

### Issue: Domain not resolving

```bash
# Check DNS
nslookup afayaconekt.care

# Should return: 147.93.104.185
```

### Issue: Services won't start

```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check memory
free -m
```

### Issue: SSL certificate errors

```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew

# Restart nginx
docker compose restart nginx
```

## 📊 Monitoring

### Check Application Health

```bash
# Health endpoint
curl https://afayaconekt.care/health

# Check all containers
docker compose ps

# Resource usage
docker stats --no-stream
```

### View Logs

```bash
# Real-time logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs backend --tail=50
```

## 🔄 Updating Your Application

When you make changes:

```bash
cd /var/www/afayaS

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Run migrations if schema changed
docker exec afayaconekt-backend npx prisma migrate deploy
```

## ✅ Deployment Complete!

Your AfayaConekt platform should now be live at:
- **Main Site**: https://afayaconekt.care
- **API**: https://afayaconekt.care/api
- **Docs**: https://afayaconekt.care/api/docs

## 📞 Support

If you encounter issues:
1. Check logs: `docker compose logs`
2. Verify DNS: `nslookup afayaconekt.care`
3. Test SSL: `curl -I https://afayaconekt.care`
4. Review [`DEPLOYMENT.md`](DEPLOYMENT.md:1) for detailed troubleshooting

---

**Next Steps:**
- Monitor application performance
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure email notifications
- Implement authentication features
- Add more medical services

🎉 Congratulations! Your medical tourism platform is now live!