# Project Structure - AI Legal Intelligence System

## Overview

This document provides a comprehensive overview of the project structure, file organization, and architecture.

## Directory Structure

```
legal-intelligence-system/
├── backend/                          # Backend Node.js application
│   ├── agents/                       # CrewAI agent orchestration
│   │   └── orchestrator.js          # Main agent orchestrator
│   ├── config/                       # Configuration files
│   │   ├── database.js              # MongoDB configuration
│   │   └── jwt.js                   # JWT configuration
│   ├── controllers/                  # Route controllers
│   │   ├── auth.controller.js       # Authentication logic
│   │   ├── case.controller.js       # Case management logic
│   │   ├── analysis.controller.js   # AI analysis logic
│   │   ├── analytics.controller.js  # Analytics logic
│   │   ├── report.controller.js     # Report generation logic
│   │   ├── assistant.controller.js  # AI assistant logic
│   │   └── user.controller.js       # User management logic
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                  # Authentication middleware
│   │   ├── errorHandler.js          # Error handling middleware
│   │   ├── rateLimiter.js           # Rate limiting middleware
│   │   ├── validator.js             # Input validation middleware
│   │   └── upload.js                # File upload middleware
│   ├── models/                       # MongoDB models
│   │   ├── User.model.js            # User schema
│   │   ├── Case.model.js            # Case schema
│   │   ├── IpcBnsMapping.model.js   # IPC-BNS mapping schema
│   │   ├── Report.model.js          # Report schema
│   │   ├── Analytics.model.js       # Analytics schema
│   │   └── AIResult.model.js        # AI result schema
│   ├── routes/                       # API routes
│   │   ├── auth.routes.js           # Authentication routes
│   │   ├── case.routes.js           # Case routes
│   │   ├── analysis.routes.js       # Analysis routes
│   │   ├── analytics.routes.js      # Analytics routes
│   │   ├── report.routes.js         # Report routes
│   │   ├── assistant.routes.js      # AI assistant routes
│   │   └── user.routes.js           # User management routes
│   ├── services/                     # Business logic services
│   │   └── (to be added)            # Service layer implementations
│   ├── mcp_tools/                    # MCP tool integrations
│   │   ├── legal_search.tool.js     # Legal search tool
│   │   └── document_analyzer.tool.js # Document analyzer tool
│   ├── utils/                        # Utility functions
│   │   ├── logger.js                # Winston logger
│   │   ├── response.js              # API response utilities
│   │   └── pdfExtractor.js          # PDF text extraction
│   └── server.js                     # Express server entry point
│
├── frontend/                         # Frontend application
│   ├── pages/                        # HTML pages
│   │   ├── login.html               # Login page
│   │   ├── signup.html              # Signup page
│   │   ├── dashboard.html           # Main dashboard
│   │   ├── upload-case.html         # Case upload page
│   │   ├── cases.html               # Cases list page
│   │   ├── case-analysis.html       # Case analysis page
│   │   ├── ipc-bns-analysis.html    # IPC-BNS comparison page
│   │   ├── petition-eligibility.html # Petition eligibility page
│   │   ├── analytics.html           # Analytics dashboard
│   │   ├── ai-assistant.html        # AI assistant chat page
│   │   ├── reports.html             # Reports page
│   │   └── settings.html            # Settings page
│   ├── css/                          # Stylesheets
│   │   └── styles.css               # Global styles
│   ├── js/                           # JavaScript modules
│   │   ├── api.js                   # API client
│   │   ├── auth.js                  # Authentication utilities
│   │   ├── charts.js                # Chart configurations
│   │   └── utils.js                 # Utility functions
│   ├── components/                   # Reusable UI components
│   │   ├── navbar.js                # Navigation bar
│   │   ├── sidebar.js               # Sidebar component
│   │   ├── card.js                  # Card component
│   │   └── modal.js                 # Modal component
│   ├── assets/                       # Static assets
│   │   ├── images/                  # Images
│   │   ├── icons/                   # Icons
│   │   └── fonts/                   # Custom fonts
│   └── index.html                    # Landing page
│
├── uploads/                          # File uploads directory
│   ├── cases/                       # Case documents
│   └── .gitkeep                     # Git placeholder
│
├── logs/                             # Application logs
│   ├── combined.log                 # All logs
│   └── error.log                    # Error logs
│
├── docs/                             # Documentation
│   ├── api/                         # API documentation
│   ├── guides/                      # User guides
│   └── architecture/                # Architecture diagrams
│
├── tests/                            # Test files
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── package.json                      # Node.js dependencies
├── README.md                         # Project README
├── DEPLOYMENT.md                     # Deployment guide
├── API_DOCUMENTATION.md              # API documentation
└── PROJECT_STRUCTURE.md              # This file
```

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology Stack:**
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS for styling
- GSAP for animations
- Chart.js for data visualization
- Axios for HTTP requests
- Lucide Icons

