/**
 * Jarvis Office - Deep Research Agent
 * Gathers technical intelligence, evaluates open-source tools, audits competitor offerings, and analyzes prospective client domains.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class DeepResearchAgent {
  constructor() {
    this.name = 'DeepResearch';
    this.role = 'Market Intelligence & Deep Technical Auditor';
  }

  async researchTopic({ topic, depth = 'detailed' }) {
    const prompt = `Topic / Target: ${topic}
Research Depth: ${depth}

Deliverables:
1. Executive Summary.
2. Market / Competitive Landscape.
3. Technical Feasibility & Architecture Options.
4. Revenue Opportunities & Pricing Recommendations for KADARTECH.
5. Actionable Roadmap.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.deep_research,
      temperature: 0.4
    });
  }
}

module.exports = new DeepResearchAgent();
