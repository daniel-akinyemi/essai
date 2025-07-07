# Paragraph Relevance Analyzer

A powerful tool for analyzing essay paragraphs individually for relevance to the main topic. This feature provides detailed feedback on each paragraph with suggestions for improvement and optional auto-fixing capabilities.

## Features

- **Individual Paragraph Analysis**: Analyzes each paragraph separately for relevance
- **Scoring System**: Provides relevance scores from 0-100 for each paragraph
- **Status Classification**: 
  - ✅ On-topic (score 80-100)
  - 🟡 Needs Improvement (score 50-79)
  - ❌ Off-topic (score 0-49)
- **Detailed Feedback**: Explains why each paragraph is or isn't relevant
- **Improvement Suggestions**: Provides specific advice for problematic paragraphs
- **Auto-fix Option**: Automatically generates improved versions of problematic paragraphs
- **Modern UI**: Clean, responsive interface with visual status indicators

## API Endpoint

### POST `/api/analyzeParagraphRelevance`

Analyzes each paragraph of an essay for relevance to the given topic.

#### Request Body

```json
{
  "topic": "The Role of Artificial Intelligence in Shaping the Future of Education",
  "essay": "Your essay content here...",
  "autoFix": true
}
```

#### Parameters

- `topic` (string, required): The essay topic or question
- `essay` (string, required): The complete essay content
- `autoFix` (boolean, optional): Whether to generate improved versions of problematic paragraphs

#### Response

```json
{
  "relevanceReport": [
    {
      "paragraph": 1,
      "originalText": "The original paragraph text...",
      "relevanceScore": 85,
      "status": "✅ On-topic",
      "feedback": "This paragraph directly addresses the topic with relevant examples.",
      "suggestion": null,
      "improvedParagraph": null
    },
    {
      "paragraph": 2,
      "originalText": "Another paragraph that needs improvement...",
      "relevanceScore": 65,
      "status": "🟡 Needs Improvement",
      "feedback": "This paragraph is somewhat relevant but could be more specific.",
      "suggestion": "Add more specific examples related to AI in education.",
      "improvedParagraph": "Improved version of the paragraph..."
    }
  ],
  "fixedEssay": "Complete essay with improved paragraphs (if autoFix is true)"
}
```

## Usage Examples

### Basic Analysis

```javascript
const response = await fetch('/api/analyzeParagraphRelevance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: "Climate Change Impact on Agriculture",
    essay: "Your essay content...",
    autoFix: false
  })
});

const result = await response.json();
console.log(result.relevanceReport);
```

### With Auto-fix

```javascript
const response = await fetch('/api/analyzeParagraphRelevance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: "Climate Change Impact on Agriculture",
    essay: "Your essay content...",
    autoFix: true
  })
});

const result = await response.json();
console.log(result.fixedEssay); // Improved essay
```

## UI Integration

The paragraph analyzer is integrated into the student dashboard at `/dashboard/student/paragraph-analyzer`. The interface includes:

- **Topic Input**: Enter the essay topic
- **Essay Content Area**: Paste the complete essay
- **Analysis Options**: Toggle auto-fix functionality
- **Results Display**: 
  - Summary statistics
  - Detailed paragraph analysis
  - Visual status indicators
  - Copy-to-clipboard functionality

## Testing

Run the test script to verify the API functionality:

```bash
node test-paragraph-analyzer.js
```

This will test the API with a sample essay about AI in education and display the results.

## Technical Implementation

### API Route
- **File**: `src/app/api/analyzeParagraphRelevance/route.ts`
- **Model**: Uses Mistral-7B-Instruct for analysis
- **Validation**: Input validation for topic and essay length
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Frontend Component
- **File**: `src/app/dashboard/student/paragraph-analyzer/page.tsx`
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks for form state and API responses

### UI Components
- **Textarea**: Custom component for essay input
- **Card Layout**: Organized display of analysis results
- **Status Indicators**: Color-coded status badges with icons
- **Copy Functionality**: One-click copying of improved essays

## Scoring Criteria

The analyzer evaluates paragraphs based on:

1. **Keyword Overlap**: Presence of topic-related keywords
2. **Semantic Similarity**: Conceptual relevance to the topic
3. **Topic Word Frequency**: How often topic words appear
4. **Contextual Relevance**: Whether the content supports the main argument

## Status Thresholds

- **✅ On-topic (80-100)**: Directly supports the main argument, uses relevant examples
- **🟡 Needs Improvement (50-79)**: Somewhat relevant but could be more specific
- **❌ Off-topic (0-49)**: Doesn't relate to the topic or contains irrelevant information

## Error Handling

The API includes comprehensive error handling for:

- Missing or invalid input parameters
- AI model response parsing errors
- Network connectivity issues
- Invalid JSON responses

All errors are returned with descriptive messages to help users understand and resolve issues.

## Future Enhancements

Potential improvements for the paragraph analyzer:

1. **Batch Processing**: Analyze multiple essays simultaneously
2. **Custom Scoring Weights**: Allow users to adjust scoring criteria
3. **Export Options**: PDF reports, CSV data export
4. **Integration**: Connect with existing essay scoring system
5. **Advanced Analytics**: Trend analysis across multiple essays 