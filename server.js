/**
 * JARVIS OFFICE - Autonomous AI Agency Operating System
 * Server Entry Point & Multi-Channel Gateway
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const config = require('./config/config');
const memory = require('./core/memory');
const orchestrator = require('./core/orchestrator');
const projectFinder = require('./engine/project_finder');
const githubLearner = require('./engine/github_learner');

// Channel Routers
const whatsappRouter = require('./channels/whatsapp');
const voiceRouter = require('./channels/voice_call');
const telegramRouter = require('./channels/telegram');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Mission Control Dashboard
app.use(express.static(path.join(__dirname, 'public')));

// Channel Webhooks
app.use('/webhook/whatsapp', whatsappRouter);
app.use('/webhook/voice', voiceRouter);
app.use('/webhook/telegram', telegramRouter);

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'JARVIS OFFICE',
    version: '1.0.0',
    boss: config.user.name,
    phoneControl: config.user.phone,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, channel = 'web', sender = config.user.name } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message parameter is required' });
    }

    const result = await orchestrator.processCommand({
      text: message,
      channel,
      sender,
      isVoice: false
    });

    res.status(200).json({
      success: true,
      taskId: result.taskId,
      agent: result.assignedAgent,
      response: result.response
    });
  } catch (err) {
    console.error('[API /chat] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leads', (req, res) => {
  const leads = memory.getLeads();
  res.status(200).json(leads);
});

app.post('/api/scan-leads', async (req, res) => {
  try {
    const discovered = await projectFinder.scanForLeads();
    res.status(200).json({ success: true, count: discovered.length, leads: discovered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/skills', (req, res) => {
  const skills = memory.getSkills();
  res.status(200).json(skills);
});

app.post('/api/learn-github', async (req, res) => {
  try {
    const skills = await githubLearner.runLearningCycle();
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/metrics', (req, res) => {
  const metrics = memory.getMetrics();
  res.status(200).json(metrics);
});

app.get('/api/tasks', (req, res) => {
  const tasks = memory.getTasks();
  res.status(200).json(tasks);
});

// Periodic Background Workers (Runs 24/7 in cloud)
function startBackgroundWorkers() {
  console.log('[JarvisOffice] Activating 24/7 background intelligence workers...');

  // Lead Finder worker (every N hours)
  const leadIntervalMs = config.learning.leadSearchIntervalHours * 60 * 60 * 1000;
  setInterval(() => {
    projectFinder.scanForLeads().catch(err => console.warn('[Scheduler] Lead scan failed:', err.message));
  }, leadIntervalMs);

  // GitHub Skill Acquisition worker (every N hours)
  const githubIntervalMs = config.learning.learnIntervalHours * 60 * 60 * 1000;
  setInterval(() => {
    githubLearner.runLearningCycle().catch(err => console.warn('[Scheduler] GitHub learning failed:', err.message));
  }, githubIntervalMs);
}

// Start Server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`
=============================================================================
  🤖 JARVIS OFFICE — AUTONOMOUS AI AGENCY OPERATING SYSTEM
=============================================================================
  Status:           ONLINE & READY (24/7 Continuous Execution)
  Mission Control:  http://localhost:${PORT}
  Brain Model:      Google Gemini (${config.gemini.primaryModel})
  Boss:             ${config.user.name} (${config.user.phone})
  WhatsApp Webhook: http://localhost:${PORT}/webhook/whatsapp/webhook
  Voice Webhook:    http://localhost:${PORT}/webhook/voice/inbound
  Sub-Agents:       Friday (Lead Dev) + 10 Specialists Active
=============================================================================
`);

  startBackgroundWorkers();
});
