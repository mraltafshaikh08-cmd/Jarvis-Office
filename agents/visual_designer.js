/**
 * Jarvis Office - Visual Designer & UI/UX Architect Agent
 * Crafts modern, high-converting visual design specifications, responsive Tailwind CSS layouts, and glassmorphism styling.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class VisualDesignerAgent {
  constructor() {
    this.name = 'VisualDesigner';
    this.role = 'UI/UX & Design Systems Architect';
  }

  async designInterface({ projectType, brandVibe = 'Modern Dark Glassmorphism', keyFeatures = [] }) {
    const prompt = `Project: ${projectType}
Aesthetic / Vibe: ${brandVibe}
Features: ${keyFeatures.join(', ')}

Provide:
1. Complete Color Palette (Hex codes for primary, accent, surface, background, and text).
2. Typography Hierarchy.
3. Component Wireframe Specs (Header, Hero Section, Feature Grid, Pricing Cards, CTA Banner).
4. Tailwind CSS Utility Classes ready for Friday to implement.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.visual_designer,
      temperature: 0.5
    });
  }
}

module.exports = new VisualDesignerAgent();
