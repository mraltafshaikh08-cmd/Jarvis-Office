/**
 * Jarvis Office - WhatsApp Mobile Gateway
 * Enables 24/7 mobile control of Jarvis Office via WhatsApp (Twilio or Meta Cloud API)
 * Specifically configured for Altaf Shaikh (+91 9359086445).
 */

const config = require('../config/config');
const orchestrator = require('../core/orchestrator');

class WhatsAppGateway {
  constructor() {
    this.authorizedNumber = config.user.phoneNormalized; // 919359086445
  }

  /**
   * Validates if the incoming message is from the verified owner (Altaf Shaikh).
   */
  isAuthorized(senderNumber) {
    if (!senderNumber) return false;
    const clean = senderNumber.replace(/[^0-9]/g, '');
    return clean === this.authorizedNumber || clean.endsWith('9359086445');
  }

  /**
   * Express Webhook handler for incoming WhatsApp messages.
   */
  async handleIncomingWebhook(req, res) {
    try {
      // Handles both Twilio WhatsApp webhook (Body, From) and Meta WhatsApp Cloud API (entry)
      let sender = '';
      let messageText = '';

      if (req.body.Body) {
        // Twilio format
        sender = req.body.From || '';
        messageText = req.body.Body || '';
      } else if (req.body.entry && req.body.entry[0]?.changes[0]?.value?.messages) {
        // Meta Cloud API format
        const msg = req.body.entry[0].changes[0].value.messages[0];
        sender = msg.from;
        messageText = msg.text?.body || '';
      } else {
        messageText = req.body.text || req.body.message || '';
        sender = req.body.sender || this.authorizedNumber;
      }

      console.log(`[WhatsAppGateway] Inbound message from ${sender}: "${messageText}"`);

      // Security check
      if (!this.isAuthorized(sender)) {
        console.warn(`[WhatsAppGateway] Unauthorized access attempt from ${sender}`);
        return res.status(403).json({ error: 'Unauthorized. Only Altaf Shaikh is allowed to command Jarvis.' });
      }

      // Delegate to Jarvis Orchestrator
      const executionResult = await orchestrator.processCommand({
        text: messageText,
        channel: 'whatsapp',
        sender: config.user.name,
        isVoice: false
      });

      // Format response according to webhook provider
      if (req.body.Body) {
        // Twilio TwiML Response
        res.set('Content-Type', 'text/xml');
        return res.send(`
          <Response>
            <Message>${executionResult.response}</Message>
          </Response>
        `);
      }

      return res.status(200).json({
        success: true,
        response: executionResult.response,
        agent: executionResult.assignedAgent
      });

    } catch (err) {
      console.error('[WhatsAppGateway] Error handling message:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new WhatsAppGateway();