**Key Features:**
- Responsive design (mobile-first)
- Dark futuristic theme
- Glassmorphism UI effects
- Real-time updates
- Interactive dashboards

### 2. Application Layer (Backend)

**Technology Stack:**
- Node.js & Express.js
- RESTful API architecture
- JWT authentication
- Multer for file uploads
- Winston for logging

**Key Components:**
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic implementation
- **Middleware**: Request processing pipeline
- **Routes**: API endpoint definitions

### 3. Data Layer

**Technology Stack:**
- MongoDB (NoSQL database)
- Mongoose ODM
- Indexing for performance
- Text search capabilities

**Collections:**
- `users`: User accounts
- `cases`: Legal cases
- `ipc_bns_mapping`: IPC to BNS mappings
- `reports`: Generated reports
- `analytics`: Analytics data
- `ai_results`: AI analysis results

### 4. AI/ML Layer

**Technology Stack:**
- CrewAI multi-agent system
- MCP (Model Context Protocol) tools
- OpenAI integration (planned)

**Agents:**
1. **Case Classification Agent**: Categorizes cases
2. **IPC vs BNS Agent**: Maps IPC to BNS sections
3. **Petition Eligibility Agent**: Evaluates eligibility
4. **Suggestion Agent**: Provides recommendations
5. **Analytics Agent**: Generates insights

## Data Flow

### Case Upload & Analysis Flow

```
User → Frontend → Backend API → File Storage
                      ↓
                 PDF Extraction
                      ↓
                 Text Processing
                      ↓
              CrewAI Orchestrator
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
Classification    IPC-BNS      Eligibility
    Agent         Agent          Agent
        ↓             ↓             ↓
        └─────────────┼─────────────┘
                      ↓
              MongoDB Storage
                      ↓
            Frontend Dashboard
```

### Authentication Flow

```
User Credentials → Backend API → Validation
                                      ↓
                              Password Check
                                      ↓
                              JWT Generation
                                      ↓
                          Access + Refresh Tokens
                                      ↓
                            Frontend Storage
                                      ↓
                        Subsequent API Requests
```

## API Architecture

### RESTful Principles

- **Resource-based URLs**: `/api/v1/cases`, `/api/v1/analysis`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: Proper HTTP status codes
- **JSON Format**: Request/response in JSON
- **Versioning**: API version in URL (`/v1`)

### Middleware Pipeline

```
Request
  ↓
CORS
  ↓
Helmet (Security)
  ↓
Body Parser
  ↓
Rate Limiter
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Controller
  ↓
Error Handler
  ↓
Response
```

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Access (7 days) + Refresh (30 days)
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: User, Lawyer, Admin roles
- **Token Refresh**: Automatic token renewal

### Security Measures

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: express-validator
- **File Upload Restrictions**: Type and size limits
- **SQL Injection Prevention**: Mongoose ODM
- **XSS Protection**: Input sanitization

## Database Schema Design

### User Schema

