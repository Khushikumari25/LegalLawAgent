# CrewAI Integration - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Run Setup Script (Windows)

```cmd
setup.bat
```

This will:
- Install all dependencies
- Create .env file
- Create required directories
- Display next steps

### Step 2: Add CrewAI API Key

Open `.env` file and add your API key:

```env
CREWAI_API_KEY=your_actual_api_key_here
```

**Where to get your API key:**
1. Go to https://app.crewai.com
2. Navigate to your deployment
3. Go to API settings
4. Copy your API key

### Step 3: Start MongoDB

```cmd
mongod
```

Or use MongoDB Atlas (cloud):
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 4: Start the Server

```cmd
npm start
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### Step 5: Open Frontend

Open `frontend/index.html` in your browser

Or use a local server:
```cmd
npx http-server frontend -p 3000
```

Then visit: http://localhost:3000

## ✅ Verify Integration

### Test 1: Health Check

Visit: http://localhost:5000/health

Should return:
```json
{
  "status": "success",
  "message": "AI Legal Intelligence System is running"
}
```

### Test 2: Register & Login

1. Go to signup page
2. Create account
3. Login
4. You should see the dashboard

### Test 3: Upload & Analyze Case

1. Click "Upload Case"
2. Fill in case details:
   - Case Title: "Test Case"
   - FIR Number: "TEST123/2024"
   - Police Station: "Test Station"
   - Court: "High Court"
   - State: "Delhi"
   - Case Type: "Criminal"
3. Upload a PDF document (optional)
4. Click "Submit"
5. Go to "My Cases"
6. Click "Analyze Case"
7. Wait for AI analysis (may take 30-60 seconds)
8. View results!

### Test 4: IPC to BNS Mapping

1. Go to "IPC vs BNS" page
2. Enter IPC section: `420`
3. Click "Search"
4. View BNS mapping with AI-powered analysis

### Test 5: AI Assistant

1. Go to "AI Assistant" page
2. Type: "What is IPC Section 302?"
3. Press Enter
4. Get AI-powered response

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/legal_intelligence

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# CrewAI (IMPORTANT!)
CREWAI_API_URL=https://enterprise-ai-legal-intelligence-platform-c-32c1ec28.crewai.com
CREWAI_API_KEY=your_api_key_here
```

## 📊 How It Works

### Architecture Flow

```
User Action (Upload Case)
        ↓
Frontend sends to Backend
        ↓
Backend extracts PDF text
        ↓
Backend calls CrewAI Service
        ↓
CrewAI Service → CrewAI API
        ↓
Multi-Agent Workflow Processes
        ↓
AI Analysis Results
        ↓
Saved to MongoDB
        ↓
Displayed on Dashboard
```

### CrewAI Integration Points

1. **Case Analysis** (`POST /api/v1/analysis/case/:id`)
   - Sends case data to CrewAI
   - Gets comprehensive AI analysis
   - Stores results in MongoDB

2. **IPC to BNS Mapping** (`GET /api/v1/analysis/ipc-bns/:ipcSection`)
   - Queries CrewAI for BNS equivalent
   - Caches result in database
   - Returns mapping with confidence score

3. **Petition Eligibility** (`POST /api/v1/analysis/petition-eligibility`)
   - Evaluates petition eligibility
   - Provides AI reasoning
   - Calculates probability score

4. **AI Assistant** (`POST /api/v1/assistant/chat`)
   - Conversational AI interface
   - Context-aware responses
   - Legal query answering

5. **Similar Cases** (`GET /api/v1/analysis/similar-cases/:id`)
   - Finds related cases
   - Similarity scoring
   - Precedent analysis

## 🎯 Expected AI Responses

### Case Analysis Response

```javascript
{
  analyzed: true,
  analyzedAt: "2024-01-01T00:00:00.000Z",
  caseClassification: {
    status: "Pending",
    category: "Criminal",
    severity: "Medium",
    confidence: 0.89
  },
  summary: "AI-generated case summary...",
  keyFindings: [
    "Key finding 1",
    "Key finding 2"
  ],
  bnsMappings: [
    {
      ipcSection: "420",
      bnsSection: "318",
      description: "Cheating"
    }
  ],
  riskLevel: "Medium",
  legalInsights: [
    "Legal insight 1",
    "Legal insight 2"
  ],
  retrialProbability: 65,
  confidence: {
    overall: 0.89,
    classification: 0.92,
    mapping: 0.87
  }
}
```

