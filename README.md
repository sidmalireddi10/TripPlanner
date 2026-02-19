# TripPlanner AI

An AI-powered travel planning MVP that lets users chat with an LLM to plan trips (flights, hotels, itinerary, transport, activities).

## Features

- 🗣️ **Conversational Chat UI** - Natural conversation interface for trip planning
- 🤔 **Intelligent Follow-up Questions** - Asks thoughtful questions when information is missing
- 📋 **Complete Trip Plans** - Generates comprehensive itineraries once enough info is gathered
- 🔄 **Iterative Refinement** - Supports refining plans (cheaper options, different dates, adding activities, etc.)
- 🎯 **OpenAI-Compatible** - Works with any OpenAI-compatible LLM API endpoint
- 🚀 **Production-Ready** - Clean, readable, extensible codebase

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Serverless API Routes**
- **React Client Components**
- **Tailwind CSS**
- **OpenAI SDK** (with abstraction layer)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API key (or compatible API endpoint)

### Installation

1. **Clone and install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```bash
# Create it manually (recommended)
touch .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here

# Optional: Use a different OpenAI-compatible API endpoint
# OPENAI_BASE_URL=https://api.openai.com/v1

# Optional: Specify a different model
# OPENAI_MODEL=gpt-4o-mini
```

3. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Start a conversation by describing your trip plans
   - Example: "I want to visit Paris from New York in June"
   
2. Answer follow-up questions about:
   - Destination and origin
   - Travel dates
   - Budget
   - Number of travelers
   - Accommodation preferences
   - Interests and activities
   - Transport preferences
   - Special requirements

3. Once enough information is gathered, a complete trip plan will be generated including:
   - Flight suggestions
   - Accommodation recommendations
   - Day-by-day itinerary
   - Transportation options
   - Activity suggestions
   - Budget breakdown

4. Refine your plan by asking for changes:
   - "Can you make it cheaper?"
   - "What if I go in July instead?"
   - "Add more cultural activities"

## Project Structure

```
TripPlanner/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API route for chat interactions
│   ├── components/
│   │   ├── Chat.tsx              # Main chat UI component
│   │   └── TripPlanView.tsx      # Trip plan display component
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── lib/
│   ├── llm.ts                    # LLM abstraction layer
│   └── prompts.ts                # System prompts and preference extraction
├── types/
│   └── trip.ts                   # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

### LLM Abstraction

The `LLMClient` class in `lib/llm.ts` provides an abstraction layer that works with any OpenAI-compatible API endpoint. This makes it easy to switch between different providers.

### State Management

Currently uses in-memory state storage per session. In production, this would be replaced with a database or session store.

### Preference Extraction

The system uses pattern matching to extract trip preferences from user messages, combined with LLM intelligence for understanding context.

### Trip Plan Generation

Once enough information is gathered, the LLM generates a structured JSON trip plan that includes all necessary details for a complete itinerary.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `OPENAI_BASE_URL` | Custom API endpoint (default: OpenAI) | No |
| `OPENAI_MODEL` | Model to use (default: gpt-4o-mini) | No |

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Notes

- **No Database**: Currently uses in-memory state. Sessions are lost on server restart.
- **No Authentication**: MVP doesn't include user authentication.
- **No Payments/Booking**: Planning only - no actual booking functionality.
- **API Rate Limits**: Be aware of your LLM provider's rate limits.

## Future Enhancements

- Database integration for persistent sessions
- User authentication
- Export trip plans (PDF, JSON)
- Save and load trip plans
- Multi-language support
- Integration with booking APIs (when ready)

## License

MIT
