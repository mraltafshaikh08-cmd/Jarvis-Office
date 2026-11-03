/**
 * Jarvis Office - Social Scheduler & Growth Agent
 * Prepares weekly viral social media schedules across LinkedIn, X (Twitter), and Instagram for KADARTECH.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class SocialSchedulerAgent {
  constructor() {
    this.name = 'SocialScheduler';
    this.role = 'B2B Social Growth & Content Distribution Specialist';
  }

  async generateWeeklyCalendar({ focusTopic = 'Fast-turnaround Web Development & AI Agents', targetPillars = [] }) {
    const prompt = `Focus: ${focusTopic}
Content Pillars: ${targetPillars.join(', ') || 'Case Studies, Coding Tips, Client Proof, AI Automation, Special Offers'}

Create a 7-day posting calendar for LinkedIn and X:
- Day 1 to Day 7: Platform, Post Hook, Post Body, Hashtags, and Call-to-Action.
- Emphasize KADARTECH offers ($100 Site, $250 Starter Pack, $600 Growth Pack) and 24/7 AI chatbot bonus.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.social_scheduler,
      temperature: 0.7
    });
  }
}

module.exports = new SocialSchedulerAgent();
