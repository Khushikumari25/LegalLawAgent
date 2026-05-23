# 🚀 How to Run Your AI Legal Intelligence System

## ✅ Current Status

- ✅ Node.js installed (v22.17.1)
- ✅ npm installed (11.7.0)
- ✅ Dependencies installed
- ✅ CrewAI integration working (Bearer Token authentication successful)
- ⚠️ MongoDB needs to be set up

## 📋 Quick Start Options

### Option 1: Use MongoDB Atlas (Cloud - Recommended for Quick Start)

**Advantages**: No local installation, free tier available, accessible from anywhere

**Steps**:

1. **Create MongoDB Atlas Account** (5 minutes)
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free
   - Create a free cluster (M0 Sandbox)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

3. **Update .env file**
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/legal_intelligence?retryWrites=true&w=majority
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Option 2: Install MongoDB Locally

**Advantages**: Full control, works offline, faster

**Steps**:

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Choose "Complete" installation

2. **Install MongoDB**
   - Run the installer
   - Choose "Install MongoDB as a Service"
   - Complete the installation

3. **Verify Installation**
   ```cmd
   mongod --version
   ```

4. **Start MongoDB Service**
   ```cmd
   net start MongoDB
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

### Option 3: Run Without Database (Testing Only)

**For quick testing without database**:

1. **Comment out MongoDB connection** in `backend/server.js`
2. **Start server** - it will run but won't save data

---

## 🎯 Recommended: MongoDB Atlas (5 Minutes Setup)

Let me guide you through MongoDB Atlas setup:

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose "Free" tier

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select a cloud provider (AWS recommended)
4. Choose region closest to you
5. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User
1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `legaladmin`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Whitelist IP Address
1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Database" (left menu)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `legal_intelligence`

Example:
```
mongodb+srv://legaladmin:YourPassword123@cluster0.xxxxx.mongodb.net/legal_intelligence?retryWrites=true&w=majority
```

### Step 6: Update .env File
Open `.env` and update:
```env
MONGODB_URI=mongodb+srv://legaladmin:YourPassword123@cluster0.xxxxx.mongodb.net/legal_intelligence?retryWrites=true&w=majority
```

### Step 7: Start the Server
```bash
npm run dev
```

---

## 🚀 Starting the Application

Once MongoDB is configured:

### 1. Start Backend Server

```bash
npm run dev
```

**Expected Output**:
```
Server running in development mode on port 5000
MongoDB connected successfully
CrewAI service initialized
✓ Server is ready!
```

### 2. Open Frontend

**Option A - Direct File** (Quick):
```cmd
start frontend\index.html
```

**Option B - HTTP Server** (Better):
```bash
# Install http-server (one time)
npm install -g http-server

# Start frontend server
cd frontend
http-server -p 3000
```

Then open: http://localhost:3000

### 3. Test the Application

1. **Sign Up**: Create a new account
2. **Login**: Login with credentials
3. **Upload Case**: Upload a legal document
4. **Analyze**: Click "Analyze with AI" - Real AI will process it!
5. **View Results**: See AI-generated analysis

---

## 📊 What You'll See

### Backend Console:
```
Server running in development mode on port 5000
MongoDB connected successfully
CrewAI service initialized
POST /api/v1/auth/register 201 - 234ms
POST /api/v1/auth/login 200 - 156ms
POST /api/v1/cases 201 - 1234ms
POST /api/v1/analysis/case/123 200 - 5678ms
INFO: Starting CrewAI analysis for case: FIR123/2024
INFO: CrewAI analysis completed for case: FIR123/2024
```

### Frontend:
- Beautiful dark-themed legal-tech dashboard
- Case upload interface
- Real-time AI analysis results
- IPC to BNS mappings
- Petition eligibility scores
- AI assistant chat
- Analytics dashboard

---

## 🧪 API Testing (Optional)

### Test Authentication:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Test@123\",\"role\":\"lawyer\"}"
```

### Test IPC to BNS Mapping (AI):
```bash
curl -X GET http://localhost:5000/api/v1/analysis/ipc-bns/420 ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: "MongoDB connection failed"

**Solution**: Use MongoDB Atlas (see Option 1 above)

### Issue: "Port 5000 already in use"

**Solution**:
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Issue: "Cannot find module"

**Solution**:
```bash
npm install
```

### Issue: "CrewAI API error"

**Solution**: Already working! ✓ Test passed

---

## 📁 Project Structure

```
LegalLawAgent/
├── backend/              # Node.js/Express backend
│   ├── server.js        # Entry point
│   ├── controllers/     # API controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # CrewAI service
│   └── middleware/      # Auth, validation, etc.
├── frontend/            # HTML/CSS/JS frontend
│   ├── index.html      # Landing page
│   ├── pages/          # Dashboard, login, signup
│   ├── css/            # Styles
│   └── js/             # API client
├── .env                # Configuration (MongoDB, CrewAI tokens)
├── package.json        # Dependencies
└── test-crewai.js      # AI integration test
```

---

## ✅ Success Checklist

- [x] Node.js installed
- [x] Dependencies installed
- [x] CrewAI integration working
- [ ] MongoDB configured (Atlas or Local)
- [ ] Backend server running
- [ ] Frontend accessible
- [ ] Can create account
- [ ] Can upload case
- [ ] AI analysis working

---

## 🎯 Next Steps

1. **Set up MongoDB** (choose Atlas or Local)
2. **Update .env** with MongoDB connection string
3. **Start backend**: `npm run dev`
4. **Open frontend**: `start frontend\index.html`
5. **Test the app**: Sign up, upload case, analyze with AI

---

## 📞 Need Help?

**Check logs**:
```bash
type logs\combined.log
```

**Test CrewAI**:
```bash
node test-crewai.js
```

**Verify configuration**:
```bash
type .env
```

---

**Ready to start? Set up MongoDB Atlas (5 minutes) and run `npm run dev`!** 🚀

