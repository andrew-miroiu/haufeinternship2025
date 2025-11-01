const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const reviewCommit = require('./routes/reviewCommit.js');
const subscription = require('./routes/subscription.js');
const commits = require('./routes/commits.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:latest"; // or 'codellama', 'deepseek-coder', etc.

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/review", reviewCommit);
app.use("/api/subscription", subscription);
app.use("/api/commits", commits);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Code Review API Server is running!' });
});

// Get available Ollama models
app.get('/api/models', async (req, res) => {
  try {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch models from Ollama');
    }
    
    const data = await response.json();
    const installedModels = data.models ? data.models.map(m => m.name) : [];
    
    // Define all available models
    const allModels = [
      { name: 'llama3.2', display: 'Llama 3.2', recommended: true },
      { name: 'llama3.1:latest', display: 'Llama 3.1', recommended: false },
      { name: 'codellama', display: 'CodeLlama', recommended: true },
      { name: 'deepseek-coder', display: 'DeepSeek Coder', recommended: true },
      { name: 'mistral', display: 'Mistral', recommended: false },
      { name: 'qwen2.5-coder', display: 'Qwen2.5 Coder', recommended: true },
      { name: 'granite-code', display: 'Granite Code', recommended: false },
    ];
    
    const modelsWithStatus = allModels.map(model => ({
      ...model,
      installed: installedModels.some(installed => 
        installed === model.name || installed.startsWith(model.name + ':')
      ),
    }));
    
    res.json({ models: modelsWithStatus });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      details: error.message 
    });
  }
});

