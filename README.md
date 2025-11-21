# AI Resume Builder

An AI-powered resume builder that helps you create, edit, and tailor your resume to specific job descriptions.

## Features

- Upload existing resumes (PDF/DOCX) or create from scratch
- AI-powered resume parsing and section detection
- Resume tailoring based on job descriptions
- Resume scoring and improvement suggestions
- Multiple export formats (PDF, DOCX, TXT)
- Resume templates and preview

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Neon DB (PostgreSQL)
- Hugging Face AI
- PDF/DOCX parsing and generation

## Setup

### Prerequisites

- Node.js 18+
- Neon DB account
- Hugging Face API key

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
NEON_DATABASE_URL=postgresql://your-username:your-password@your-endpoint/neondb

# Auth
JWT_SECRET=your-jwt-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# AI Provider
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

### Installation

```bash
# Install dependencies
npm install

# Initialize the database
npm run init-db

# Test database connection
npm run test-db

# Start development server
npm run dev
```

## Database Setup

1. Create a Neon DB account at https://neon.tech
2. Create a new project
3. Get your connection string
4. Add the connection string to your `.env` file
5. Run `npm run init-db` to initialize the database schema

## Usage

1. Register or log in
2. Upload your existing resume or create a new one
3. Edit your resume sections
4. Enter a job description to tailor your resume
5. Review AI suggestions and score
6. Export your tailored resume
