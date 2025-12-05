# AI Job Board

A full-stack job application tracking system with AI-powered resume generation. Built to help job seekers organize their applications and automatically customize resumes for different positions.

## What It Does

This application lets you track job applications across different stages (from discovery to offer) using a kanban board interface. The AI feature analyzes job descriptions and generates customized versions of your resume tailored to each position.

## Tech Stack

**Frontend**

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS

**Backend**

- Node.js with Express
- Prisma ORM
- SQLite database
- TypeScript

**AI**

- Ollama (local LLM)
- llama3:latest model

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Ollama (for AI features)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd ai-job-board
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Set up the database:

```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
```

5. Create environment files:

Backend `.env`:

```
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:latest
```

Frontend `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the Application

Start the backend server:

```bash
cd backend
npm run dev
```

In a new terminal, start the frontend:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Setting Up AI Features

1. Install Ollama from https://ollama.ai

2. Pull the llama3 model:

```bash
ollama pull llama3:latest
```

3. Make sure Ollama is running (it usually starts automatically)

The AI features will work automatically once Ollama is running. If the AI service is unavailable, the app will still function but without resume generation.

## Features

**Job Application Tracking**

- Drag and drop cards between different stages
- Add, edit, and delete job applications
- Track company, position, salary, location, and notes
- See application dates and status

**Resume Management**

- Upload and store your base resume
- Keep multiple resume versions
- Quick preview and download

**AI Resume Generation**

- Automatically customize resumes for specific jobs
- Add custom requirements for each application
- Generate multiple versions and compare
- Regenerate with different prompts

## Project Structure

```
ai-job-board/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Pages and layouts
│   │   ├── components/# React components
│   │   ├── services/  # API calls
│   │   └── types/     # TypeScript types
│
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── middleware/# Auth and validation
│   │   └── types/     # TypeScript types
│   └── prisma/        # Database schema
│
└── shared/            # Shared types and validation
```

## API Endpoints

**Job Applications**

- `GET /api/job-applications` - List all applications
- `POST /api/job-applications` - Create new application
- `PATCH /api/job-applications/:id` - Update application
- `DELETE /api/job-applications/:id` - Delete application

**Resumes**

- `GET /api/resumes/base` - Get base resume
- `POST /api/resumes/base` - Upload base resume
- `PATCH /api/resumes/base/:id` - Update base resume

**AI**

- `POST /api/ai/generate-resume-db` - Generate customized resume
- `GET /api/ai/generated-resumes` - List generated resumes
- `GET /api/ai/status` - Check AI service status

## Database Schema

The app uses three main tables:

- `User` - User accounts
- `JobApplication` - Job tracking data
- `BaseResume` - Uploaded resumes
- `GeneratedResume` - AI-generated versions

## Development Notes

**Authentication**
Currently uses a simple header-based system with a demo user. For production use, implement proper JWT or session-based authentication.

**Database**
Using SQLite for simplicity. For production, consider PostgreSQL or MySQL.

**AI Service**
The app gracefully handles when Ollama is unavailable. All core features work without AI.

## Common Issues

**Port already in use**
If ports 3000 or 3001 are taken, change them in the `.env` files.

**Database errors**
Run `npx prisma db push` to sync the schema, or delete `dev.db` and run setup again.

**AI not working**
Make sure Ollama is running and the llama3 model is downloaded. Check the terminal for connection errors.

**CORS errors**
Verify the `FRONTEND_URL` in backend `.env` matches where your frontend is running.

## License

MIT

## Author

Semih Cetin
