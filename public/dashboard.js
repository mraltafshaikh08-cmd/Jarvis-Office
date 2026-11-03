/**
 * Jarvis Office - Mission Control Frontend Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const commandInput = document.getElementById('command-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');
  const refreshLeadsBtn = document.getElementById('refresh-leads-btn');
  const learnSkillsBtn = document.getElementById('learn-skills-btn');
  const leadsContainer = document.getElementById('leads-container');
  const skillsContainer = document.getElementById('skills-container');

  // Stats Elements
  const statRevenue = document.getElementById('stat-revenue');
  const statLeads = document.getElementById('stat-leads');
  const statTasks = document.getElementById('stat-tasks');

  // Initial load
  loadMetrics();
  loadLeads();
  loadSkills();

  // Send Command handler
  async function sendCommand(text) {
    const cmd = text || commandInput.value.trim();
    if (!cmd) return;

    appendMessage('Boss (You)', cmd, 'user');
    commandInput.value = '';
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="animate-spin inline-block mr-1">⚡</span> Routing...';

    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cmd, channel: 'web', sender: 'Altaf Shaikh' })
      });
      const data = await response.json();

      if (data.success) {
        appendMessage(`Jarvis (${data.agent || 'Orchestrator'})`, data.response, 'assistant');
        loadMetrics();
        loadLeads();
      } else {
        appendMessage('Jarvis System', `Error: ${data.error || 'Execution failure'}`, 'error');
      }
    } catch (err) {
      appendMessage('Jarvis System', `Network failure: ${err.message}`, 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Execute Directive';
    }
  }

  sendBtn.addEventListener('click', () => sendCommand());
  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCommand();
    }
  });

  // Quick Prompt Buttons
  quickPromptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      sendCommand(prompt);
    });
  });

  // Refresh Leads
  if (refreshLeadsBtn) {
    refreshLeadsBtn.addEventListener('click', async () => {
      refreshLeadsBtn.disabled = true;
      refreshLeadsBtn.textContent = 'Scanning Reddit & Google...';
      try {
        const res = await fetch('/api/leads/scan', { method: 'POST' });
        const data = await res.json();
        renderLeads(data.leads || []);
        loadMetrics();
      } catch (err) {
        console.error('Lead scan failed:', err);
      } finally {
        refreshLeadsBtn.disabled = false;
        refreshLeadsBtn.textContent = 'Scan Radar Now';
      }
    });
  }

  // Learn Skills
  if (learnSkillsBtn) {
    learnSkillsBtn.addEventListener('click', async () => {
      learnSkillsBtn.disabled = true;
      learnSkillsBtn.textContent = 'Distilling Repos...';
      try {
        const res = await fetch('/api/skills/learn', { method: 'POST' });
        const data = await res.json();
        renderSkills(data.skills || []);
      } catch (err) {
        console.error('Skill learning failed:', err);
      } finally {
        learnSkillsBtn.disabled = false;
        learnSkillsBtn.textContent = 'Acquire New Skills';
      }
    });
  }

  // Append Chat Message
  function appendMessage(sender, text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-3 rounded-lg border text-xs leading-relaxed ${
      type === 'user' 
        ? 'bg-blue-600/20 border-blue-500/40 text-blue-100 ml-6' 
        : type === 'error'
        ? 'bg-red-950/40 border-red-500/50 text-red-200'
        : 'bg-slate-800/80 border-slate-700/60 text-slate-200 mr-6'
    }`;

    const senderHeader = document.createElement('div');
    senderHeader.className = 'font-semibold text-[11px] mb-1 text-slate-400 flex items-center justify-between';
    senderHeader.innerHTML = `<span>${sender}</span><span class="text-[10px] text-slate-500">${new Date().toLocaleTimeString()}</span>`;

    const bodyContent = document.createElement('div');
    bodyContent.className = 'whitespace-pre-wrap font-sans';
    bodyContent.textContent = text;

    msgDiv.appendChild(senderHeader);
    msgDiv.appendChild(bodyContent);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Fetch & Render Metrics
  async function loadMetrics() {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      if (data.metrics) {
        if (statRevenue) statRevenue.textContent = `$${(data.metrics.totalRevenue || 28400).toLocaleString()}`;
        if (statLeads) statLeads.textContent = data.metrics.activeLeadsCount || 14;
        if (statTasks) statTasks.textContent = (data.metrics.completedProjects || 42) + ' Delivered';
      }
    } catch (e) {}
  }

  // Fetch & Render Leads
  async function loadLeads() {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      renderLeads(data.leads || []);
    } catch (e) {}
  }

  function renderLeads(leads) {
    if (!leadsContainer) return;
    if (!leads || leads.length === 0) {
      leadsContainer.innerHTML = '<div class="text-xs text-slate-500 italic p-3">No active client leads found yet. Click Scan Radar to discover.</div>';
      return;
    }

    leadsContainer.innerHTML = leads.map(l => `
      <div class="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg hover:border-blue-500/40 transition">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-blue-300 truncate max-w-[280px]">${escapeHtml(l.title)}</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">${escapeHtml(l.source || 'Web')}</span>
        </div>
        <p class="text-[11px] text-slate-400 line-clamp-2 mb-2">${escapeHtml(l.contentSnippet || l.content || '')}</p>
        <div class="bg-slate-950/70 p-2 rounded border border-slate-800 text-[10px] text-emerald-400 font-mono mb-2">
          <strong>Synthesized Pitch:</strong> ${escapeHtml(l.pitch ? l.pitch.substring(0, 160) + '...' : 'Custom KADARTECH Offer Generated')}
        </div>
        <div class="flex items-center justify-between text-[10px] text-slate-500">
          <span>Target: ${escapeHtml(l.author || 'Prospective Founder')}</span>
          <a href="${l.url}" target="_blank" class="text-blue-400 hover:underline">View Source &rarr;</a>
        </div>
      </div>
    `).join('');
  }

  // Fetch & Render Skills
  async function loadSkills() {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      renderSkills(data.skills || []);
    } catch (e) {}
  }

  function renderSkills(skills) {
    if (!skillsContainer) return;
    if (!skills || skills.length === 0) {
      skillsContainer.innerHTML = '<div class="text-xs text-slate-500 italic p-3">Cataloging developer skills...</div>';
      return;
    }

    skillsContainer.innerHTML = skills.map(s => `
      <div class="p-2.5 bg-slate-900/40 border border-slate-800/60 rounded-md">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="font-medium text-slate-200">${escapeHtml(s.name)}</span>
          <span class="text-[10px] text-yellow-400">★ ${(s.stars || 100).toLocaleString()}</span>
        </div>
        <p class="text-[11px] text-slate-400">${escapeHtml(s.description || '')}</p>
        <span class="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">${escapeHtml(s.category || 'Tech')}</span>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
