# AI Code Reviewer

Automated code review application using a locally hosted Large Language Model (LLM) via Ollama. Analyze source code, detect potential issues, and get valuable insights and recommendations.

## Project Structure

```
.
├── client/     # React + Vite frontend
└── server/     # Node.js + Express backend with Ollama integration
```

## Prerequisites

1. **Ollama** - Download and install from [ollama.ai](https://ollama.ai)
2. **Node.js** - v16 or higher

## Setup

### 1. Install and Start Ollama

```bash
# Download Ollama from https://ollama.ai and install it

# Pull a coding model (choose one):
ollama pull llama3.2        # Recommended: Fast and efficient
ollama pull codellama        # Code-specific model
ollama pull deepseek-coder  # Excellent for code analysis
ollama pull mistral          # Alternative option

# Start Ollama (usually runs automatically after installation)
# Check it's running: http://localhost:11434
```

### 2. Server Setup

1. Create a `.env` file in the `server` directory (optional):
```bash
PORT=3001
NODE_ENV=development
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

2. Start the server:
```bash
cd server
npm install
npm run dev      # Development mode with auto-reload
```

### 3. Client Setup

1. Start the client:
```bash
cd client
npm install
npm run dev      # Usually runs on http://localhost:5173
```

## Usage

1. Open the application in your browser (usually `http://localhost:5173`)
2. Select the programming language from the dropdown
3. Paste your code into the text area
4. Click "Review Code" to get AI-powered analysis
5. Review the feedback including:
   - Code quality assessment
   - Potential issues and bugs
   - Security concerns
   - Performance optimization suggestions
   - Best practices recommendations

## Git Pre-Commit Hook Setup

Automatically install the AI code review pre-commit hook to review code before each commit:

### Option 1: Automatic Setup (Recommended)

```bash
# Make sure server is running first, then:
./setup-pre-commit.sh
```

This script will:
- Check if server is running
- Download the pre-commit hook automatically
- Make it executable
- Verify dependencies (jq)

### Option 2: Manual Download

```bash
# Make sure server is running on port 3001, then:
curl http://localhost:3001/api/pre-commit-hook > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Option 3: Manual Copy

If you prefer, you can manually copy the hook from `.git/hooks/pre-commit` or `gitPreCommit.txt`

### Requirements

- `jq` must be installed (for JSON parsing)
  - macOS: `brew install jq`
  - Ubuntu/Debian: `sudo apt-get install jq`
  - Fedora: `sudo dnf install jq`

### How It Works

The pre-commit hook will:
1. Check if server is running (skips if not)
2. Review your staged changes before commit
3. Block commits if issues are found
4. Allow you to respond, override, auto-fix, or cancel

## API Endpoints

- `GET /` - Server health check
- `GET /api/models` - Get available Ollama models
- `GET /api/pre-commit-hook` - Download pre-commit hook script
- `POST /api/review` - Submit code for review
  ```json
  {
    "code": "your code here",
    "language": "javascript",
    "model": "llama3.2",
    "ruleset": {} // optional custom ruleset
  }
  ```
- `POST /api/review/commit` - Review git diff (for pre-commit hook)
- `POST /api/review/discussion` - Developer-AI discussion
- `POST /api/review/fix` - Auto-fix code issues
- `POST /api/review/effort` - Estimate fix effort

## Supported Languages

- JavaScript
- Python
- Java
- C++
- C
- TypeScript
- Go
- Rust
- PHP
- Ruby

## Technologies

**Frontend:**
- React 19
- Vite 7
- Modern dark theme UI

**Backend:**
- Node.js
- Express 5
- Ollama API integration
- CORS enabled

## Features

- ✅ Local LLM integration (Ollama)
- ✅ Multi-language code support
- ✅ Comprehensive code analysis
- ✅ Security vulnerability detection
- ✅ Performance optimization suggestions
- ✅ Best practices recommendations
- ✅ Clean, modern dark UI

## Troubleshooting

**Ollama not responding:**
- Make sure Ollama is running: `ollama list`
- Check Ollama URL in server `.env` file
- Verify model is downloaded: `ollama list`

**Model not found:**
- Pull the model: `ollama pull llama3.2`
- Or update `OLLAMA_MODEL` in `.env` to match your downloaded model

**Server errors:**
- Check Ollama is accessible at `http://localhost:11434`
- Verify the model name matches what you have installed
