# Quick Start Guide

## 🚀 Get Your MVP Running in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Add Your GitHub Token
Edit `.env.local` and replace `your_github_token_here` with your actual GitHub token:

```bash
# Uses Azure OpenAI-compatible endpoint (same as your previous projects)
GITHUB_TOKEN=your_github_token_here
```

**Note:** This uses Azure's OpenAI-compatible endpoint (`https://models.inference.ai.azure.com`) with `gpt-4o` model, matching your previous project setup.

If you are using a **non-OpenAI provider** with an **OpenAI-compatible** endpoint, also set:

```env
OPENAI_BASE_URL=https://your-provider-openai-compatible-base-url
OPENAI_MODEL=gpt-4o-mini
```

### Step 3: Start the Development Server
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser!

## ✅ What's Already Set Up

- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ Chat UI component
- ✅ API route for LLM interactions
- ✅ Trip plan generation logic
- ✅ Environment file (`.env.local`) created
- ✅ All required dependencies in `package.json`

## 🎯 How to Use

1. **Start a conversation**: Type something like "I want to visit Paris from New York in June"
2. **Answer questions**: The AI will ask follow-up questions about dates, budget, travelers, etc.
3. **Get your plan**: Once enough info is gathered, a complete trip plan will be generated
4. **Refine**: Ask for changes like "make it cheaper" or "add more activities"

## 📝 Next Steps

1. Run `npm install` to install all dependencies
2. Add your OpenAI API key to `.env.local`
3. Run `npm run dev` to start the server
4. Start planning trips! 🎉

## ⚠️ Important Notes

- The `.env.local` file is gitignored for security
- Uses Azure OpenAI-compatible endpoint with GitHub token (same pattern as your previous projects)
- The app uses in-memory state (sessions reset on server restart)
- **No Netlify needed** - Next.js API routes work perfectly fine!
