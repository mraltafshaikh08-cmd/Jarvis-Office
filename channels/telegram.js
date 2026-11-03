/**
 * Jarvis Office - Telegram Gateway
 * Backup mobile messaging channel for commanding Jarvis Office.
 */

const orchestrator = require('../core/orchestrator');
const config = require('../config/config');

class TelegramGateway {
  constructor() {
    this.name = 'Telegram';
  }

  async handleWebhook(req, res) {
    const message = req.body.message;
    if (!message || !message.text) {
      return res.status(200).send('OK');
    }

    const text = message.text;
    const sender = message.from?.username || message.from?.first_name || config.user.name;

    console.log(`[TelegramGateway] Incoming command from ${sender}: "${text}"`);

    try {
      const result = await orchestrator.processCommand({
        text,
        channel: 'telegram',
        sender,
        isVoice: false
      });

      return res.status(200).json({
        method: 'sendMessage',
        chat_id: message.chat.id,
        text: result.response,
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error('[TelegramGateway] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TelegramGateway();
