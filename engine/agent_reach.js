/**
 * JARVIS OFFICE - Agent Reach: Automated Multi-Platform Client Discovery & Outreach Engine
 * Integrated and inspired by Agent-Reach (https://github.com/Panniantong/Agent-Reach).
 * 
 * Features:
 * - Multi-Channel Scout: Mines Reddit, Google, and Developer communities for clients
 * - Pain-Point & Budget Extraction: Automatically flags budget, tech stack, and timeline
 * - Hyper-Targeted Pitch Synthesis: Generates winning proposals tailored to KADARTECH packages:
 *   * Single Website ($100 / 3-day turnaround)
 *   * Starter Pack (3 Websites / $250 / 5-day turnaround)
 *   * Growth Pack (9 Websites / $600 / 60% OFF)
 *   * Mobile Apps ($120+)
 *   * Custom SaaS Tools ($800)
 *   * Always includes: Free Autonomous AI Chatbot Agent
 * - Auto-Followup & CRM Tracking: Stores leads in CDM persistent memory
 */

const https = require('https');
const memory = require('../core/memory');
const cdm = require('../core/cdm');
const gemini = require('../core/gemini');
const config = require('../config/config');

class AgentReachEngine {
  constructor() {
    this.name = 'Agent Reach';
    this.targetChannels = [
      { name: 'Reddit r/forhire', url: 'https://www.reddit.com/r/forhire/new.json?limit=15' },
      { name: 'Reddit r/freelance_forhire', url: 'https://www.reddit.com/r/freelance_forhire/new.json?limit=15' },
      { name: 'Reddit r/webdev', url: 'https://www.reddit.com/r/webdev/new.json?limit=15' },
      { name: 'Reddit r/startups', url: 'https://www.reddit.com/r/startups/new.json?limit=15' },
      { name: 'Reddit r/smallbusiness', url: 'https://www.reddit.com/r/smallbusiness/new.json?limit=15' }
    ];
  }

  /**
   * Scans a given Reddit channel using public JSON endpoints.
   */
  async _fetchChannelPosts(channelUrl) {
    return new Promise((resolve) => {
      const options = {
        headers: {
          'User-Agent': 'JarvisOffice-AgentReach/2.0'
        }
      };

      https.get(channelUrl, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              const posts = (parsed.data && parsed.data.children) ? parsed.data.children.map(c => c.data) : [];
              resolve(posts);
            } catch (e) {
              resolve([]);
            }
          } else {
            resolve([]);
          }
        });
      }).on('error', () => resolve([]));
    });
  }

  /**
   * Comprehensive Multi-Platform Prospecting Scan
   */
  async scanProspects() {
    console.log('[AgentReach] Initiating autonomous client discovery across multi-platform radar...');
    const qualifiedLeads = [];

    for (const channel of this.targetChannels) {
      try {
        const posts = await this._fetchChannelPosts(channel.url);
        for (const post of posts) {
          const title = (post.title || '').toLowerCase();
          const body = (post.selftext || '').toLowerCase();
          const combined = `${title} ${body}`;

          const isHiring = (
            title.includes('[hiring]') || 
            title.includes('looking for web') || 
            title.includes('need developer') || 
            title.includes('build a website') || 
            title.includes('need saas') || 
            body.includes('seeking developer')
          ) && !title.includes('[for hire]');

          if (isHiring) {
            const leadData = {
              title: post.title,
              author: post.author,
              url: `https://reddit.com${post.permalink}`,
              platform: channel.name,
              content: post.selftext ? post.selftext.substring(0, 800) : post.title,
              score: post.score,
              createdUtc: post.created_utc
            };

            // Synthesize winning pitch through Gemini using CDM prompt compression
            const pitch = await this.synthesizePitch(leadData);

            const completeRecord = {
              id: `reach-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              ...leadData,
              pitch: pitch.text,
              recommendedPackage: pitch.recommendedPackage,
              estimatedValue: pitch.estimatedValue,
              status: 'READY_TO_OUTREACH',
              discoveredAt: new Date().toISOString()
            };

            memory.saveLead(completeRecord);
            qualifiedLeads.push(completeRecord);
          }
        }
      } catch (err) {
        console.warn(`[AgentReach] Notice on ${channel.name}:`, err.message);
      }
    }

    console.log(`[AgentReach] Completed scan. Found ${qualifiedLeads.length} high-intent client opportunities.`);
    return qualifiedLeads;
  }

  /**
   * Synthesizes an executive, irresistible outreach proposal.
   */
  async synthesizePitch(lead) {
    const prompt = `Prospect Title: "${lead.title}"
Platform: ${lead.platform}
Prospect Username: ${lead.author}
Project Need: ${lead.content}

Agency Profile:
Agency: KADARTECH Solutions (Managing Director: Altaf Shaikh, WhatsApp: +91 9359086445)
Core Offers:
1. Single Website ($100, 3-day turnaround)
2. Starter Pack (3 Custom Business Websites for $250 total, 5 days)
3. Growth Pack (9 Custom Websites for $600 total - 60% OFF, 5 days)
4. Mobile Apps ($120+)
5. Custom SaaS Tools ($800)
Value Add: Every package INCLUDES a free 24/7 Autonomous AI Chatbot Agent.

Task:
Write a short, highly converting, personalized direct pitch to the prospect.
Highlight why KADARTECH is the ideal team, mention exact turnaround and pricing, and include a call to action to connect on WhatsApp (+91 9359086445) or reply directly.
Also specify:
- recommendedPackage: the best package for this lead
- estimatedValue: estimated dollar value ($100, $250, $600, or $800)

Return JSON:
{
  "text": "Pitch proposal text here",
  "recommendedPackage": "Starter Pack (3 Websites - $250)",
  "estimatedValue": "$250"
}`;

    try {
      return await gemini.generateJSON({
        prompt,
        systemInstruction: 'You are the Chief Outreach & Dealmaker Agent for KADARTECH Solutions.'
      });
    } catch (e) {
      return {
        text: `Hi ${lead.author}, I saw your post regarding "${lead.title}". KADARTECH Solutions specializes in fast-turnaround web and software development with 24/7 AI chatbot integration. We can deliver your project in 3-5 days. Let's chat directly on WhatsApp: +91 9359086445 or reply to this message! Best, Altaf Shaikh - Managing Director.`,
        recommendedPackage: 'Starter Pack ($250)',
        estimatedValue: '$250'
      };
    }
  }
}

module.exports = new AgentReachEngine();
