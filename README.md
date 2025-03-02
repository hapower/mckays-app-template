# AttendMe - The attending in your pocket

AttendMe is a medical assistant web application powered by AI that provides specialized medical information via a chat interface. The system uses prompt engineering and RAG (Retrieval Augmented Generation) to enhance answers returned to users.

## Tech Stack

- **Frontend**: 
  - Next.js 14 with App Router
  - Tailwind CSS for styling
  - Shadcn UI components
  - Framer Motion for animations
  - React Server Components

- **Backend**: 
  - Postgres database
  - Supabase with pg_vector for vector embeddings
  - Drizzle ORM for database interactions
  - Server Actions for API calls

- **AI**: 
  - OpenAI API (GPT-4) for chat responses
  - LangChain for AI interactions
  - RAG with pg_vector embeddings for context-based responses
  - Custom prompt engineering for medical specialties

- **Auth**: 
  - Clerk for authentication and user management

- **Payments**: 
  - Stripe for subscription management and payments

- **Analytics**: 
  - PostHog for user analytics and tracking

- **Deployment**: 
  - Vercel for production deployment

## Features

- **AI-powered Medical Assistant**:
  - Specialty-specific knowledge across different medical domains
  - Context-aware responses using RAG technology
  - Citation generation for medical information
  - Conversation history for reference

- **Reference Library**:
  - Save and organize important citations from chats
  - Search and filter saved references
  - Export citations in standard formats

- **Medical Knowledge Base**:
  - Recent medical journal updates
  - Specialty-specific information
  - Evidence-based responses with citations

- **User Experience**:
  - Dark-themed UI with bubble-based design elements
  - Responsive interface for all devices (desktop, tablet, mobile)
  - Streaming responses for better user experience
  - Intuitive chat interface

- **User Management**:
  - User profiles with specialty preferences
  - Subscription management (free and premium tiers)
  - Secure authentication

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

4. Set up the database
```bash
# Run the Supabase SQL setup script in your Supabase SQL editor
# Use the content from scripts/setup-supabase.sql
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

## RAG System Overview

The application uses a Retrieval Augmented Generation (RAG) system to provide accurate medical information. The RAG system:

1. Creates embeddings for medical documents and stores them in Supabase's pg_vector database
2. Retrieves relevant documentation based on user queries
3. Enhances AI responses with retrieved context for more accurate answers
4. Extracts citations from the responses for referencing

For detailed documentation about the RAG system, see [RAG System Documentation](./docs/rag-system.md).

## Project Structure

```
/
├── actions                 # Server actions for data operations
│   ├── db                  # Database-related actions
│   │   ├── citations-actions.ts
│   │   ├── library-actions.ts
│   │   ├── messages-actions.ts
│   │   ├── profiles-actions.ts
│   │   └── specialties-actions.ts
│   ├── ai-chat-actions.ts  # AI chat processing actions
│   ├── rag-actions.ts      # RAG system actions
│   └── prompts-actions.ts  # Prompt management actions
├── app                     # Next.js App Router
│   ├── (auth)              # Auth-related routes
│   ├── (marketing)         # Marketing/landing pages
│   ├── dashboard           # User dashboard
│   └── ...                 # Other routes
├── components              # Reusable components
│   ├── landing             # Landing page components
│   ├── ui                  # UI components (shadcn)
│   ├── utilities           # Utility components
│   └── ...                 # Other components
├── db                      # Database configuration
│   ├── schema              # Drizzle ORM schemas
│   └── db.ts               # Database connection
├── hooks                   # Custom React hooks
├── lib                     # Utility libraries
│   ├── openai.ts           # OpenAI API integration
│   ├── rag-query.ts        # RAG query utilities
│   └── ...                 # Other utilities
├── prompts                 # AI prompt templates
├── public                  # Static assets
├── scripts                 # Database and utility scripts
└── types                   # TypeScript types
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

## Database Schema

The application uses several database tables to store user data, chat history, and medical information:

- `profiles`: User profiles and preferences
- `specialties`: Medical specialties supported by the system
- `chats`: User chat sessions
- `messages`: Individual chat messages
- `citations`: Medical citations extracted from responses
- `library`: User's saved references
- `medical_embeddings`: Vector embeddings for the RAG system

## Authentication

The application uses Clerk for authentication:

1. Users can sign up with email/password or OAuth providers
2. Authentication state is managed by Clerk
3. Protected routes require authentication
4. User identity is used to filter and personalize data

## Contribution Guidelines

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Medical community for their invaluable expertise
- OpenAI for their powerful language models
- Supabase for vector database capabilities
- Next.js team for the excellent React framework
