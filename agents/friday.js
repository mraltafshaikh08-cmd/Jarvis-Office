/**
 * Jarvis Office - Friday (Lead Full-Stack Coding Agent & Systems Architect)
 * Friday executes end-to-end full-stack development across 20 production technologies:
 * React.js, Express.js, Node.js, Python, .NET MVC, C# Selenium, Vue.js, API Building,
 * AI-Driven Coding, Integrations, HTML, CSS, Core PHP, Laravel, WordPress,
 * PostgreSQL, MySQL, SQL Server, TypeScript, jQuery.
 */

const gemini = require('../core/gemini');
const config = require('../config/config');
const prompts = require('../config/prompts');

class FridayAgent {
  constructor() {
    this.name = 'Friday';
    this.role = 'Lead Full-Stack Developer & Systems Architect';
    this.techStacks = config.techStacks;
  }

  /**
   * Generates production-ready code files for a given specification.
   */
  async buildSolution({ taskDescription, techStack = 'React.js + Node.js', context = '' }) {
    console.log(`[Friday] Architecting solution with stack: ${techStack} for task: "${taskDescription}"`);

    const prompt = `Task: ${taskDescription}
Target Tech Stack: ${techStack}
Agency Context: ${context}

Deliverables Required:
1. Complete, production-grade source code with zero placeholders or incomplete comments.
2. Explanations of architecture decisions.
3. Verification/test notes or C# Selenium / Jest test snippets.`;

    const response = await gemini.generateText({
      prompt,
      systemInstruction: prompts.friday,
      temperature: 0.3
    });

    return {
      agent: this.name,
      techStack,
      output: response
    };
  }

  /**
   * Generates automated C# Selenium or Playwright browser automation test scripts.
   */
  async generateAutomationTests({ targetUrl, userFlows = [] }) {
    const prompt = `Target URL / Flow: ${targetUrl}
User Flows: ${userFlows.join(', ')}

Generate a complete C# Selenium WebDriver test suite with NUnit assertions, clean Page Object Model (POM), explicit waits, and resilience against flaky DOM elements.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.friday,
      temperature: 0.2
    });
  }
}

module.exports = new FridayAgent();
