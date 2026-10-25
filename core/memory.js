/**
 * Jarvis Office - Persistent Memory & State Store
 * Manages JSON file-based persistent state for conversations, tasks, leads, skills, and agency revenue.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class MemoryStore {
  constructor() {
    this.dataDir = path.resolve(config.server?.dataDir || path.join(__dirname, '../data'));
    this._ensureDirectory();

    this.files = {
      conversations: path.join(this.dataDir, 'conversations.json'),
      tasks: path.join(this.dataDir, 'tasks.json'),
      leads: path.join(this.dataDir, 'leads.json'),
      skills: path.join(this.dataDir, 'skills.json'),
      metrics: path.join(this.dataDir, 'metrics.json')
    };

    this._initializeStores();
  }

  _ensureDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _initializeStores() {
    const defaults = {
      conversations: [],
      tasks: [],
      leads: [
        {
          id: 'lead-001',
          title: '[Hiring] Full-Stack Developer for SaaS MVP',
          source: 'Reddit r/forhire',
          author: 'startup_founder_99',
          url: 'https://reddit.com/r/forhire',
          contentSnippet: 'Looking for a reliable agency or full-stack dev to build a responsive web portal and landing page in 5-7 days. Budget $800-$1200.',
          discoveredAt: new Date().toISOString(),
          status: 'ready_to_pitch',
          pitch: 'Dear Founder, KADARTECH Solutions can deliver your responsive SaaS portal in a 5-day sprint with full React + Node/Express architecture, plus a free autonomous AI chatbot included.'
        },
        {
          id: 'lead-002',
          title: '[Hiring] 3 E-Commerce Business Websites needed ASAP',
          source: 'Reddit r/freelance',
          author: 'retail_grower',
          url: 'https://reddit.com/r/freelance',
          contentSnippet: 'Need 3 storefronts set up for my fashion brands. Clean Tailwind or WordPress design required.',
          discoveredAt: new Date().toISOString(),
          status: 'ready_to_pitch',
          pitch: 'Hello! Our KADARTECH Starter Pack provides exactly 3 custom business websites for $250 total (5-day delivery) with 100% responsive design and 24/7 support.'
        }
      ],
      skills: [
        {
          name: 'React 19 & Tailwind Responsive Layouts',
          category: 'Frontend',
          source: 'GitHub / KADARTECH Core',
          stars: 1250,
          description: 'Production-tested glassmorphism UI patterns with rapid 3-day turnaround.'
        },
        {
          name: 'C# Selenium Automated QA Suites',
          category: 'Testing & QA',
          source: 'GitHub / SeleniumHQ',
          stars: 28000,
          description: 'End-to-end multi-browser test automation ensuring zero regression bugs.'
        },
        {
          name: 'Autonomous AI Chatbot Funnels',
          category: 'AI Automation',
          source: 'GitHub / OpenJarvis Agency',
          stars: 4500,
          description: 'Self-hosted conversational agent converting cold visitors into paying clients.'
        }
      ],
      metrics: {
        totalRevenue: 28400,
        activeLeadsCount: 14,
        completedProjects: 42,
        activeSprints: 3,
        lastUpdated: new Date().toISOString()
      }
    };

    for (const [key, filePath] of Object.entries(this.files)) {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaults[key], null, 2), 'utf-8');
      }
    }
  }

  _read(key) {
    try {
      const filePath = this.files[key];
      if (!fs.existsSync(filePath)) return [];
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error(`[MemoryStore] Error reading ${key}:`, err.message);
      return [];
    }
  }

  _write(key, data) {
    try {
      const filePath = this.files[key];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error(`[MemoryStore] Error writing ${key}:`, err.message);
      return false;
    }
  }

  getConversations(limit = 50) {
    const list = this._read('conversations');
    return list.slice(-limit);
  }

  saveMessage({ sender, role, text, channel = 'system', metadata = {} }) {
    const list = this._read('conversations');
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      sender,
      role,
      text,
      channel,
      metadata
    };
    list.push(msg);
    this._write('conversations', list);
    return msg;
  }

  getTasks() {
    return this._read('tasks');
  }

  createTask({ title, agent, prompt, channel = 'system' }) {
    const tasks = this._read('tasks');
    const task = {
      id: `task-${Date.now()}`,
      title,
      agent,
      prompt,
      channel,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(task);
    this._write('tasks', tasks);
    return task;
  }

  updateTaskStatus(taskId, status, output = null) {
    const tasks = this._read('tasks');
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].status = status;
      tasks[idx].updatedAt = new Date().toISOString();
      if (output) tasks[idx].output = output;
      this._write('tasks', tasks);
      return tasks[idx];
    }
    return null;
  }

  getLeads() {
    return this._read('leads');
  }

  saveLead(leadData) {
    const leads = this._read('leads');
    const existingIdx = leads.findIndex(l => l.url === leadData.url || l.title === leadData.title);
    if (existingIdx !== -1) {
      leads[existingIdx] = { ...leads[existingIdx], ...leadData, updatedAt: new Date().toISOString() };
      this._write('leads', leads);
      return leads[existingIdx];
    }
    const newLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      discoveredAt: new Date().toISOString(),
      status: 'new',
      ...leadData
    };
    leads.unshift(newLead);
    this._write('leads', leads);
    return newLead;
  }

  getSkills() {
    return this._read('skills');
  }

  addSkill(skill) {
    const skills = this._read('skills');
    const existing = skills.find(s => s.name.toLowerCase() === skill.name.toLowerCase());
    if (existing) {
      Object.assign(existing, skill);
    } else {
      skills.push({ ...skill, learnedAt: new Date().toISOString() });
    }
    this._write('skills', skills);
  }

  getMetrics() {
    return this._read('metrics');
  }

  updateMetrics(delta) {
    const current = this._read('metrics');
    const updated = { ...current, ...delta, lastUpdated: new Date().toISOString() };
    this._write('metrics', updated);
    return updated;
  }
}

module.exports = new MemoryStore();
