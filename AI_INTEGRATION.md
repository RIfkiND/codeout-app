# AI Integration Setup

## Overview
The CodeOut app now includes AI-powered code analysis with real OpenAI integration and fallback static analysis.

## Features Added
- **Real AI Analysis**: OpenAI GPT-4 integration for code review
- **Fallback Analysis**: Static analysis when AI service unavailable
- **Challenge Templates**: Dynamic template loading based on challenge ID
- **Svelte 5 Compatible**: Updated components for latest Svelte syntax
- **Test Integration**: Connects to real code execution API

## Setup

### 1. Environment Variables
Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. AI Analysis Features
- **Code Quality Scoring**: 0-100 score with detailed breakdown
- **Smart Suggestions**: Context-aware improvement recommendations
- **Multi-language Support**: JavaScript, TypeScript, Python analysis
- **Performance Metrics**: Readability, performance, maintainability, best practices

### 3. Challenge Template System
The editor now dynamically loads templates based on challenge:
- `challengeId="two-sum"` → Two Sum problem template
- `challengeId="reverse-string"` → String reversal template
- Custom challenge data via `challengeData` prop

### 4. Components Structure

```
src/lib/
├── services/
│   └── aiService.ts           # AI analysis service
├── components/
│   ├── ui/
│   │   └── AIFeedback.svelte  # AI feedback display
│   ├── Editor/
│   │   └── CodeEditor.svelte  # Monaco Editor with AI analysis
│   └── home/
│       └── LiveCode.svelte    # Interactive playground
└── routes/
    └── api/
        └── ai/
            └── analyze/
                └── +server.ts # AI analysis API
```

### 5. Usage Examples

#### Monaco Editor with AI Analysis
```svelte
<CodeEditor 
  challengeId="two-sum"
  initialCode="function twoSum(nums, target) { /* your code */ }"
/>
```

#### Interactive Playground
```svelte
<LiveCode 
  language="javascript"
  challengeId="two-sum"
  initial="function solve() { return []; }"
/>
```

## API Endpoints

### POST /api/ai/analyze
Analyzes code and returns AI feedback:

```json
{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript", 
  "challengeId": "two-sum"
}
```

Returns:
```json
{
  "score": 85,
  "suggestions": [...],
  "codeQuality": {
    "readability": 90,
    "performance": 80,
    "maintainability": 85,
    "bestPractices": 85
  },
  "summary": "Good code quality with room for optimization"
}
```

## AI Service Fallback
If OpenAI API is unavailable, the system automatically falls back to static analysis that checks:
- Modern JavaScript syntax
- Code complexity
- Best practices
- Performance patterns
- Error handling

## Testing
Start the development server:
```bash
npm run dev
```

Visit `/` to see the new AI-powered editor and playground in action!