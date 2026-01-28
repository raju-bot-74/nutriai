# 🚀 NutriAI Deployment Guide

This guide covers multiple deployment options for your NutriAI application.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Heroku Deployment](#heroku-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Vercel + Railway](#vercel--railway)
6. [DigitalOcean](#digitalocean)
7. [Production Checklist](#production-checklist)

---

## Local Development

### Quick Start

1. **Install Node.js** (v14 or higher)
   - Download from https://nodejs.org/

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open the application**
   - Backend: http://localhost:3000
   - Frontend: Open `nutriai.html` in your browser

### Development Mode with Auto-Restart

```bash
npm install -g nodemon
npm run dev
```

---

## Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed

### Build and Run

```bash
# Build the Docker image
docker build -t nutriai .

# Run the container
docker run -p 3000:3000 nutriai

# Or use Docker Compose (recommended)
docker-compose up -d
```

### Access the Application
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

### Stop the Application
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

---

## Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**
   ```bash
   heroku create nutriai-app
   ```

3. **Add buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Create Procfile** (already included)
   ```
   web: node server.js
   ```

5. **Configure environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3000
   ```

6. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

7. **Open your app**
   ```bash
   heroku open
   ```

### Enable Add-ons (Optional)

**PostgreSQL Database:**
```bash
heroku addons:create heroku-postgresql:mini
```

**Redis:**
```bash
heroku addons:create heroku-redis:mini
```

---

## AWS Deployment

### Option 1: AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   eb init -p node.js nutriai-app
   ```

3. **Create environment**
   ```bash
   eb create nutriai-production
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

5. **Open application**
   ```bash
   eb open
   ```

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu Server 22.04 LTS
   - t2.micro (free tier eligible)
   - Configure security group (ports 80, 443, 22)

2. **Connect to instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone and setup**
   ```bash
   git clone your-repo-url nutriai
   cd nutriai
   npm install
   ```

6. **Start with PM2**
   ```bash
   pm2 start server.js --name nutriai
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx as reverse proxy**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/nutriai
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nutriai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Vercel + Railway

### Frontend on Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy frontend**
   ```bash
   vercel --prod
   ```

4. **Configure for SPA**
   Create `vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Backend on Railway

1. **Create account at railway.app**

2. **Create new project**
   - Connect your GitHub repository
   - Railway will auto-detect Node.js

3. **Configure environment variables**
   - Add PORT, NODE_ENV, etc.

4. **Deploy**
   - Automatic deployment on git push

---

## DigitalOcean

### Using App Platform

1. **Create account on DigitalOcean**

2. **Click "Create" → "Apps"**

3. **Connect GitHub repository**

4. **Configure**
   - Type: Web Service
   - Build Command: `npm install`
   - Run Command: `npm start`

5. **Set environment variables**

6. **Deploy**

### Using Droplet (Manual)

Similar to AWS EC2 setup above.

---

## Production Checklist

### Security
- [ ] Use HTTPS/SSL certificates
- [ ] Set secure environment variables
- [ ] Enable CORS with specific origins
- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Sanitize user inputs
- [ ] Use helmet.js for security headers

### Performance
- [ ] Enable gzip compression
- [ ] Implement caching strategy
- [ ] Use CDN for static assets
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Use production builds

### Monitoring
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Enable application monitoring
- [ ] Set up alerts for errors
- [ ] Track performance metrics

### Database
- [ ] Use production database (PostgreSQL/MongoDB)
- [ ] Enable automated backups
- [ ] Set up database replication
- [ ] Configure connection pooling
- [ ] Implement database migrations

### Scaling
- [ ] Use load balancer
- [ ] Configure auto-scaling
- [ ] Implement horizontal scaling
- [ ] Use Redis for sessions
- [ ] Set up queue system for heavy tasks

---

## Environment Variables Setup

Create `.env` file (copy from `.env.example`):

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
- `PORT` - Server port
- `NODE_ENV` - Environment (production/development)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for JWT tokens

---

## Database Migration

### PostgreSQL

1. **Install pg**
   ```bash
   npm install pg
   ```

2. **Create database**
   ```sql
   CREATE DATABASE nutriai;
   ```

3. **Run migrations**
   ```bash
   npm run migrate
   ```

### MongoDB

1. **Install mongoose**
   ```bash
   npm install mongoose
   ```

2. **Connect to MongoDB Atlas**
   - Create cluster on mongodb.com
   - Get connection string
   - Add to environment variables

---

## SSL Certificate Setup

### Using Certbot (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

### Using Cloudflare

1. Add site to Cloudflare
2. Update nameservers
3. Enable SSL/TLS (Full)
4. Configure Always Use HTTPS

---

## Backup Strategy

### Database Backups

**PostgreSQL:**
```bash
pg_dump -U username -d nutriai > backup.sql
```

**MongoDB:**
```bash
mongodump --uri="mongodb://..." --out=/backup
```

### Automated Backups

Create cron job:
```bash
crontab -e
```

Add:
```
0 2 * * * /path/to/backup-script.sh
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :3000
kill -9 [PID]
```

**Permission denied:**
```bash
sudo chown -R $USER:$GROUP ~/.npm
```

**Module not found:**
```bash
rm -rf node_modules
npm install
```

### Logs

**View application logs:**
```bash
# PM2
pm2 logs nutriai

# Docker
docker logs nutriai-backend

# Heroku
heroku logs --tail
```

---

## Performance Optimization

### Enable Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### Implement Caching

```javascript
const redis = require('redis');
const client = redis.createClient();
```

### Use CDN

- Cloudflare
- Amazon CloudFront
- Fastly

---

## Monitoring Tools

- **Uptime:** UptimeRobot, Pingdom
- **Errors:** Sentry, Rollbar
- **Performance:** New Relic, DataDog
- **Analytics:** Google Analytics, Mixpanel

---

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Verify network/firewall settings
- Check database connections
- Review API endpoints

---

**Successfully deployed? 🎉**

Test your deployment:
1. Visit your domain
2. Upload a food image
3. Calculate BMR
4. Chat with AI
5. Check all features

Happy deploying! 🚀