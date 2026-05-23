# CrewAI Integration Guide

## Overview

This application is now fully integrated with your deployed CrewAI Legal Intelligence Multi-Agent System at:
```
https://enterprise-ai-legal-intelligence-platform-c-32c1ec28.crewai.com
```

## Architecture

```
Frontend (HTML/CSS/JS)
        ↓
Node.js Backend (Express)
        ↓
CrewAI Service Layer
        ↓
CrewAI Deployed API
        ↓
Multi-Agent Workflow
        ↓
AI Analysis Results
        ↓
MongoDB Storage
        ↓
Dashboard Visualization
```

## Configuration

### 1. Environment Variables

The `.env` file has been created with CrewAI configuration:

```env
# CrewAI Configuration
CREWAI_API_URL=https://enterprise-ai-legal-intelligence-platform-c-32c1ec28.crewai.com
CREWAI_BEARER_TOKEN=your_bearer_token_here
CREWAI_USER_BEARER_TOKEN=your_user_bearer_token_here
```

**IMPORTANT**: CrewAI uses **Bearer Token authentication** (not API keys).

Your tokens are already configured:
```env
CREWAI_BEARER_TOKEN=e7ff9dba24b1
CREWAI_USER_BEARER_TOKEN=dee4248e1f8f
```

### 2. Bearer Token Authentication

CrewAI uses two types of tokens:

1. **Bearer Token** (`CREWAI_BEARER_TOKEN`): Primary authentication token
   - Used in `Authorization: Bearer {token}` header
   - Required for all API requests

2. **User Bearer Token** (`CREWAI_USER_BEARER_TOKEN`): User-specific token
   - Used in `X-User-Token: {token}` header
   - Optional, for user-specific operations

**How to get your tokens**:
1. Go to your CrewAI deployment dashboard
2. Navigate to API settings or Authentication section
3. Copy both "Bearer Token" and "User Bearer Token"
4. Update them in the `.env` file

## Integration Points

### 1. Case Analysis

**Endpoint**: `POST /api/v1/analysis/case/:id`

**Flow**:
1. User uploads case with documents
2. Backend extracts text from PDF
3. Backend calls `crewAIService.analyzeCaseWithCrewAI(caseData)`
4. CrewAI processes with multi-agent workflow
5. Results stored in MongoDB
6. Dashboard displays analysis

**CrewAI Payload**:
```javascript
{
  inputs: {
    case_text: "extracted text from PDF",
    case_title: "Case Title",
    fir_number: "FIR123/2024",
    police_station: "Station Name",
    court: "High Court",
    state: "Delhi",
    case_type: "Criminal",
    ipc_sections: "420, 406",
    metadata: {
      dateOfIncident: "2024-01-01",
      accused: ["Name1", "Name2"],
      victims: ["Victim1"]
    }
  }
}
```

**Expected Response**:
```javascript
{
  case_status: "Pending",
  case_category: "Criminal",
  severity: "Medium",
  confidence_score: 0.89,
  case_summary: "AI-generated summary",
  key_findings: ["Finding 1", "Finding 2"],
  ipc_sections: ["420", "406"],
  bns_mappings: [
    {
      ipcSection: "420",
      bnsSection: "318",
      description: "Cheating"
    }
  ],
  risk_level: "Medium",
  related_cases: [],
  legal_insights: ["Insight 1", "Insight 2"],
  petition_probability: 72,
  retrial_probability: 65,
  confidence_score: 0.89
}
```

### 2. IPC to BNS Mapping

**Endpoint**: `GET /api/v1/analysis/ipc-bns/:ipcSection`

**Flow**:
1. User requests IPC section mapping
2. Backend checks database first
3. If not found, calls `crewAIService.getIPCToBNSMapping(ipcSection)`
4. CrewAI returns BNS mapping
5. Result saved to database
6. Response sent to frontend

**CrewAI Payload**:
```javascript
{
  inputs: {
    ipc_section: "420",
    action: "ipc_to_bns_mapping"
  }
}
```

