# API Documentation - AI Legal Intelligence System

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ]
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user",
  "organization": "Law Firm Name",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

#### Get Current User
```http
GET /auth/me
```
*Requires Authentication*

#### Update Profile
```http
PUT /auth/update-profile
```
*Requires Authentication*

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "organization": "New Law Firm",
  "phone": "+1234567890"
}
```

#### Logout
```http
POST /auth/logout
```
*Requires Authentication*

---

### Cases

#### Get All Cases
```http
GET /cases?page=1&limit=10
```
*Requires Authentication*

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "message": "Cases retrieved successfully",
  "data": {
    "cases": [ ... ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Create Case
```http
POST /cases
```
*Requires Authentication*

**Content-Type:** `multipart/form-data`

**Form Data:**
- `caseTitle`: string (required)
- `firNumber`: string (required)
- `policeStation`: string (required)
- `court`: string (required) - "District Court" | "High Court" | "Supreme Court" | "Other"
- `state`: string (required)
- `caseType`: string (required) - "Criminal" | "Civil" | "Constitutional" | "Other"
- `documents`: file[] (optional) - Max 5 files, 10MB each

**Response:**
```json
{
  "status": "success",
  "message": "Case created successfully",
  "data": {
    "case": {
      "id": "case_id",
      "caseTitle": "Case Title",
      "firNumber": "FIR123/2024",
      ...
    }
  }
}
```

#### Get Case by ID
```http
GET /cases/:id
```
*Requires Authentication*

#### Update Case
```http
PUT /cases/:id
```
*Requires Authentication*

**Request Body:**
```json
{
  "caseTitle": "Updated Title",
  "caseStatus": "Analyzed",
  "notes": "Additional notes"
}
```

#### Delete Case
```http
DELETE /cases/:id
```
*Requires Authentication (Admin/Lawyer only)*

#### Search Cases
```http
GET /cases/search?q=search_query
```
*Requires Authentication*

#### Filter Cases
```http
GET /cases/filter?court=High Court&state=Delhi&caseType=Criminal
```
*Requires Authentication*

**Query Parameters:**
- `court`: string (optional)
- `state`: string (optional)
- `caseType`: string (optional)
- `caseStatus`: string (optional)

#### Get Case Statistics
```http
GET /cases/stats/overview
```
*Requires Authentication*

---

### Analysis

#### Analyze Case
```http
POST /analysis/case/:id
```
*Requires Authentication*

**Response:**
```json
{
  "status": "success",
  "message": "Case analyzed successfully",
  "data": {
    "analysis": {
      "analyzed": true,
      "analyzedAt": "2024-01-01T00:00:00.000Z",
      "summary": "AI-generated summary",
      "keyFindings": [ ... ],
      "riskLevel": "Medium",
      "similarCases": [ ... ],
      "legalInsights": [ ... ],
      "retrialProbability": 65
    }
  }
}
```

#### Get IPC to BNS Mapping
```http
GET /analysis/ipc-bns/:ipcSection
```
*Requires Authentication*

**Example:**
```http
GET /analysis/ipc-bns/420
```

**Response:**
```json
{
  "status": "success",
  "message": "Mapping retrieved successfully",
  "data": {
    "mapping": {
      "ipcSection": "420",
      "ipcDescription": "Cheating and dishonestly inducing delivery of property",
      "ipcPunishment": "Imprisonment up to 7 years and fine",
      "bnsSection": "318",
      "bnsDescription": "Cheating",
      "bnsPunishment": "Imprisonment up to 7 years and fine",
      "mappingType": "Direct",
      "changes": "No major changes"
    }
  }
}
```

#### Search IPC/BNS Mappings
```http
GET /analysis/ipc-bns/search?q=cheating
```
*Requires Authentication*

#### Bulk IPC to BNS Mapping
```http
POST /analysis/ipc-bns/bulk
```
*Requires Authentication*

**Request Body:**
```json
{
  "ipcSections": ["420", "406", "120B"]
}
```

#### Check Petition Eligibility
```http
POST /analysis/petition-eligibility
```
*Requires Authentication*

**Request Body:**
```json
{
  "caseId": "case_id"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Eligibility evaluated",
  "data": {
    "eligibility": {
      "eligible": true,
      "score": 75,
      "reasoning": "AI-generated reasoning",
      "recommendations": [ ... ],
      "evaluatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Find Similar Cases
```http
GET /analysis/similar-cases/:id
```
*Requires Authentication*

---

### Analytics

#### Get Dashboard Statistics
```http
GET /analytics/dashboard
```
*Requires Authentication*

**Response:**
```json
{
  "status": "success",
  "message": "Dashboard stats retrieved",
  "data": {
    "stats": {
      "totalCases": 150,
      "analyzedCases": 120,
      "pendingCases": 30,
      "eligiblePetitions": 45,
      "casesByType": [ ... ],
      "casesByCourt": [ ... ]
    }
  }
}
```

#### Get Trends
```http
GET /analytics/trends
```
*Requires Authentication*

#### Get Monthly Trends
```http
GET /analytics/trends/monthly
```
*Requires Authentication*

#### Get State-wise Analytics
```http
GET /analytics/state-wise
```
*Requires Authentication*

#### Get IPC Frequency
```http
GET /analytics/ipc-frequency
```
*Requires Authentication*

**Response:**
```json
{
  "status": "success",
  "message": "IPC frequency retrieved",
  "data": {
    "ipcFrequency": [
      { "_id": "420", "count": 45 },
      { "_id": "406", "count": 32 },
      ...
    ]
  }
}
```

#### Get BNS Frequency
```http
GET /analytics/bns-frequency
```
*Requires Authentication*

#### Get IPC-BNS Comparison
```http
GET /analytics/ipc-bns-comparison
```
*Requires Authentication*

#### Get Risk Distribution
```http
GET /analytics/risk-distribution
```
*Requires Authentication*

---

### Reports

#### Generate Report
```http
POST /reports/generate
```
*Requires Authentication*

**Request Body:**
```json
{
  "reportTitle": "Monthly Case Analysis",
  "reportType": "Case Analysis",
  "caseId": "case_id",
  "format": "PDF"
}
```

**Report Types:**
- "Case Analysis"
- "IPC-BNS Comparison"
- "Petition Eligibility"
- "Analytics Summary"
- "Custom"

**Formats:**
- "PDF"
- "Excel"
- "JSON"
- "HTML"

#### Get All Reports
```http
GET /reports
```
*Requires Authentication*

#### Get Report by ID
```http
GET /reports/:id
```
*Requires Authentication*

#### Download Report
```http
GET /reports/:id/download
```
*Requires Authentication*

#### Delete Report
```http
DELETE /reports/:id
```
*Requires Authentication*

#### Get Report Templates
```http
GET /reports/templates/list
```
*Requires Authentication*

---

### AI Assistant

#### Chat with AI
```http
POST /assistant/chat
```
*Requires Authentication*

**Request Body:**
```json
{
  "message": "Explain IPC Section 302",
  "context": {
    "caseId": "optional_case_id"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Chat response generated",
  "data": {
    "response": {
      "message": "AI assistant response",
      "suggestions": [ ... ],
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get Suggested Prompts
```http
GET /assistant/suggestions
```
*Requires Authentication*

**Response:**
```json
{
  "status": "success",
  "message": "Suggestions retrieved",
  "data": {
    "suggestions": [
      "Explain IPC Section 302",
      "What is the BNS equivalent of IPC 420?",
      ...
    ]
  }
}
```

---

### User Management (Admin Only)

#### Get All Users
```http
GET /users?page=1&limit=10
```
*Requires Authentication (Admin)*

#### Get User by ID
```http
GET /users/:id
```
*Requires Authentication (Admin)*

#### Update User
```http
PUT /users/:id
```
*Requires Authentication (Admin)*

#### Delete User
```http
DELETE /users/:id
```
*Requires Authentication (Admin)*

#### Activate User
```http
PUT /users/:id/activate
```
*Requires Authentication (Admin)*

#### Deactivate User
```http
PUT /users/:id/deactivate
```
*Requires Authentication (Admin)*

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 20 requests per hour

## File Upload Limits

- **Max File Size**: 10MB per file
- **Max Files**: 5 files per request
- **Allowed Types**: PDF, DOC, DOCX, TXT

## Pagination

All list endpoints support pagination:

```
?page=1&limit=10
```

Response includes pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Webhooks (Coming Soon)

Webhook support for real-time notifications:
- Case analysis completed
- Petition eligibility evaluated
- Report generated

---

**API Version:** v1
**Last Updated:** 2024
**Support:** support@legalintelligence.ai