```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ['user', 'lawyer', 'admin'],
  organization: String,
  phone: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Case Schema

```javascript
{
  caseTitle: String,
  firNumber: String (unique, indexed),
  policeStation: String,
  court: Enum,
  state: String (indexed),
  caseType: Enum (indexed),
  ipcSections: [{ section, description }],
  bnsMappings: [{ ipcSection, bnsSection, ... }],
  uploadedDocuments: [{ filename, path, ... }],
  extractedText: String (text-indexed),
  caseStatus: Enum (indexed),
  uploadedBy: ObjectId (ref: User, indexed),
  aiAnalysis: { ... },
  petitionEligibility: { ... },
  metadata: { ... },
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## Performance Optimization

### Backend Optimizations

- **Database Indexing**: Strategic indexes on frequently queried fields
- **Connection Pooling**: MongoDB connection pool
- **Compression**: gzip compression middleware
- **Caching**: Response caching (planned)
- **Pagination**: Limit query results
- **Lean Queries**: Mongoose lean() for read-only operations

### Frontend Optimizations

- **Lazy Loading**: Load resources on demand
- **Code Splitting**: Separate bundles
- **Asset Optimization**: Minified CSS/JS
- **CDN Usage**: External libraries from CDN
- **Image Optimization**: Compressed images
- **Browser Caching**: Cache static assets

## Scalability Considerations

### Horizontal Scaling

- **Stateless API**: No server-side sessions
- **Load Balancing**: Distribute traffic
- **Database Replication**: MongoDB replica sets
- **Microservices**: Separate AI processing (future)

### Vertical Scaling

- **Resource Optimization**: Efficient algorithms
- **Database Optimization**: Query optimization
- **Caching Layer**: Redis (planned)
- **CDN**: Static asset delivery

## Monitoring & Logging

### Logging Strategy

- **Winston Logger**: Structured logging
- **Log Levels**: error, warn, info, debug
- **Log Rotation**: Automatic log file rotation
- **Error Tracking**: Detailed error logs

### Monitoring Points

- **API Response Times**: Track performance
- **Error Rates**: Monitor failures
- **Database Queries**: Slow query detection
- **Resource Usage**: CPU, memory, disk
- **User Activity**: Track usage patterns

## Development Workflow

### Git Workflow

```
main (production)
  ↓
develop (staging)
  ↓
feature/* (features)
  ↓
bugfix/* (bug fixes)
```

### Code Standards

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Naming Conventions**: camelCase for variables, PascalCase for classes
- **Comments**: JSDoc for functions
- **Error Handling**: Try-catch blocks

## Testing Strategy

### Test Types

1. **Unit Tests**: Individual functions
2. **Integration Tests**: API endpoints
3. **E2E Tests**: User workflows
4. **Performance Tests**: Load testing

### Test Coverage Goals

- **Controllers**: 80%+
- **Services**: 90%+
- **Models**: 70%+
- **Utilities**: 85%+

## Deployment Architecture

### Production Environment

```
User → CDN (Static Assets)
  ↓
Load Balancer
  ↓
┌─────────┬─────────┬─────────┐
│ Node.js │ Node.js │ Node.js │
│ Instance│ Instance│ Instance│
└─────────┴─────────┴─────────┘
  ↓
MongoDB Cluster (Primary + Replicas)
```

### CI/CD Pipeline

```
Code Push → GitHub
  ↓
Automated Tests
  ↓
Build Process
  ↓
Deploy to Staging
  ↓
Manual Approval
  ↓
Deploy to Production
```

## Future Enhancements

### Planned Features

- [ ] Real-time notifications (WebSockets)
- [ ] Advanced AI models integration
- [ ] Mobile application (React Native)
- [ ] Blockchain for document verification
- [ ] Multi-language support
- [ ] Voice-to-text case input
- [ ] Advanced analytics with ML predictions
- [ ] Integration with court APIs
- [ ] Collaborative case management
- [ ] Video conferencing integration

### Technical Improvements

- [ ] GraphQL API option
- [ ] Redis caching layer
- [ ] Elasticsearch for advanced search
- [ ] Kubernetes orchestration
- [ ] Microservices architecture
- [ ] Event-driven architecture
- [ ] API gateway
- [ ] Service mesh

---

**Version:** 1.0.0
**Last Updated:** 2024
**Maintained By:** Legal Intelligence Team
