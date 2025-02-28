# AttendMe - The attending in your pocket

AttendMe is a medical assistant web application powered by AI that provides specialized medical information via a chat interface. The system uses prompt engineering and RAG (Retrieval Augmented Generation) to enhance answers returned to users.

## Tech Stack

- Frontend: Next.js, Tailwind, Shadcn, Framer Motion
- Backend: Postgres, Supabase, Drizzle ORM, Server Actions
- AI: OpenAI, LangChain, RAG with pg_vector
- Auth: Clerk
- Payments: Stripe
- Analytics: PostHog
- Deployment: Vercel

## Features

- AI-powered medical assistant with specialty-specific knowledge
- Reference library for saved citations
- Recent medical journal updates
- Dark-themed UI with bubble-based design elements
- Responsive interface for all devices

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Supabase account with pg_vector extension enabled
- OpenAI API key
- Clerk account (for auth)
- Stripe account (for payments)
- PostHog account (for analytics)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/attendme.git
cd attendme
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your environment variables in .env.local
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

```
# DB
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# AI
OPENAI_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PORTAL_LINK=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## RAG System

The application uses a Retrieval Augmented Generation (RAG) system to provide accurate medical information. The RAG system:

1. Creates embeddings for medical documents and stores them in Supabase's pg_vector database
2. Retrieves relevant documentation based on user queries
3. Enhances AI responses with retrieved context for more accurate answers
4. Extracts citations from the responses for referencing

## Project Structure

```
/
├── actions
│   ├── db
│   │   ├── citations-actions.ts
│   │   ├── library-actions.ts
│   │   ├── messages-actions.ts
│   │   ├── profiles-actions.ts
│   │   └── specialties-actions.ts
│   ├── ai-chat-actions.ts
│   ├── rag-actions.ts
│   └── prompts-actions.ts
├── app
│   ├── (auth)
│   ├── (marketing)
│   ├── dashboard
│   └── ...
├── components
│   ├── landing
│   ├── ui
│   ├── utilities
│   └── ...
├── db
│   ├── schema
│   └── db.ts
├── hooks
├── lib
│   ├── openai.ts
│   └── ...
├── prompts
├── public
└── types
```

## AI Chat Processing

The application uses OpenAI's API to process chat messages and provide medical information. The AI system:

1. Takes user messages and processes them with OpenAI's GPT-4 model
2. Enhances prompts with relevant medical knowledge retrieved from the RAG system
3. Formats responses with proper citations and references
4. Saves chat history and allows users to reference past conversations
5. Supports different medical specialties, adapting responses accordingly

The core AI functionality is implemented in `actions/ai-chat-actions.ts`, with utility functions in `lib/openai.ts`. These handle:

- Processing user messages and generating AI responses
- Extracting and formatting citations from responses
- Streaming responses for a better user experience
- Generating chat titles for better organization
