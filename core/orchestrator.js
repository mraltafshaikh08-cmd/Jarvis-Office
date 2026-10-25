/**
 * Jarvis Office - Master Orchestration Engine
 * Jarvis (The Boss / Manager Agent) orchestrates Friday and all 10 specialist sub-agents.
 */

const gemini = require('./gemini');
const memory = require('./memory');
const config = require('../config/config');
const prompts = require('../config/prompts');

// Sub-Agents
const friday = require('../agents/friday');
const leadGen = require('../agents/lead_gen');
const contentRevenue = require('../agents/content_revenue');
const visualDesigner = require('../agents/visual_designer');
const deepResearch = require('../agents/deep_research');
const socialScheduler = require('../agents/social_scheduler');
const microSaasFactory = require('../agents/micro_saas_factory');
const codeReview = require('../agents/code_review');
const customerSupport = require('../agents/customer_support');
const strategyOptimizer = require('../agents/strategy_optimizer');
const revenueMaya = require('../agents/revenue_maya');

class JarvisOrchestrator {
  constructor() {
    this.name = 'Jarvis';
    this.role = 'Master Agency Manager & Executive Orchestrator';
    this.agents = {
      friday,
      lead_gen: leadGen,
      content_revenue: contentRevenue,
      visual_designer: visualDesigner,
      deep_research: deepResearch,
      social_scheduler: socialScheduler,
      micro_saas_factory: microSaasFactory,
      code_review: codeReview,
      customer_support: customerSupport,
      strategy_optimizer: strategyOptimizer,
      revenue_maya: revenueMaya
    };
  }

