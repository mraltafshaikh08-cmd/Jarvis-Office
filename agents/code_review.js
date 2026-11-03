/**
 * Jarvis Office - Code Review, QA & Automated Testing Agent
 * Performs automated security audits, code reviews, and generates C# Selenium or Jest test suites.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class CodeReviewAgent {
  constructor() {
    this.name = 'CodeReview';
    this.role = 'QA Automation & Security Engineer';
  }

  async reviewCode({ code, language = 'JavaScript' }) {
    const prompt = `Language: ${language}
Source Code to Review:
\`\`\`${language}
${code}
\`\`\`

Perform an elite code review:
1. Bugs, anti-patterns, or memory leaks.
2. Security vulnerabilities (SQL injection, XSS, CSRF, insecure deps).
3. Performance bottlenecks.
4. Refactored, production-ready version of the code.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.code_review,
      temperature: 0.2
    });
  }

  async generateTestBed({ code, testFramework = 'C# Selenium / NUnit' }) {
    const prompt = `Framework: ${testFramework}
Target Code:
\`\`\`
${code}
\`\`\`

Generate a comprehensive automated test suite covering unit tests, edge cases, error conditions, and integration checks.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.code_review,
      temperature: 0.2
    });
  }
}

module.exports = new CodeReviewAgent();