### IPC to BNS Mapping Response

```javascript
{
  ipcSection: "420",
  ipcDescription: "Cheating and dishonestly inducing delivery of property",
  ipcPunishment: "Imprisonment up to 7 years and fine",
  bnsSection: "318",
  bnsDescription: "Cheating",
  bnsPunishment: "Imprisonment up to 7 years and fine",
  mappingType: "Direct",
  changes: "No major changes",
  confidence: 0.95
}
```

### Petition Eligibility Response

```javascript
{
  eligible: true,
  score: 75,
  probability: 72,
  reasoning: "Based on the case details and legal precedents...",
  recommendations: [
    "File petition within 30 days",
    "Gather additional evidence"
  ],
  factors: {
    positive: ["Factor 1", "Factor 2"],
    negative: ["Factor 1"]
  },
  confidence: 0.87
}
```

## 🐛 Troubleshooting

### Issue: "Cannot find module"

```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue: "MongoDB connection failed"

- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas connection string

### Issue: "CrewAI API Error: Unauthorized"

- Check your API key in `.env` file
- Make sure there are no extra spaces
- Verify key is valid in CrewAI dashboard

### Issue: "Port 5000 already in use"

```cmd
# Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Issue: "Request timeout"

- Check internet connection
- Verify CrewAI API URL
- CrewAI processing may take 30-60 seconds for complex cases

## 📝 Logs

Check logs for debugging:

```cmd
# View all logs
type logs\combined.log

# View error logs
type logs\error.log

# View last 20 lines
powershell Get-Content logs\combined.log -Tail 20
```

## 🔍 Monitoring

### Check AI Results in MongoDB

```javascript
// Connect to MongoDB
mongosh

// Use database
use legal_intelligence

// View AI results
db.ai_results.find().pretty()

// Check success rate
db.ai_results.aggregate([
  { $group: { 
    _id: "$status", 
    count: { $sum: 1 } 
  }}
])

// Average processing time
db.ai_results.aggregate([
  { $group: { 
    _id: "$agentType", 
    avgTime: { $avg: "$processingTime" } 
  }}
])
```

## 📚 Documentation

- **Full Integration Guide**: `CREWAI_INTEGRATION_GUIDE.md`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Quick Start**: `QUICK_START.md`
- **Deployment**: `DEPLOYMENT.md`

## 🎓 Next Steps

1. ✅ Complete setup
2. ✅ Test all features
3. ✅ Upload real cases
4. ✅ Analyze with AI
5. ✅ Generate reports
6. 🚀 Deploy to production

## 💡 Tips

- **First Analysis**: May take longer (30-60 seconds)
- **Cached Mappings**: IPC to BNS mappings are cached for faster subsequent requests
- **Batch Processing**: Upload multiple cases and analyze them in batch
- **API Limits**: Be aware of CrewAI API rate limits
- **Error Handling**: All errors are logged and saved to database

## 🆘 Support

**CrewAI Issues:**
- CrewAI Docs: https://docs.crewai.com
- CrewAI Dashboard: https://app.crewai.com

**Application Issues:**
- Check logs: `logs/combined.log`
- Review MongoDB: `ai_results` collection
- GitHub Issues: <repository-url>/issues

## ✨ Features Ready to Use

- ✅ Real AI-powered case analysis
- ✅ IPC to BNS mapping with AI
- ✅ Petition eligibility evaluation
- ✅ AI legal assistant chat
- ✅ Similar cases finder
- ✅ Comprehensive analytics
- ✅ Report generation
- ✅ User authentication
- ✅ File upload & PDF extraction

---

**Status**: 🟢 **READY FOR USE**

Your AI Legal Intelligence System is now fully integrated with CrewAI and ready to analyze legal cases!

**Happy Analyzing!** ⚖️🤖
