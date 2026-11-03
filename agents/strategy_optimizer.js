/**
 * Jarvis Office - Strategy & Process Optimization Agent
 * Workflow orchestration, SOP design, and agency velocity optimization.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class StrategyOptimizerAgent {
  constructor() {
    this.name = 'StrategyOptimizer';
    this.role = 'Operations & Delivery Velocity Director';
  }

  async optimizeWorkflow({ sprintGoal, activeProjects = 5, teamCapacity = 'Autonomous AI Office' }) {
    const prompt = `Sprint Goal: ${sprintGoal}
Active Projects: ${activeProjects}
Team Capacity: ${teamCapacity}

Provide:
1. 5-Day Delivery Sprint Roadmap (Day 1: Wireframe & DB -> Day 2-3: Core Dev -> Day 4: QA & AI Chatbot -> Day 5: Deployment & Handover).
2. Automation Levers to cut manual dev time by 80%.
3. Risk Mitigation Plan for zero-delay delivery.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.strategy_optimizer,
      temperature: 0.4
    });
  }
}

module.exports = new StrategyOptimizerAgent();
