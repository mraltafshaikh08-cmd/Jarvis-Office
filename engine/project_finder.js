/**
 * Jarvis Office - Autonomous Client & Project Finder Engine
 * Searches Reddit hiring subreddits and web sources to uncover high-paying client leads, extracting requirements and generating pitches.
 */

const https = require('https');
const memory = require('../core/memory');
const leadGen = require('../agents/lead_gen');
const config = require('../config/config');

class ProjectFinderEngine {
  constructor() {
    this.targetSubreddits = ['forhire', 'freelance_forhire', 'webdev', 'startups', 'smallbusiness'];
    this.hiringKeywords = ['[hiring]', 'looking for developer', 'need website', 'need web developer', 'redesign', 'mobile app developer', 'full stack developer'];
  }

  /**
   * Fetches latest posts from Reddit's public JSON API.
   */
  async fetchRedditSubreddit(subreddit) {
    return new Promise((resolve) => {
      const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=15`;
      const options = {
        headers: {
          'User-Agent': config.learning.redditUserAgent || 'JarvisOfficeBot/1.0 (by /u/kadartech)'
        }
      };

      https.get(url, options, (res) => {
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
   * Scans all target subreddits, filters for hiring opportunities, and analyzes them.
   */
  async scanForLeads() {
    console.log('[ProjectFinder] Starting automated scan across Reddit & web sources...');
    const discovered = [];

    for (const sub of this.targetSubreddits) {
      try {
        const posts = await this.fetchRedditSubreddit(sub);
        for (const post of posts) {
          const title = (post.title || '').toLowerCase();
          const selftext = (post.selftext || '').toLowerCase();
          const combined = `${title} ${selftext}`;

          // Check if it's a hiring post and not someone offering services ([For Hire])
          const isHiring = this.hiringKeywords.some(kw => combined.includes(kw)) && !title.includes('[for hire]');

          if (isHiring) {
            const rawLead = {
              title: post.title,
              author: post.author,
              url: `https://reddit.com${post.permalink}`,
              subreddit: sub,
              content: post.selftext ? post.selftext.substring(0, 1000) : post.title,
              score: post.score,
              createdUtc: post.created_utc
            };

            // Analyze with LeadGen Agent
            let analysis = {};
            try {
              analysis = await leadGen.analyzePost(`${rawLead.title}\n\n${rawLead.content}`);
            } catch (err) {
              analysis = {
                clientName: post.author,
                projectType: 'Web Development / IT Solutions',
                estimatedBudget: 'Negotiable',
                urgencyLevel: 'HIGH',
                recommendedPackage: 'Growth Pack (9 Websites - $600)'
              };
            }

            // Generate ready-to-send pitch
            let pitchResult = {};
            try {
              pitchResult = await leadGen.generatePitch({
                clientName: analysis.clientName || post.author,
                platform: `Reddit (r/${sub})`,
                projectDetails: rawLead.title,
                estimatedBudget: analysis.estimatedBudget,
                painPoints: analysis.painPoints || []
              });
            } catch (pitchErr) {
              pitchResult = { pitch: 'Hello! KADARTECH Solutions can build and deliver this project within 3-5 days. WhatsApp: +91 9359086445' };
            }

            const completeLead = {
              title: rawLead.title,
              source: `Reddit r/${sub}`,
              author: rawLead.author,
              url: rawLead.url,
              contentSnippet: rawLead.content.substring(0, 300),
              analysis,
              pitch: pitchResult.pitch,
              status: 'READY_FOR_OUTREACH'
            };

            memory.saveLead(completeLead);
            discovered.push(completeLead);
          }
        }
      } catch (subErr) {
        console.warn(`[ProjectFinder] Error scanning r/${sub}:`, subErr.message);
      }
    }

    console.log(`[ProjectFinder] Scan completed. Discovered ${discovered.length} qualified client opportunities.`);
    return discovered;
  }
}

module.exports = new ProjectFinderEngine();
