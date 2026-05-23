# Quick Start Guide - AI Legal Intelligence System

Get up and running with the AI Legal Intelligence System in minutes!

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd legal-intelligence-system
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required Node.js packages including:
- Express.js
- MongoDB/Mongoose
- JWT authentication
- File upload handling
- And more...

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/legal_intelligence

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this
JWT_REFRESH_EXPIRE=30d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Important:** Change the JWT secrets to strong, random strings in production!

### Step 4: Start MongoDB

#### Option A: Local MongoDB

```bash
# Start MongoDB service
mongod
```

#### Option B: MongoDB with Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### Step 5: Start the Backend Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

You should see:

```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### Step 6: Access the Application

#### Frontend

Open your browser and navigate to:

```
file:///path/to/legal-intelligence-system/frontend/index.html
```

Or use a local server (recommended):

```bash
# Using Python
cd frontend
python -m http.server 3000

# Using Node.js http-server
npx http-server frontend -p 3000
```

Then visit: `http://localhost:3000`

#### Backend API

The API is available at:

```
http://localhost:5000/api/v1
```

Check health status:

```
http://localhost:5000/health
```

## First Steps

### 1. Create an Account

1. Navigate to the landing page
2. Click "Get Started" or "Sign Up"
3. Fill in your details:
   - Name
   - Email
   - Password (min 6 characters with uppercase, lowercase, and number)
   - Role (User or Lawyer)
4. Click "Create Account"

### 2. Login

1. Go to the login page
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### 3. Upload Your First Case

1. From the dashboard, click "Upload Case" or navigate to Upload Case page
2. Fill in case details:
   - Case Title
   - FIR Number
   - Police Station
   - Court (District/High/Supreme)
   - State
   - Case Type (Criminal/Civil/Constitutional)
3. Upload documents (PDF, DOC, DOCX, TXT - max 10MB each)
4. Click "Submit"

### 4. Analyze a Case

1. Go to "My Cases"
2. Select a case
3. Click "Analyze Case"
4. Wait for AI analysis to complete
5. View results:
   - Case summary
   - Key findings
   - Risk level
   - Legal insights
   - Retrial probability

### 5. Check IPC to BNS Mapping

1. Navigate to "IPC vs BNS" page
2. Enter an IPC section number (e.g., 420)
3. View:
   - BNS equivalent section
   - Description comparison
   - Punishment comparison
   - Changes and impact analysis

### 6. Evaluate Petition Eligibility

1. Go to "Petition Eligibility" page
2. Select a case
3. Click "Evaluate Eligibility"
4. View:
   - Eligibility score (0-100)
   - AI reasoning
   - Recommendations
   - Retrial probability

### 7. Use AI Assistant

1. Navigate to "AI Assistant" page
2. Type your legal query
3. Get instant AI-powered responses
4. Try suggested prompts:
   - "Explain IPC Section 302"
   - "What is the BNS equivalent of IPC 420?"
   - "How to check petition eligibility?"

### 8. View Analytics

1. Go to "Analytics" page
2. Explore:
   - State-wise case distribution
   - Resolution trends
   - Conviction analytics
   - IPC vs BNS comparison charts
   - Interactive dashboards

### 9. Generate Reports

1. Navigate to "Reports" page
2. Click "Generate Report"
3. Select:
   - Report type (Case Analysis, IPC-BNS Comparison, etc.)
   - Case (if applicable)
   - Format (PDF, Excel, JSON, HTML)
4. Click "Generate"
5. Download when ready

## Testing the API

### Using cURL

#### Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123",
    "role": "user"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

#### Get Dashboard Stats (with authentication)

```bash
curl -X GET http://localhost:5000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the API collection (if available)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api/v1`
   - `access_token`: (obtained from login)
3. Test endpoints

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Issue: Port Already in Use

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=5001
```

### Issue: JWT Authentication Errors

**Solution:**
- Clear browser localStorage
- Re-login to get new tokens
- Verify JWT_SECRET is set in `.env`

### Issue: File Upload Fails

**Solution:**
- Check file size (max 10MB)
- Verify file type (PDF, DOC, DOCX, TXT only)
- Ensure `uploads` directory exists and has write permissions

### Issue: CORS Errors

**Solution:**
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check CORS configuration in `backend/server.js`

## Development Tips

### Hot Reload

Use `nodemon` for automatic server restart on file changes:

```bash
npm run dev
```

### View Logs

```bash
# View all logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log
```

### Database Management

```bash
# Connect to MongoDB shell
mongosh

# Use database
use legal_intelligence

# View collections
show collections

# Query users
db.users.find()

# Query cases
db.cases.find()
```

### Clear Database (Development Only)

```bash
mongosh
use legal_intelligence
db.dropDatabase()
```

## Next Steps

Now that you're up and running:

1. **Explore the Dashboard**: Familiarize yourself with the interface
2. **Upload Test Cases**: Try different case types
3. **Test AI Features**: Experiment with analysis and eligibility checks
4. **Review Documentation**: Read `API_DOCUMENTATION.md` for API details
5. **Check Architecture**: Review `PROJECT_STRUCTURE.md` for system overview
6. **Plan Deployment**: See `DEPLOYMENT.md` for production deployment

## Getting Help

### Documentation

- **README.md**: Project overview
- **API_DOCUMENTATION.md**: Complete API reference
- **PROJECT_STRUCTURE.md**: Architecture details
- **DEPLOYMENT.md**: Deployment guide

### Support

- **GitHub Issues**: Report bugs or request features
- **Email**: support@legalintelligence.ai
- **Documentation**: `/docs` directory

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Check for updates
npm outdated

# Update dependencies
npm update

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Environment Checklist

Before starting development, ensure:

- [ ] Node.js installed (v18+)
- [ ] MongoDB installed and running
- [ ] `.env` file created and configured
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server starts without errors
- [ ] Frontend accessible in browser
- [ ] Can register and login successfully
- [ ] Can upload a test case
- [ ] API endpoints responding correctly

## Production Checklist

Before deploying to production:

- [ ] Change JWT secrets to strong random strings
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or production database
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test all critical features
- [ ] Review security settings

---

**Congratulations!** 🎉 You're now ready to use the AI Legal Intelligence System!

For more detailed information, refer to the complete documentation in the `/docs` directory.

**Happy Coding!** 💻⚖️