**Expected Response**:
```javascript
{
  ipc_section: "420",
  ipc_description: "Cheating and dishonestly inducing delivery of property",
  ipc_punishment: "Imprisonment up to 7 years and fine",
  bns_section: "318",
  bns_description: "Cheating",
  bns_punishment: "Imprisonment up to 7 years and fine",
  mapping_type: "Direct",
  changes: "No major changes",
  confidence: 0.95
}
```

### 3. Petition Eligibility

**Endpoint**: `POST /api/v1/analysis/petition-eligibility`

**Flow**:
1. User requests eligibility check
2. Backend calls `crewAIService.evaluatePetitionEligibility(caseData)`
3. CrewAI evaluates eligibility
4. Results stored in case document
5. Frontend displays eligibility score and reasoning

**CrewAI Payload**:
```javascript
{
  inputs: {
    case_text: "extracted text",
    case_title: "Case Title",
    ipc_sections: "420, 406",
    case_status: "Pending",
    court: "High Court",
    action: "petition_eligibility"
  }
}
```

**Expected Response**:
```javascript
{
  petition_eligible: true,
  petition_score: 75,
  petition_probability: 72,
  petition_reasoning: "AI-generated reasoning",
  recommendations: ["Recommendation 1", "Recommendation 2"],
  positive_factors: ["Factor 1", "Factor 2"],
  negative_factors: ["Factor 1"],
  confidence: 0.87
}
```

### 4. AI Legal Assistant

**Endpoint**: `POST /api/v1/assistant/chat`

**Flow**:
1. User sends message to AI assistant
2. Backend calls `crewAIService.chatWithAssistant(message, context)`
3. CrewAI generates response
4. Response sent to frontend

**CrewAI Payload**:
```javascript
{
  inputs: {
    user_message: "What is IPC Section 420?",
    context: {
      caseId: "optional_case_id"
    },
    action: "legal_assistant"
  }
}
```

**Expected Response**:
```javascript
{
  assistant_response: "IPC Section 420 deals with cheating...",
  suggestions: ["Related question 1", "Related question 2"],
  references: ["Reference 1", "Reference 2"],
  confidence: 0.92
}
```

### 5. Similar Cases

**Endpoint**: `GET /api/v1/analysis/similar-cases/:id`

**Flow**:
1. User requests similar cases
2. Backend calls `crewAIService.findSimilarCases(caseData)`
3. CrewAI finds similar cases
4. Results displayed on frontend

**CrewAI Payload**:
```javascript
{
  inputs: {
    case_text: "extracted text",
    ipc_sections: "420, 406",
    case_type: "Criminal",
    action: "find_similar_cases"
  }
}
```

## Service Layer

### CrewAI Service (`backend/services/crewai.service.js`)

The service provides these methods:

1. **analyzeCaseWithCrewAI(caseData)** - Full case analysis
2. **getIPCToBNSMapping(ipcSection)** - IPC to BNS mapping
3. **evaluatePetitionEligibility(caseData)** - Petition eligibility
4. **chatWithAssistant(message, context)** - AI assistant chat
5. **findSimilarCases(caseData)** - Find similar cases
6. **checkHealth()** - API health check

### Error Handling

The service includes comprehensive error handling:

```javascript
try {
  const analysis = await crewAIService.analyzeCaseWithCrewAI(caseData);
} catch (error) {
  // Error is logged and saved to AIResult collection
  logger.error(`CrewAI error: ${error.message}`);
  // Graceful fallback or error response
}
```

## Database Storage

### AIResult Collection

All AI interactions are logged:

```javascript
{
  caseId: ObjectId,
  agentType: "Case Classification",
  input: { ... },
  output: { ... },
  confidence: 0.89,
  processingTime: 2500,
  status: "Success",
  createdAt: Date
}
```

### Case Document Updates

AI results are stored in the case document:

```javascript
{
  aiAnalysis: {
    analyzed: true,
    analyzedAt: Date,
    summary: "...",
    keyFindings: [...],
    riskLevel: "Medium",
    confidence: { ... }
  },
  petitionEligibility: {
    eligible: true,
    score: 75,
    reasoning: "...",
    recommendations: [...]
  },
  bnsMappings: [...]
}
```

