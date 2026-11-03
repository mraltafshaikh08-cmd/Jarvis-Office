/**
 * Jarvis Office - Maya (Chief Revenue Growth & Upsell Agent)
 * Identifies upsell opportunities, structures recurring retainers ($199/mo maintenance + SEO + AI updates),
 * and maximizes KADARTECH cash flow.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class RevenueMayaAgent {
  constructor() {
    this.name = 'Maya';
    this.role = 'Chief Revenue Growth & Retainer Strategist';
  }

  async structureOffer({ clientName, initialProject, currentBudget }) {
    const prompt = `Client: ${clientName}
Initial Project: ${initialProject}
Budget: ${currentBudget}

Agency Offers:
- Website Deliverables: 3-5 day delivery, 100% responsive, free AI chatbot.
- Upsell 1: Ongoing Care & Hosting Retainer ($199 - $350/mo).
- Upsell 2: Growth Pack Upgrade (9 Sites for $600 - 60% savings for serial entrepreneurs).
- Upsell 3: Custom Micro-SaaS MVP build ($800).

Structure an irresistible 3-tier proposal that maximizes lifetime customer value (LTV) and monthly recurring revenue (MRR).`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.revenue_maya,
      temperature: 0.6
    });
  }
}

module.exports = new RevenueMayaAgent();
