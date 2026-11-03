/**
 * Jarvis Office - Content-to-Revenue Agent
 * Produces viral carousel slides, AI video scripts, case studies, and email sequences that convert cold traffic into clients.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class ContentRevenueAgent {
  constructor() {
    this.name = 'ContentRevenue';
    this.role = 'Content-to-Revenue Specialist';
  }

  async generateAsset({ type = 'carousel', topic, targetAudience = 'Startup Founders & SMBs' }) {
    const prompt = `Asset Type: ${type}
Topic: ${topic}
Audience: ${targetAudience}

Generate a complete marketing asset with high engagement hooks, educational value, and strong calls-to-action driving inquiries to KADARTECH Solutions (WhatsApp: +91 9359086445, Portfolio: https://kadartech.vercel.app).

If carousel: provide 7-10 slide breakdown (Hook -> Problem -> 5 Steps/Tips -> Solution -> CTA).
If video script: provide 30-60 second spoken script with visual/B-roll cues.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.content_revenue,
      temperature: 0.7
    });
  }
}

module.exports = new ContentRevenueAgent();
