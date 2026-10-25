/**
 * Jarvis Office - 24/7 GitHub Skill Acquisition Engine
 * Actively monitors GitHub trending repositories, extracts reusable developer skills, and registers them into the active agency catalog.
 */

const https = require('https');
const memory = require('../core/memory');
const gemini = require('../core/gemini');

class GitHubSkillLearner {
  constructor() {
    this.searchQueries = [
      'topic:ai-agents+stars:>500',
      'topic:saas-boilerplate+stars:>300',
      'topic:web-scraping+stars:>400',
      'topic:automation+stars:>500'
    ];
  }

  /**
   * Queries GitHub Search API for trending repositories.
   */
  async searchGitHubRepos(query) {
    return new Promise((resolve) => {
      const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=5`;
      const options = {
        headers: {
          'User-Agent': 'JarvisOffice-Learner/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed.items || []);
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
   * Extracts practical agent skills from a repository.
   */
  async learnFromRepo(repo) {
    const prompt = `GitHub Repository: ${repo.full_name}
Description: ${repo.description}
Topics: ${(repo.topics || []).join(', ')}
Primary Language: ${repo.language}
Stars: ${repo.stargazers_count}

Task:
Extract a modular, reusable developer skill or capability from this repository that can be added to KADARTECH agency's AI office (Jarvis/Friday).
Return a JSON object:
{
  "name": "Short Name of Skill",
  "category": "Frontend | Backend | AI Automation | Testing | Micro-SaaS | DevOps",
  "description": "What this skill does and how it increases agency productivity or revenue",
  "implementationNotes": "Key patterns, libraries, or API methods"
}`;

    try {
      const skillData = await gemini.generateJSON({
        prompt,
        systemInstruction: 'You are an autonomous AI research engineer extracting actionable coding skills from open source repositories.'
      });

      const skillRecord = {
        name: skillData.name || repo.name,
        source: repo.html_url,
        category: skillData.category || 'General',
        description: skillData.description || repo.description,
        implementationNotes: skillData.implementationNotes || '',
        stars: repo.stargazers_count
      };

      memory.addSkill(skillRecord);
      console.log(`[GitHubLearner] Successfully acquired new skill: "${skillRecord.name}" from ${repo.full_name}`);
      return skillRecord;
    } catch (err) {
      console.warn(`[GitHubLearner] Failed to distill skill from ${repo.full_name}:`, err.message);
      return null;
    }
  }

  /**
   * Main routine: scans trending repos and expands skill library.
   */
  async runLearningCycle() {
    console.log('[GitHubLearner] Starting 24/7 Skill Acquisition Cycle from GitHub...');
    const newlyLearned = [];

    for (const query of this.searchQueries) {
      try {
        const repos = await this.searchGitHubRepos(query);
        for (const repo of repos.slice(0, 2)) {
          const skill = await this.learnFromRepo(repo);
          if (skill) newlyLearned.push(skill);
        }
      } catch (err) {
        console.warn(`[GitHubLearner] Error searching with query "${query}":`, err.message);
      }
    }

    console.log(`[GitHubLearner] Cycle completed. Learned ${newlyLearned.length} new capabilities.`);
    return newlyLearned;
  }
}

module.exports = new GitHubSkillLearner();
