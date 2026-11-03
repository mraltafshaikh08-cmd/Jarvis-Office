/**
 * Jarvis Office - Customer Support & Conversational Funnels Agent
 * Answers incoming inquiries 24/7, handles objections, and qualifies prospective clients.
 */

const gemini = require('../core/gemini');
const prompts = require('../config/prompts');

class CustomerSupportAgent {
  constructor() {
    this.name = 'CustomerSupport';
    this.role = '24/7 Autonomous Client Success & Support Agent';
  }

  async handleInquiry({ inquiry, clientContext = '' }) {
    const prompt = `Client Inquiry: "${inquiry}"
Context: ${clientContext}

Agency Details:
- KADARTECH Solutions (Managing Director: Altaf Shaikh)
- Delivery turnaround: 3-5 days
- Free autonomous AI chatbot included with every website/SaaS
- Packages: $100 Single Site, $250 Starter Pack (3 sites), $600 Growth Pack (9 sites)
- Contact: WhatsApp/Call +91 9359086445

Provide a professional, reassuring, and conversion-focused response that answers questions and guides them to place an order or book a call.`;

    return await gemini.generateText({
      prompt,
      systemInstruction: prompts.subAgents.customer_support,
      temperature: 0.5
    });
  }
}

module.exports = new CustomerSupportAgent();
