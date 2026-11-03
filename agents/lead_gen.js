/**
 * Jarvis Office - Autonomous Lead Generation & Outreach Agent
 * Scans Reddit (r/forhire, r/freelance, r/webdev, r/startups), extracts high-intent client leads,
 * identifies technical pain points, and crafts high-converting pitches for KADARTECH.
 */

const gemini = require('../core/gemini');
const config = require('../config/config');
const prompts = require('../config/prompts');

class LeadGenAgent {
  constructor() {
    this.name = 'LeadGen';
    this.role = 'Autonomous Client Discovery & High-Converting Pitch Specialist';
  }

  /**
   * Synthesizes a compelling, tailored outreach pitch for a discovered lead.
   */
  async generatePitch({ clientName = 'there', platform = 'Reddit', projectDetails, estimatedBudget = 'Flexible', painPoints = [] }) {
    const prompt = `Prospect Name: ${clientName}
Platform: ${platform}
Project Description: ${projectDetails}
Budget: ${estimatedBudget}
Identified Pain Points: ${painPoints.join(', ') || 'Speed of delivery, reliable communication, modern responsive UI'}

Agency Offers to Highlight:
- Single Custom Website: $100 (3-day turnaround)
- Starter Pack: 3 Business Sites for $250 (5-day turnaround)
- Growth Pack: 9 Sites for $600 (60% OFF bulk tier)
- Mobile Apps: Starting at $120
- Micro-SaaS MVP: $800
- FREE BONUS: Autonomous AI Chatbot included with every project.
- Contact: WhatsApp/Call +91 9359086445 | Portfolio: ${config.agency.portfolio}

Write a direct, non-spammy, highly persuasive proposal message.`;

    const pitch = await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.lead_gen,
      temperature: 0.6
    });

    return {
      agent: this.name,
      clientName,
      platform,
      pitch
    };
  }

  /**
   * Analyzes a raw Reddit/Job post to extract structured client data.
   */
  async analyzePost(rawText) {
    const prompt = `Analyze this hiring post and extract key information in JSON format:
\`\`\`
${rawText}
\`\`\`

Return JSON strictly:
{
  "clientName": "Name or username",
  "projectType": "Website / Web App / SaaS / Mobile App / Bug Fix",
  "requiredTech": ["React", "WordPress", etc.],
  "estimatedBudget": "Extracted budget or 'Unknown'",
  "urgencyLevel": "HIGH / MEDIUM / LOW",
  "painPoints": ["list of client pain points"],
  "recommendedPackage": "Single Website ($100) / Starter Pack ($250) / Growth Pack ($600) / SaaS ($800)"
}`;

    return await gemini.generateJSON({
      prompt,
      systemInstruction: 'You are an expert sales analyst for an elite web development agency.'
    });
  }
}

module.exports = new LeadGenAgent();