// Code review endpoint using Ollama
app.post('/api/review', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // ====================================================================
    // PROMPT PURPOSE: Comprehensive Code Review with All Criteria
    // This prompt addresses:
    // - Guideline Awareness: Explicitly references coding standards (PEP8, Google Style, etc.)
    // - Modular Evaluation: Separate analysis modules (linting, security, architecture, testing, CI/CD)
    // - Documentation for Findings: Structured format with severity, location, explanation, impact, recommendations
    // - Documentation Updates: Recommends documentation improvements
    // ====================================================================
    
    // Define language-specific coding guidelines
    const codingGuidelines = {
      javascript: [
        'ESLint recommended rules',
        'Airbnb JavaScript Style Guide',
        'Google JavaScript Style Guide',
        'MDN JavaScript Best Practices'
      ],
      python: [
        'PEP 8 (Style Guide for Python Code)',
        'PEP 257 (Docstring Conventions)',
        'Google Python Style Guide',
        'PEP 484 (Type Hints)'
      ],
      java: [
        'Google Java Style Guide',
        'Oracle Code Conventions for Java',
        'Effective Java by Joshua Bloch'
      ],
      typescript: [
        'TypeScript Style Guide',
        'ESLint TypeScript Rules',
        'Google TypeScript Style Guide'
      ],
      go: [
        'Effective Go',
        'Go Code Review Comments',
        'Uber Go Style Guide'
      ],
      rust: [
        'Rust API Guidelines',
        'rustfmt defaults',
        'Clippy lints'
      ],
      cpp: [
        'Google C++ Style Guide',
        'C++ Core Guidelines',
        'MISRA C++'
      ],
      c: [
        'MISRA C',
        'C99/C11 Standard',
        'SEI CERT C Coding Standard'
      ],
      php: [
        'PSR-12 (Extended Coding Style)',
        'PSR-1 (Basic Coding Standard)',
        'PSR-5 (PHPDoc)'
      ],
      ruby: [
        'Ruby Style Guide',
        'RuboCop defaults',
        'Community Ruby Style Guide'
      ]
    };

    const guidelines = codingGuidelines[language] || ['General coding best practices'];
    
    // Build custom ruleset text if provided
    const customRuleset = req.body.ruleset || null;
    let customRulesText = '';
    if (customRuleset) {
      customRulesText = `\n\n### Custom Coding Standards\nYou must also apply these custom rules:\n${JSON.stringify(customRuleset, null, 2)}\n`;
    }

    const prompt = `You are an expert senior software engineer and code reviewer with deep knowledge of ${language} coding standards.

**CRITICAL: You must evaluate code against these official coding standards:**
${guidelines.map(g => `- ${g}`).join('\n')}
${customRulesText}
---

**MODULAR EVALUATION REQUIRED - Analyze across these distinct dimensions:**

1. **LINTING ANALYSIS**
   - Check syntax errors, formatting violations
   - Verify naming conventions per ${language} standards
   - Identify style violations (indentation, spacing, line length)
   - Check for unused imports/variables
   - Validate code structure and organization

2. **SECURITY ANALYSIS**
   - Identify vulnerabilities (SQL injection, XSS, CSRF, etc.)
   - Check for hardcoded secrets, credentials, or API keys
   - Review input validation and sanitization
   - Check authorization and authentication patterns
   - Identify unsafe patterns, deprecated APIs, or weak cryptography
   - Review error handling that might leak sensitive information

3. **ARCHITECTURE ANALYSIS**
   - Evaluate design patterns usage (appropriate vs. over-engineered)
   - Check SOLID principles adherence
   - Analyze coupling and cohesion
   - Review module/component structure and separation of concerns
   - Check for code duplication (DRY principle)
   - Evaluate scalability and extensibility

4. **TESTING ANALYSIS**
   - Assess test coverage needs
   - Identify testable vs untestable code
   - Check for missing unit tests
   - Review testing patterns (mocking, fixtures, assertions)
   - Identify edge cases that need testing
   - Check testability (dependency injection, etc.)

5. **CI/CD ANALYSIS**
   - Check build configuration compatibility
   - Identify dependency management issues
   - Review environment configuration needs
   - Check for CI/CD pipeline compatibility
   - Identify deployment considerations
   - Review version compatibility

6. **DOCUMENTATION ANALYSIS**
   - Identify missing docstrings/comments
   - Check for outdated documentation
   - Suggest README updates
   - Review API documentation needs
   - Identify inline documentation gaps
   - Check for missing type hints (where applicable)

---

### Input Code
\`\`\`${language}
${code}
\`\`\`

---

### Output Format (MANDATORY STRUCTURE)

#### 🧠 Code Review Summary
Brief overview of code functionality and overall quality assessment.

#### 📋 Modular Findings

**EACH FINDING MUST FOLLOW THIS EXACT STRUCTURE:**

---

##### Finding #1: [Brief Descriptive Title]

**Severity:** [Critical/High/Medium/Low]

**Module:** [Linting/Security/Architecture/Testing/CI-CD/Documentation]

**Location:** 
- File: [filename if known, or "provided code"]
- Line(s): [exact line numbers, e.g., "Line 15", "Lines 23-27"]

**Explanation:**
[Clear, detailed explanation of what the issue is. Be specific about what's wrong, why it's problematic, and what standard/guideline it violates.]

**Impact:**
[Explain the consequences:
- What happens if this is not fixed?
- How does it affect the codebase/users/security/performance/maintainability?
- What are the risks?
Be specific and realistic.]

**Recommendation:**
[Provide a detailed recommendation with:
1. Specific steps to fix the issue
2. Code example showing the problematic code
3. Code example showing the corrected code
4. Explanation of why this fix works
5. Best practices to follow going forward]

**Standard Reference:**
[Reference the specific coding standard violated:
- For ${language}: ${guidelines.join(', ')}
- Include specific rule numbers, section names, or guideline names when possible
- If custom ruleset violation, reference the custom rule]

---

##### Finding #2: [Brief Title]
[Repeat the same structure as Finding #1]

---

[Continue for ALL findings, numbering sequentially]

#### 🛠️ Priority Summary
List all findings sorted by severity:
- **Critical:** [count] findings (must fix before merging)
- **High:** [count] findings (should fix soon)
- **Medium:** [count] findings (consider fixing)
- **Low:** [count] findings (nice to have)

#### 📚 Documentation Recommendations

**README Updates Needed:**
- [Specific section/feature to document with suggested content]

**Code Documentation Needed:**
- Function [name] (Line X): [Missing docstring - provide example following ${language} conventions]
- Class [name] (Line Y): [Missing class docstring - provide example]

**API Documentation Needed:**
- [If applicable: endpoints, parameters, return types, examples]

**Inline Comments Needed:**
- Line X: [Complex logic that needs explanation - provide example comment]

**Documentation Standards:**
- Follow ${language} documentation conventions (e.g., ${guidelines.find(g => g.includes('Doc') || g.includes('doc')) || 'standard docstring format'})

#### ✅ Fixed / Improved Code
Provide the full corrected and improved code below.
It must be syntactically correct, runnable, and follow ALL ${language} best practices and standards mentioned above.

\`\`\`${language}
<fixed version of the code>
\`\`\`

---

**CRITICAL INSTRUCTIONS:**
- EVERY finding MUST include ALL 6 elements: Severity, Module, Location, Explanation, Impact, Recommendation, Standard Reference
- Be extremely specific with line numbers when possible
- Provide actual code examples in the Recommendation section
- Reference real, specific coding standards (don't just say "best practices")
- If no issues are found, state that clearly but still provide suggestions for improvement
- Keep your tone professional and constructive
- Ensure the fixed code integrates all recommended improvements
- Document all functions, classes, and complex logic in the fixed code`;

    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: req.body.model || OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama error:', errorText);
      return res.status(500).json({ 
        error: 'Failed to get response from Ollama. Make sure Ollama is running and the model is downloaded.',
        details: errorText
      });
    }

    const ollamaData = await ollamaResponse.json();
    const review = ollamaData.response || ollamaData.text || 'No review generated';

    res.json({ 
      review,
      model: OLLAMA_MODEL,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in code review:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// ====================================================================
// API Endpoint: Get Pre-Commit Hook Content
// Purpose: Allows users to download the pre-commit hook automatically
// Usage: curl http://localhost:3001/api/pre-commit-hook > .git/hooks/pre-commit
// ====================================================================
app.get('/api/pre-commit-hook', (req, res) => {
  const preCommitHook = `#!/bin/bash

echo "🧠 Running AI code review before commit..."

exec < /dev/tty

# === Skip first commit

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then

  echo "⚙️ First commit detected — skipping AI review."

  exit 0

fi

# === Check if backend API is running (port 3001)

if ! curl --silent --fail http://localhost:3001 >/dev/null 2>&1; then

  echo "⚠️ AI review service not running — skipping review."

  exit 0

fi

# === Choose review type

echo ""

echo "📋 Select review mode:"

echo "1️⃣  Incremental (new/modified lines only)"

echo "2️⃣  Full file review"

echo "3️⃣  Deleted code review"

read -p "Enter your choice (1/2/3): " mode

case "$mode" in

  1)

    echo "🔍 Incremental review selected (default)."

    FILES=$(git diff --cached --name-only --diff-filter=AM)

    DIFF=$(git diff --cached --diff-filter=AM)

    ;;

  2)

    echo "📄 Full file review selected."

    FILES=$(git diff --cached --name-only --diff-filter=AM)

    DIFF=""

    for FILE in $FILES; do

      echo "⬇️ Reading full file: $FILE"

      CONTENT=$(cat "$FILE")

      DIFF+="\\n\\n# FILE: $FILE\\n$CONTENT"

    done

    ;;

  3)

    echo "🗑 Deleted code review selected."

    FILES=$(git diff --cached --name-only --diff-filter=D)

    DIFF=$(git diff --cached --diff-filter=D)

    ;;

  *)

    echo "⚙️ Invalid choice. Defaulting to incremental review."

    FILES=$(git diff --cached --name-only --diff-filter=AM)

    DIFF=$(git diff --cached --diff-filter=AM)

    ;;

esac

if [ -z "$FILES" ]; then

  echo "⚙️ No files staged for commit."

  exit 0

fi

# === Send code diff to AI review backend

REVIEW=$(echo "$DIFF" | jq -Rs '{ code: . }' | \\

  curl -s -X POST http://localhost:3001/api/review/commit \\

  -H "Content-Type: application/json" \\

  -d @-)

STATUS=$(echo "$REVIEW" | jq -r '.status')

SUMMARY=$(echo "$REVIEW" | jq -r '.summary')

# === If AI approves

if [ "$STATUS" = "ok" ]; then

  echo "✅ AI review passed. Commit allowed."

  exit 0

fi

# === Otherwise, block and show summary

echo "🚫 Commit blocked: $SUMMARY"

# === Effort estimation before prompt

EFFORT=$(jq -n --arg summary "$SUMMARY" '{ summary: $summary }' | \\

  curl -s -X POST http://localhost:3001/api/review/effort \\

  -H "Content-Type: application/json" \\

  -d @-)

ESTIMATE=$(echo "$EFFORT" | jq -r '.estimate')

echo "🕒 Estimated effort: $ESTIMATE"

# === Main decision loop

while true; do

  read -p "💬 Respond (r), override (o), auto-fix (f), or cancel (c)? " choice

  case "$choice" in

    f)

      echo "🛠 Generating AI auto-fix for staged files..."

      for FILE in $FILES; do

        echo "🔧 Fixing file: $FILE"

        FILE_CONTENT=$(cat "$FILE")

        FIX=$(jq -n --arg code "$FILE_CONTENT" '{ code: $code }' | \\

          curl -s -X POST http://localhost:3001/api/review/fix \\

          -H "Content-Type: application/json" \\

          -d @-)

        FIXED_CODE=$(echo "$FIX" | jq -r '.fixed_code')

        if [ -n "$FIXED_CODE" ] && [ "$FIXED_CODE" != "null" ]; then

          echo "$FIXED_CODE" > "$FILE"

          git add "$FILE"

          echo "Applied fix directly to $FILE"

        else

          echo "⚠️ No fix returned for $FILE"

        fi

      done

      echo "All fixes applied. Commit allowed."

      exit 0

      ;;

    r)

      read -p "Your reply: " reply

      DISCUSSION=$(jq -n --arg issue "$SUMMARY" --arg dev "$reply" \\

        '{ issue: $issue, developer_response: $dev }' | \\

        curl -s -X POST http://localhost:3001/api/review/discussion \\

        -H "Content-Type: application/json" \\

        -d @-)

      D_STATUS=$(echo "$DISCUSSION" | jq -r '.status')

      D_SUMMARY=$(echo "$DISCUSSION" | jq -r '.summary')

      echo "🤖 AI: $D_SUMMARY"

      if [ "$D_STATUS" = "ok" ]; then

        echo "✅ AI accepted your explanation. Commit allowed."

        exit 0

      else

        echo "🚫 Still rejected by AI reviewer."

        read -p "😐 Override and commit anyway? (y/n) " override

        if [ "$override" = "y" ]; then

          echo "⚠️ Manual override — forcing commit."

          exit 0

        else

          echo "❌ Commit cancelled."

          exit 1

        fi

      fi

      ;;

    o)

      echo "⚠️ Manual override — forcing commit."

      exit 0

      ;;

    c)

      echo "❌ Commit cancelled."

      exit 1

      ;;

    *)

      echo "❌ Invalid choice. Type r, o, f, or c."

      ;;

  esac

done
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="pre-commit"');
  res.send(preCommitHook);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
  console.log(`Ollama Model: ${OLLAMA_MODEL}`);
});

