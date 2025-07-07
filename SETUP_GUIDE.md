# Project Setup Guide

## Environment Variables Required

Create a `.env` file in the root directory (`essai/`) with the following variables:

```env
# OpenRouter API Configuration (REQUIRED)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Database Configuration (if using Prisma)
DATABASE_URL=your_database_url_here

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Getting OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Go to your dashboard
4. Copy your API key
5. Replace `your_openrouter_api_key_here` in the `.env` file

## Installation Steps

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Create .env file** with your API keys (see above)

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Test the paragraph analyzer:**
   ```bash
   node test-paragraph-analyzer.js
   ```

## Features Available

- ✅ **Paragraph Relevance Analyzer**: `/dashboard/student/paragraph-analyzer`
- ✅ **Essay Generator**: `/dashboard/student/essay-generator`
- ✅ **Essay Scoring**: `/dashboard/student/submit-essay`
- ✅ **Essay Rewriter**: `/dashboard/student/essay-rewriter`

## Troubleshooting

### "OpenRouter API key is required" Error
- Make sure you have created a `.env` file
- Verify your OpenRouter API key is correct
- Restart the development server after adding the `.env` file

### Font Loading Issues
- These are non-critical warnings and won't affect functionality
- The app will use fallback fonts

### API Response Errors
- Check that your OpenRouter API key has sufficient credits
- Verify the API key has access to the Mistral model

## Project Structure

```
essai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyzeParagraphRelevance/  # New paragraph analyzer API
│   │   └── dashboard/
│   │       └── student/
│   │           └── paragraph-analyzer/      # New UI page
│   ├── components/
│   │   ├── ui/
│   │   │   └── textarea.tsx                # New UI component
│   │   └── student/
│   │       └── StudentSidebar.tsx          # Updated with new nav
│   └── lib/
│       └── openrouter.ts                   # API client
├── test-paragraph-analyzer.js              # Test script
└── PARAGRAPH_ANALYZER_README.md            # Detailed documentation
``` 