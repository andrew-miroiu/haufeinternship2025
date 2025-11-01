# Server - Node.js + Express

A Node.js backend server built with Express and Supabase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** To get your Supabase credentials:
- Go to your Supabase project dashboard
- Navigate to Settings > API
- Copy the "Project URL" for `SUPABASE_URL`
- Copy the "service_role" key (not the anon key) for `SUPABASE_SERVICE_ROLE_KEY`
- **Warning:** The service role key has admin privileges. Never expose it in client-side code!

## Available Scripts

- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm start` - Start production server

## Default Port

The server runs on `http://localhost:3001` by default.

## API Endpoints

- `GET /` - Basic server health check
- `GET /api/health` - Health check with timestamp
- `GET /api/users` - Get all users from Supabase (requires Supabase credentials)

