// routes/reviewCommit.js
const express = require("express");
const router = express.Router();

// === CODE REVIEW ROUTE ===
router.post("/commit", async (req, res) => {
  const { code } = req.body;

  if (!code || code.trim().length === 0) {
    return res
      .status(400)
      .json({ status: "fail", summary: "No code provided for analysis." });
  }

  // ====================================================================
  // PROMPT PURPOSE: Git Pre-Commit Hook Code Review
  // This prompt is optimized for:
  // - Quick pass/fail determination for git hooks
  // - Security and syntax validation
  // - Detecting gibberish or malicious code
  // - Basic guideline compliance check
  // Note: Returns simple OK/FAIL format for automated git hooks
  // ====================================================================
  const prompt = `
You are an AI code reviewer evaluating a git diff for a pre-commit hook.

Be extremely strict and detailed. Your review will block commits if issues are found.

**EVALUATION CRITERIA:**

1. **Syntax & Compilation**
   - Any syntax errors or incomplete statements
   - Any non-compilable code (invalid syntax)
   - Any gibberish, meaningless text, or profanity
   - Any malformed code structures

2. **Security Issues**
   - Hardcoded secrets, passwords, API keys, or credentials
   - SQL injection vulnerabilities
   - XSS vulnerabilities
   - Unsafe eval() or code execution
   - Missing input validation
   - Insecure cryptographic practices

3. **Code Quality**
   - Bad practices or logical issues
   - Code that violates basic coding standards
   - Potentially harmful or malicious code patterns
   - Dead code or unreachable statements

4. **Guideline Compliance**
   - Check against common coding standards
   - Identify obvious style violations
   - Detect anti-patterns

**OUTPUT FORMAT:**
- If code contains issues: Start with "FAIL:" and provide a clear, concise explanation
- If code is safe and clean: Start with "OK:" and briefly explain why
- Always return ONE clear line starting with either "OK:" or "FAIL:"
- Be specific: mention what type of issue (security, syntax, quality, etc.)

Git diff to analyze:
${code}
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:latest",
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    const text = data.response?.trim() || "No AI response received.";
    const lower = text.toLowerCase();

    if (lower.startsWith("ok:")) {
      return res.json({ status: "ok", summary: text });
    }
    if (
      lower.startsWith("fail:") ||
      lower.includes("error") ||
      lower.includes("issue")
    ) {
      return res.json({ status: "fail", summary: text });
    }

    // Default fallback if AI is unclear
    return res.json({
      status: "ok",
      summary: text || "No major issues found.",
    });
  } catch (err) {
    console.error("AI Review Error:", err.message);
    return res.status(500).json({
      status: "fail",
      summary: "Error analyzing code. Ensure Ollama is running on port 11434.",
    });
  }
});

// === DISCUSSION / REPLY ROUTE ===
router.post("/discussion", async (req, res) => {
  const { issue, developer_response } = req.body;

  // ====================================================================
  // PROMPT PURPOSE: Developer-AI Discussion Resolution
  // This prompt handles:
  // - Developer responses to review findings
  // - Re-evaluation of issues after explanation
  // - Collaborative problem-solving
  // - Deciding if issues are resolved or still problematic
  // ====================================================================
  const prompt = `
You are the AI code reviewer in a discussion with a developer.

**CONTEXT:**
Original issue you identified:
"${issue}"

Developer's response/explanation:
"${developer_response}"

**YOUR TASK:**
Reevaluate the original issue considering the developer's explanation.

**EVALUATION:**
- If the developer's explanation resolves the issue or provides valid justification, start with "OK:" and acknowledge the resolution
- If the issue is still problematic despite the explanation, start with "FAIL:" and briefly explain why
- If the developer's response raises new concerns, start with "FAIL:" and explain the new issues
- Be constructive and professional in your response

**OUTPUT FORMAT:**
- Start with "OK:" if resolved, or "FAIL:" if still problematic
- Provide a brief, clear explanation
- Keep response concise but informative
`;

  try {
    const ai = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:latest",
        prompt,
        stream: false,
      }),
    });

    const data = await ai.json();
    const text = data.response?.trim() || "No AI response.";
    const lower = text.toLowerCase();

    if (lower.startsWith("ok:")) {
      return res.json({ status: "ok", summary: text });
    } else {
      return res.json({ status: "fail", summary: text });
    }
  } catch (err) {
    console.error("AI Discussion Error:", err.message);
    res.status(500).json({
      status: "fail",
      summary: "Error during discussion.",
    });
  }
});


// === AUTO-FIX ROUTE ===
router.post("/fix", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res
      .status(400)
      .json({ status: "fail", message: "No code provided." });
  }

  // ====================================================================
  // PROMPT PURPOSE: Automatic Code Fixing
  // This prompt is optimized for:
  // - Generating corrected code without explanations
  // - Minimal changes (fix only what's broken)
  // - Maintaining code functionality while fixing issues
  // - Security and quality improvements
  // - Returns raw code only (no markdown formatting)
  // ====================================================================
  const prompt = `
You are an AI developer assistant specializing in code fixes.

**TASK:**
Fix the following code by making minimal necessary changes.

**REQUIREMENTS:**
- Fix syntax errors, security issues, and obvious bugs
- Make code valid, secure, and professional
- Maintain original functionality
- Follow coding best practices
- Apply appropriate security fixes
- Improve code quality where critical

**CRITICAL:**
- Return ONLY the fixed code
- Do NOT include explanations, comments, or markdown
- Do NOT wrap code in code fences (\`\`\`)
- Return raw code that can be directly written to a file
- Preserve the original code structure and logic where possible

Code to fix:
${code}
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:latest",
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    let fixedCode = data.response?.trim() || "// No fix generated.";

    // 🧽 Sanitize: remove markdown code fences (```js ... ```)
    fixedCode = fixedCode
      .replace(/^```[a-zA-Z]*\n?/, "") // remove opening ```js
      .replace(/```$/, "")             // remove closing ```
      .trim();

    res.json({
      status: "ok",
      fixed_code: fixedCode,
    });
  } catch (err) {
    console.error("AI Fix Error:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Error generating fix.",
    });
  }
});

// === EFFORT ESTIMATION ROUTE ===
router.post("/effort", async (req, res) => {
  const { summary } = req.body;

  if (!summary) {
    return res
      .status(400)
      .json({ status: "fail", message: "No summary provided." });
  }

  // ====================================================================
  // PROMPT PURPOSE: Development Effort Estimation
  // This prompt provides:
  // - Realistic time estimates for fixing issues
  // - Helps developers prioritize work
  // - Accounts for complexity, testing, and verification
  // - Returns concise, practical estimates
  // ====================================================================
  const prompt = `
You are an experienced software engineer estimating development effort.

**TASK:**
Estimate how long it would take to fix the issue described below.

**CONSIDER:**
- Time to understand the issue
- Time to implement the fix
- Time to test the fix
- Time to verify the solution
- Complexity of the issue
- Potential side effects or related changes needed

**OUTPUT FORMAT:**
- Provide a realistic estimate in minutes or hours
- Be concise (1-2 sentences maximum)
- If unsure, provide a range (e.g., "15-30 minutes")
- Consider a typical developer's pace

Issue description:
${summary}
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:latest",
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    const estimate = data.response?.trim() || "Unable to estimate effort.";

    res.json({ status: "ok", estimate });
  } catch (err) {
    console.error("AI Effort Estimation Error:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Error estimating effort.",
    });
  }
});

module.exports = router;