## Testing the Integration

### 1. Health Check

```bash
# Check if CrewAI API is accessible
curl http://localhost:5000/api/v1/health
```

### 2. Test Case Analysis

```bash
# Upload a case first, then analyze
curl -X POST http://localhost:5000/api/v1/analysis/case/CASE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test IPC Mapping

```bash
curl -X GET http://localhost:5000/api/v1/analysis/ipc-bns/420 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test AI Assistant

```bash
curl -X POST http://localhost:5000/api/v1/assistant/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain IPC Section 302"}'
```

## Frontend Integration

### API Client (`frontend/js/api.js`)

The API client already includes methods for all CrewAI endpoints:

```javascript
// Analyze case
await api.analyzeCase(caseId);

// Get IPC to BNS mapping
await api.getIPCToBNSMapping('420');

// Check petition eligibility
await api.checkPetitionEligibility(caseId);

// Chat with AI
await api.chat('What is IPC 420?', { caseId });

// Find similar cases
await api.findSimilarCases(caseId);
```

### Dashboard Display

The dashboard automatically displays AI results:

```javascript
// Case analysis results
{
  summary: "AI-generated summary",
  keyFindings: ["Finding 1", "Finding 2"],
  riskLevel: "Medium",
  confidence: 0.89
}

// Petition eligibility
{
  eligible: true,
  score: 75,
  reasoning: "AI reasoning"
}

// BNS mappings
[
  {
    ipcSection: "420",
    bnsSection: "318",
    description: "Cheating"
  }
]
```

## Performance Optimization

### 1. Caching

IPC to BNS mappings are cached in MongoDB:
- First request: Calls CrewAI API
- Subsequent requests: Retrieved from database

### 2. Timeouts

Different timeouts for different operations:
- Case analysis: 120 seconds
- IPC mapping: 30 seconds
- Petition eligibility: 60 seconds
- AI chat: 45 seconds

### 3. Async Processing

All CrewAI calls are asynchronous and non-blocking.

## Monitoring

### Logs

All CrewAI interactions are logged:

```
INFO: Starting CrewAI analysis for case: FIR123/2024
INFO: CrewAI analysis completed for case: FIR123/2024 (2500ms)
ERROR: CrewAI analysis error: Connection timeout
```

### AI Results Tracking

Check AI performance:

```javascript
// Get all AI results
db.ai_results.find({ status: "Success" })

// Get average processing time
db.ai_results.aggregate([
  { $group: { _id: "$agentType", avgTime: { $avg: "$processingTime" } } }
])

// Get confidence scores
db.ai_results.aggregate([
  { $group: { _id: "$agentType", avgConfidence: { $avg: "$confidence" } } }
])
```

## Troubleshooting

### Issue: "CrewAI API Error: Unauthorized"

**Solution**: 
- Check your Bearer Tokens in `.env` file
- Ensure `CREWAI_BEARER_TOKEN` is set correctly
- Verify tokens are not expired
- Check token format (should be alphanumeric string)

### Issue: "Connection timeout"

**Solution**: 
- Check internet connection
- Verify CrewAI API URL
- Increase timeout in service

### Issue: "Invalid response format"

**Solution**: 
- Check CrewAI API response structure
- Update `parseCrewAIResponse()` method

### Issue: "Rate limit exceeded"

**Solution**: 
- Implement request queuing
- Add retry logic with exponential backoff

## Next Steps

1. **Bearer Tokens are configured** in `.env` file ✅
2. **Test the integration** with sample cases
3. **Monitor AI results** in MongoDB
4. **Optimize based on performance** metrics
5. **Add more AI features** as needed

## Support

For CrewAI-specific issues:
- CrewAI Documentation: https://docs.crewai.com
- CrewAI Dashboard: https://app.crewai.com

For integration issues:
- Check logs: `logs/combined.log`
- Review AI results: MongoDB `ai_results` collection
- Contact: support@legalintelligence.ai

---

**Integration Status**: ✅ **COMPLETE**

The application is now fully integrated with your CrewAI deployment and ready to use real AI-powered legal intelligence!