  /**
   * Main entry point for commands received from WhatsApp, Voice Call, Telegram, or Web.
   */
  async processCommand({ text, channel = 'web', sender = config.user.name, isVoice = false }) {
    console.log(`[Jarvis] Processing command from ${sender} via ${channel}: "${text}"`);
    
    // Log incoming message to persistent memory
    memory.saveMessage({ sender, role: 'user', text, channel });

    // Step 1: Intent Analysis & Delegation Planning via Gemini
    const planningPrompt = `Command from Boss (${sender}): "${text}"
Communication Channel: ${channel} (Voice mode: ${isVoice ? 'YES' : 'NO'})

Available Sub-Agents:
1. friday: Lead Full-Stack Coding (React, Express, Node, Python, .NET, Selenium, Vue, Laravel, WordPress, SQL, TypeScript)
2. lead_gen: Reddit/Google Lead Generation, client prospect research & winning pitch generation
3. content_revenue: Marketing copy, sales funnels, cold emails, digital assets
4. visual_designer: Modern UI/UX specs, Tailwind designs, wireframes
5. deep_research: Deep technical audits, competitor research, trend scouting
6. social_scheduler: Weekly viral LinkedIn/X schedules
7. micro_saas_factory: Rapid MVP scaffolding & boilerplates
8. code_review: QA automated testing (C# Selenium/Jest/Playwright) & security audits
9. customer_support: 24/7 AI chatbot responses & objection handling
10. strategy_optimizer: SOPs, sprint scheduling & workflow optimization
11. revenue_maya: Retainer strategies, pricing tiers, upsells & cashflow

Analyze the intent and return a JSON decision object:
{
  "primaryAgent": "jarvis" | "friday" | "lead_gen" | "content_revenue" | "visual_designer" | "deep_research" | "social_scheduler" | "micro_saas_factory" | "code_review" | "customer_support" | "strategy_optimizer" | "revenue_maya",
  "actionType": "direct_reply" | "delegate_task" | "multi_agent_pipeline",
  "taskDescription": "Clear task description for the assigned agent",
  "delegatedAgents": ["agent_id_1", "agent_id_2"],
  "requiresCode": boolean
}`;

    let plan;
    try {
      plan = await gemini.generateJSON({
        prompt: planningPrompt,
        systemInstruction: prompts.jarvis
      });
    } catch (err) {
      console.warn('[Jarvis] Failed to get structured plan, falling back to direct Jarvis execution:', err.message);
      plan = {
        primaryAgent: 'jarvis',
        actionType: 'direct_reply',
        taskDescription: text,
        delegatedAgents: []
      };
    }

    console.log(`[Jarvis] Plan decided: Primary Agent = ${plan.primaryAgent}, Action = ${plan.actionType}`);

    // Step 2: Task Execution
    let resultPayload = null;
    const taskRecord = memory.createTask({
      title: plan.taskDescription || text,
      agent: plan.primaryAgent,
      prompt: text,
      channel
    });

    try {
      if (plan.primaryAgent === 'friday') {
        resultPayload = await friday.buildSolution({
          taskDescription: plan.taskDescription || text,
          techStack: 'Full-Stack / Modern Web',
          context: `Requested by ${sender} via ${channel}`
        });
      } else if (plan.primaryAgent === 'lead_gen') {
        resultPayload = await leadGen.generatePitch({
          clientName: 'Prospective Client',
          platform: 'Reddit / Google',
          projectDetails: plan.taskDescription || text
        });
      } else if (this.agents[plan.primaryAgent]) {
        // Dynamically invoke specialist agent methods or general execution
        const agent = this.agents[plan.primaryAgent];
        const agentPrompt = `Task: ${plan.taskDescription || text}\nContext: Requested by ${sender} via ${channel}`;
        const output = await gemini.generateText({
          prompt: agentPrompt,
          systemInstruction: prompts.subAgents[plan.primaryAgent] || prompts.jarvis,
          temperature: 0.5
        });
        resultPayload = { agent: agent.name || plan.primaryAgent, output };
      } else {
        // Direct Jarvis Synthesis
        const jarvisPrompt = `Boss's Message: "${text}"
Context: Agency management, technical execution, client discovery, or mobile update.

Provide an executive, decisive reply as Jarvis. If actionable, outline exact next steps.`;
        const output = await gemini.generateText({
          prompt: jarvisPrompt,
          systemInstruction: prompts.jarvis,
          temperature: 0.6
        });
        resultPayload = { agent: 'Jarvis', output };
      }

      memory.updateTaskStatus(taskRecord.id, 'COMPLETED', resultPayload);
    } catch (execErr) {
      console.error(`[Jarvis] Error executing sub-agent task:`, execErr.message);
      resultPayload = {
        agent: 'Jarvis',
        output: `Boss, I encountered an issue during execution: ${execErr.message}. I am resolving it immediately.`
      };
      memory.updateTaskStatus(taskRecord.id, 'FAILED', resultPayload);
    }

    // Step 3: Format Output for Channel (WhatsApp, Voice, Telegram, Web)
    const formattedResponse = await this._formatForChannel({
      rawContent: resultPayload.output || resultPayload.pitch || resultPayload.specs || JSON.stringify(resultPayload),
      channel,
      isVoice,
      agentName: resultPayload.agent || 'Jarvis'
    });

    // Log reply to memory
    memory.saveMessage({
      sender: 'Jarvis',
      role: 'assistant',
      text: formattedResponse,
      channel,
      metadata: { taskId: taskRecord.id }
    });

    return {
      taskId: taskRecord.id,
      assignedAgent: resultPayload.agent,
      response: formattedResponse,
      rawResult: resultPayload
    };
  }

  /**
   * Adapts the final response to the constraints of the channel (WhatsApp text, Voice speech, or Web markdown).
   */
  async _formatForChannel({ rawContent, channel, isVoice, agentName }) {
    if (isVoice || channel === 'voice') {
      const prompt = `Convert this technical response into natural spoken dialogue for a phone call to Altaf Shaikh. Keep it concise (2-4 sentences max), confident, and friendly. Do not use markdown symbols (*, #, \`):
\`\`\`
${rawContent}
\`\`\``;
      return await gemini.generateText({
        prompt,
        systemInstruction: 'You are Jarvis speaking over a phone call to your boss Altaf Shaikh.',
        temperature: 0.5
      });
    }

    if (channel === 'whatsapp') {
      let waText = `*🤖 JARVIS OFFICE | ${agentName.toUpperCase()}*\n`;
      waText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      waText += rawContent;
      waText += `\n\n━━━━━━━━━━━━━━━━━━━━\n_KADARTECH Autonomous AI Office 24/7_`;
      return waText;
    }

    // Default Web / Telegram
    return rawContent;
  }
}

module.exports = new JarvisOrchestrator();
