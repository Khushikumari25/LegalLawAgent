# AI Legal Intelligence System

> Production-ready AI-powered Legal Intelligence Platform for IPC-BNS Analysis and Judicial Intelligence

## 🚀 Features

- **AI-Powered Case Analysis**: Multi-agent CrewAI system for intelligent legal document analysis ✅ **LIVE**
- **IPC to BNS Mapping**: Automated transition analysis from Indian Penal Code to Bharatiya Nyaya Sanhita ✅ **LIVE**
- **Petition Eligibility**: AI-driven eligibility scoring and recommendation engine ✅ **LIVE**
- **Judicial Analytics**: Comprehensive trends, statistics, and insights dashboard
- **Document Processing**: PDF upload, text extraction, and metadata management
- **Real-time AI Assistant**: Interactive legal assistant with streaming responses ✅ **LIVE**
- **Advanced Reporting**: Generate and export detailed legal reports

### 🤖 CrewAI Integration

This application is **fully integrated** with a deployed CrewAI multi-agent system:

**Deployment URL**: `https://enterprise-ai-legal-intelligence-platform-c-32c1ec28.crewai.com`

**AI Agents**:
1. Case Classification Agent
2. IPC vs BNS Mapping Agent
3. Petition Eligibility Agent
4. Legal Suggestion Agent
5. Analytics Agent

All AI features are **production-ready** and use real AI models!

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS for styling
- GSAP for animations
- Chart.js for data visualization
- Axios for API communication
- Lucide Icons

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- RESTful APIs
- Multer for file uploads
- Winston for logging

### AI/ML
- CrewAI multi-agent orchestration
- MCP (Model Context Protocol) tools
- OpenAI integration ready

## 📁 Project Structure

```
legal-intelligence-system/
├── frontend/                 # Frontend application
│   ├── pages/               # HTML pages
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript modules
│   ├── components/          # Reusable UI components
│   ├── assets/              # Images, fonts, icons
│   └── index.html           # Landing page
├── backend/                 # Backend application
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── agents/              # CrewAI agents
│   ├── mcp_tools/           # MCP tool integrations
│   └── server.js            # Entry point
├── uploads/                 # File uploads directory
├── logs/                    # Application logs
└── docs/                    # Documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd legal-intelligence-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**

For Windows users, run the setup script:
```cmd
setup.bat
```

Or manually:
```cmd
copy .env.example .env
REM Edit .env with your configuration
```

**IMPORTANT - CrewAI Bearer Tokens**: 
The `.env` file is already configured with your CrewAI Bearer Tokens:
```env
CREWAI_API_URL=https://enterprise-ai-legal-intelligence-platform-c-32c1ec28.crewai.com
CREWAI_BEARER_TOKEN=e7ff9dba24b1
CREWAI_USER_BEARER_TOKEN=dee4248e1f8f
```

If you need to update tokens, get them from your CrewAI deployment dashboard.

4. **Test CrewAI Integration**

Before starting the server, test the AI integration:
```bash
node test-crewai.js
```

This will verify:
- Bearer Token authentication is working
- CrewAI API is accessible
- AI agents are responding correctly

5. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

6. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

7. **Access the application**
- Frontend: Open `frontend/index.html` in browser or serve via HTTP server
- Backend API: `http://localhost:5000/api/v1`

## 🔐 Authentication

The system uses JWT-based authentication:
- Access tokens (7 days expiry)
- Refresh tokens (30 days expiry)
- Secure password hashing with bcrypt

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Cases
- `POST /api/v1/cases` - Upload new case
- `GET /api/v1/cases` - Get all cases
- `GET /api/v1/cases/:id` - Get case by ID
- `PUT /api/v1/cases/:id` - Update case
- `DELETE /api/v1/cases/:id` - Delete case

### Analysis
- `POST /api/v1/analysis/case/:id` - Analyze case
- `GET /api/v1/analysis/ipc-bns/:ipcSection` - Get BNS mapping
- `POST /api/v1/analysis/petition-eligibility` - Check eligibility

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard statistics
- `GET /api/v1/analytics/trends` - Legal trends data
- `GET /api/v1/analytics/state-wise` - State-wise analysis

### Reports
- `POST /api/v1/reports/generate` - Generate report
- `GET /api/v1/reports/:id` - Get report
- `GET /api/v1/reports/:id/download` - Download report

### AI Assistant
- `POST /api/v1/assistant/chat` - Chat with AI assistant
- `GET /api/v1/assistant/suggestions` - Get suggested prompts

## 🤖 CrewAI Integration

The system is architected to support CrewAI multi-agent orchestration:

### Agents
1. **Case Classification Agent** - Categorizes and classifies legal cases
2. **IPC vs BNS Agent** - Maps IPC sections to BNS equivalents
3. **Petition Eligibility Agent** - Evaluates petition eligibility
4. **Suggestion Agent** - Provides legal recommendations
5. **Analytics Agent** - Generates insights and trends

### Integration Points
- `backend/agents/` - Agent definitions and configurations
- `backend/mcp_tools/` - MCP tool implementations
- `backend/services/orchestrator.service.js` - Agent orchestration logic

## 🎨 UI/UX Design

### Color Palette
- Background: `#0B1120`
- Surface: `#111827`
- Primary: `#3B82F6`
- Secondary: `#7C3AEDAccent Gold: `#F59E0B`
- Text: `#F9FAFBTypography: Inter / Poppins

### Design Features
- Glassmorphism cards
- Glow borders and gradients
- Smooth transitions and animations
- Responsive design (mobile-first)
- Dark futuristic legal-tech theme

## 📊 Database Schema

### Collections
- `users` - User accounts and profiles
- `cases` - Legal case documents
- `reports` - Generated reports
- `analytics` - Analytics data
- `ipc_bns_mapping` - IPC to BNS mappings
- `ai_results` - AI analysis results
- `petitions` - Petition records

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- Input validation and sanitization
- CORS configuration
- File upload restrictions

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy frontend to Vercel
vercel --prod
```

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with auto-scaling

### Database (MongoDB Atlas)
1. Create cluster
2. Configure network access
3. Update connection string in `.env`

## 📈 Performance Optimization

- Compression middleware
- Response caching
- Database indexing
- Lazy loading on frontend
- Optimized asset delivery
- Connection pooling

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributors

Legal Intelligence Team

## 📞 Support

For support and queries:
- Email: support@legalintelligence.ai
- Documentation: `/docs`
- Issues: GitHub Issues

---

**Built with ❤️ for the Legal Tech Community**
