# Deployment Guide - AI Legal Intelligence System

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0
- Git

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd legal-intelligence-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/legal_intelligence
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB

```bash
# Using MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Run Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 6. Access Application

- Frontend: Open `frontend/index.html` in browser or use a local server
- Backend API: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/health`

## Production Deployment

### Option 1: Vercel (Frontend) + Render (Backend) + MongoDB Atlas

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Frontend**
```bash
cd frontend
vercel --prod
```

3. **Configure**
- Set build command: `echo "Build complete"`
- Set output directory: `./`
- Add environment variables in Vercel dashboard

#### Backend Deployment (Render)

1. **Create Render Account**
- Go to https://render.com
- Sign up/Login

2. **Create New Web Service**
- Connect GitHub repository
- Select branch: `main`
- Build command: `npm install`
- Start command: `npm start`
- Environment: `Node`

3. **Add Environment Variables**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-production-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
FRONTEND_URL=<your-vercel-frontend-url>
```

4. **Deploy**
- Click "Create Web Service"
- Wait for deployment to complete

#### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free tier

2. **Create Cluster**
- Choose cloud provider (AWS/GCP/Azure)
- Select region closest to your users
- Choose M0 (Free tier) for testing

3. **Configure Database Access**
- Create database user with password
- Add IP whitelist (0.0.0.0/0 for all IPs or specific IPs)

4. **Get Connection String**
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy connection string
- Replace `<password>` with your database user password

5. **Update Backend Environment**
- Add MongoDB Atlas URI to Render environment variables

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/legal_intelligence
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
    restart: unless-stopped

volumes:
  mongo-data:
```

#### 3. Deploy with Docker Compose

```bash
docker-compose up -d
```

### Option 3: AWS Deployment

#### Backend (AWS Elastic Beanstalk)

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB**
```bash
eb init -p node.js-18 legal-intelligence-backend
```

3. **Create Environment**
```bash
eb create legal-intelligence-prod
```

4. **Set Environment Variables**
```bash
eb setenv NODE_ENV=production MONGODB_URI=<uri> JWT_SECRET=<secret>
```

5. **Deploy**
```bash
eb deploy
```

#### Frontend (AWS S3 + CloudFront)

1. **Create S3 Bucket**
```bash
aws s3 mb s3://legal-intelligence-frontend
```

2. **Upload Frontend Files**
```bash
aws s3 sync frontend/ s3://legal-intelligence-frontend --acl public-read
```

3. **Enable Static Website Hosting**
```bash
aws s3 website s3://legal-intelligence-frontend --index-document index.html
```

4. **Create CloudFront Distribution** (Optional for CDN)
- Go to AWS CloudFront console
- Create distribution
- Set origin to S3 bucket
- Configure SSL certificate

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://...` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your_refresh_secret` |
| `FRONTEND_URL` | Frontend URL | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRE` | Access token expiry | `7d` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry | `30d` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Post-Deployment Checklist

- [ ] Verify backend health endpoint
- [ ] Test user registration and login
- [ ] Test file upload functionality
- [ ] Verify database connections
- [ ] Check API rate limiting
- [ ] Test CORS configuration
- [ ] Verify JWT authentication
- [ ] Test all API endpoints
- [ ] Check error logging
- [ ] Monitor performance metrics
- [ ] Set up backup strategy
- [ ] Configure SSL certificates
- [ ] Set up monitoring (e.g., PM2, New Relic)
- [ ] Configure CDN for static assets
- [ ] Set up automated backups

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://your-backend-url/health

# Check API version
curl https://your-backend-url/api/v1
```

### Logs

```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log
```

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://..." --out=./backup

# Restore
mongorestore --uri="mongodb://..." ./backup
```

## Troubleshooting

### Common Issues

**Issue: MongoDB Connection Failed**
- Check MongoDB URI format
- Verify network access (IP whitelist)
- Ensure MongoDB service is running

**Issue: JWT Authentication Errors**
- Verify JWT_SECRET is set correctly
- Check token expiration settings
- Clear browser localStorage and re-login

**Issue: File Upload Fails**
- Check MAX_FILE_SIZE setting
- Verify uploads directory permissions
- Check disk space

**Issue: CORS Errors**
- Verify FRONTEND_URL in environment
- Check CORS configuration in server.js
- Ensure proper headers are set

## Performance Optimization

1. **Enable Compression**
   - Already configured in server.js

2. **Database Indexing**
   - Indexes are defined in models
   - Monitor slow queries

3. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data

4. **CDN**
   - Use CloudFront or Cloudflare
   - Cache static assets

5. **Load Balancing**
   - Use AWS ELB or Nginx
   - Distribute traffic across instances

## Security Best Practices

- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Use strong JWT secrets
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Use helmet.js for security headers
- [ ] Enable CORS only for trusted origins
- [ ] Regular security audits
- [ ] Monitor for vulnerabilities
- [ ] Implement proper error handling

## Support

For deployment issues or questions:
- Check documentation: `/docs`
- GitHub Issues: `<repository-url>/issues`
- Email: support@legalintelligence.ai

---

**Last Updated:** 2024
**Version:** 1.0.0
