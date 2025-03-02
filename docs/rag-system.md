# RAG System Documentation

This document explains the Retrieval Augmented Generation (RAG) system used in AttendMe, designed to provide accurate medical information to users. This documentation is written for novice programmers to understand how the system works.

## What is RAG?

RAG stands for **Retrieval Augmented Generation**. It's a technique that enhances AI responses by:

1. **Retrieving** relevant information from a knowledge base
2. **Augmenting** the AI prompt with this information
3. **Generating** more accurate and informed responses

Think of RAG as giving the AI a set of reference materials to consult before answering a question, similar to how a doctor might refer to medical texts before making a diagnosis.

## Why Do We Need RAG?

Large Language Models (LLMs) like GPT-4 have several limitations:

- **Knowledge Cutoff**: They only know information up to their training date
- **Hallucinations**: They can generate incorrect information that sounds plausible
- **Lack of Citations**: They typically don't provide sources for their information
- **No Domain Specialization**: They don't have deep expertise in specific fields

RAG helps address these issues by grounding AI responses in verified information from our medical knowledge database.

## How RAG Works in AttendMe

Here's a simplified explanation of how our RAG system works:

### 1. Creating and Storing Embeddings

Before the system can retrieve relevant information, we need to prepare our knowledge base:

```
User Query → Vector Embedding → Vector Database Search → Relevant Documents → Enhanced AI Response
```

- **Document Collection**: We gather medical documents, journal articles, and trusted medical information
- **Text Processing**: We break these documents into meaningful chunks
- **Embedding Creation**: Each chunk is converted into a numerical vector using OpenAI's embedding model
- **Vector Storage**: These vectors are stored in our Supabase database using the pg_vector extension

An **embedding** is a list of numbers that represents the meaning of text. Similar texts will have similar embeddings, which allows us to find related content.

### 2. Processing User Queries

When a user asks a question:

1. **Create Query Embedding**: The user's question is converted to an embedding vector
2. **Similarity Search**: We search our vector database for documents with similar embeddings
3. **Retrieve Relevant Documents**: The most relevant medical information is retrieved
4. **Augment the Prompt**: The retrieved information is added to the AI's prompt
5. **Generate Response**: The AI generates a response using both its built-in knowledge and the retrieved information

### 3. Citation Generation

A key feature of our RAG system is proper citation:

1. The AI identifies which parts of its response are based on the retrieved documents
2. It formats citations according to medical standards
3. These citations are extracted and stored for reference
4. Users can save important citations to their library

## Technical Components

Our RAG system consists of several key components:

### Vector Database

We use Supabase with the `pg_vector` extension to store and query embeddings:

- The `medical_embeddings` table stores document content, metadata, and vector embeddings
- A vector similarity search function (`match_documents`) finds relevant documents
- Indexing speeds up similarity searches

### RAG Query Module

The `rag-query.ts` module handles the interaction with the vector database:

- `queryRAG()` function performs similarity searches
- `enhanceRAGResults()` function refines and ranks the search results
- Results are filtered by medical specialty when relevant

### Server Actions

The RAG system exposes these main actions:

- `queryRAGAction()`: Standard RAG query for retrieving relevant documents
- `queryRAGWithTermExtractionAction()`: Extracts medical terms from queries for more precise results

### Prompt Utilities

The `prompt-utils.ts` module helps integrate RAG results with AI prompts:

- It formats retrieved information for inclusion in prompts
- It enforces length limits to avoid token issues
- It structures prompts for optimal AI response quality

## Example Workflow

Let's walk through an example:

1. A user asks: "What are the latest treatments for heart failure?"

2. Our system extracts key terms: "treatments", "heart failure"

3. These terms are converted to embeddings and used to search our database

4. The system retrieves recent medical documents about heart failure treatments

5. The prompt to the AI includes:
   ```
   The user asked: "What are the latest treatments for heart failure?"
   
   Here is relevant information:
   [Document 1 about SGLT2 inhibitors]
   [Document 2 about recent guidelines]
   [Document 3 about new research]
   
   Please answer the question using this information and cite your sources.
   ```

6. The AI generates a response using both its training and the provided information

7. Citations are formatted and made available to the user

## Database Schema

The RAG system uses these main tables:

### medical_embeddings

This table stores the document content and its vector representation:

```sql
CREATE TABLE medical_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB,
  specialty_id UUID,
  embedding VECTOR(1536),  -- For OpenAI embeddings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- `content`: The actual text from medical documents
- `metadata`: Additional information like author, publication date, journal, etc.
- `specialty_id`: Link to the medical specialty (e.g., cardiology, neurology)
- `embedding`: The vector representation of the content (1536 dimensions for OpenAI)

## Setting Up a RAG System

If you want to set up your own RAG system, follow these general steps:

1. **Prepare Your Database**:
   - Set up Supabase with the pg_vector extension
   - Create tables for storing embeddings

2. **Collect and Process Documents**:
   - Gather reliable information sources
   - Break documents into appropriate chunks
   - Clean and normalize the text

3. **Generate Embeddings**:
   - Use OpenAI's embedding API to convert text to vectors
   - Store embeddings in your database

4. **Implement Similarity Search**:
   - Create functions to find relevant documents
   - Optimize search with proper indexing

5. **Connect to Your AI**:
   - Build prompt templates that incorporate retrieved information
   - Implement response generation with proper citation handling

## Common Challenges and Solutions

### Challenge: The RAG system returns irrelevant documents

**Solutions**:
- Adjust the similarity threshold (higher = more strict matching)
- Improve embedding quality with better document chunking
- Extract key terms from queries before searching
- Implement result ranking beyond simple vector similarity

### Challenge: Response generation is slow

**Solutions**:
- Limit the number of retrieved documents
- Optimize database queries with proper indexing
- Cache common queries
- Use streaming responses to show partial results

### Challenge: Citations are incorrect or missing

**Solutions**:
- Provide clear instructions in the prompt
- Implement post-processing to extract and validate citations
- Store metadata along with document content
- Use structured formats for citations

## Conclusion

The RAG system in AttendMe provides several benefits:

- More accurate medical information for users
- Up-to-date content beyond the AI's training cutoff
- Proper citations for evidence-based responses
- Specialty-specific information tailored to user needs

By grounding AI responses in verified medical information, we create a more reliable and trustworthy medical assistant application.

## Further Resources

To learn more about RAG systems:

- [LangChain RAG Documentation](https://js.langchain.com/docs/modules/data_connection/retrievers/)
- [Supabase Vector Documentation](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Pinecone RAG Guide](https://www.pinecone.io/learn/retrieval-augmented-generation/) 