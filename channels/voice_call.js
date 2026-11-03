/**
 * Jarvis Office - Voice Call Mobile Gateway
 * Allows Altaf Shaikh to command Jarvis over a direct phone call from +91 9359086445.
 * Compatible with Twilio Voice Webhooks (TwiML Voice).
 */

const config = require('../config/config');
const orchestrator = require('../core/orchestrator');

class VoiceCallGateway {
  constructor() {
    this.authorizedNumber = config.user.phoneNormalized; // 919359086445
  }

  isAuthorized(callerNumber) {
    if (!callerNumber) return false;
    const clean = callerNumber.replace(/[^0-9]/g, '');
    return clean === this.authorizedNumber || clean.endsWith('9359086445');
  }

  /**
   * Initial call answer webhook.
   */
  handleIncomingCall(req, res) {
    const caller = req.body.From || '';
    console.log(`[VoiceGateway] Phone call received from: ${caller}`);

    if (!this.isAuthorized(caller)) {
      res.set('Content-Type', 'text/xml');
      return res.send(`
        <Response>
          <Say voice="Polly.Matthew">Security breach. Access restricted to Altaf Shaikh.</Say>
          <Hangup/>
        </Response>
      `);
    }

    // Greet Boss and listen for speech command
    res.set('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Say voice="Polly.Matthew">Good day, Boss. Jarvis Office online. What are your orders?</Say>
        <Gather input="speech" action="/webhook/voice/process" timeout="5" speechTimeout="auto">
          <Say voice="Polly.Matthew">I am listening.</Say>
        </Gather>
        <Say voice="Polly.Matthew">I did not hear a command. Terminating call.</Say>
        <Hangup/>
      </Response>
    `);
  }

  /**
   * Processes speech transcript from the phone call.
   */
  async handleSpeechInput(req, res) {
    const speechResult = req.body.SpeechResult || '';
    const caller = req.body.From || '';

    console.log(`[VoiceGateway] Speech command from ${caller}: "${speechResult}"`);

    if (!speechResult) {
      res.set('Content-Type', 'text/xml');
      return res.send(`
        <Response>
          <Say voice="Polly.Matthew">I could not catch that, Boss. Goodbye.</Say>
          <Hangup/>
        </Response>
      `);
    }

    try {
      const result = await orchestrator.processCommand({
        text: speechResult,
        channel: 'voice',
        sender: config.user.name,
        isVoice: true
      });

      res.set('Content-Type', 'text/xml');
      return res.send(`
        <Response>
          <Say voice="Polly.Matthew">${result.response}</Say>
          <Gather input="speech" action="/webhook/voice/process" timeout="4" speechTimeout="auto">
            <Say voice="Polly.Matthew">Any further directives?</Say>
          </Gather>
          <Say voice="Polly.Matthew">Understood, sir. Jarvis standing by.</Say>
          <Hangup/>
        </Response>
      `);
    } catch (err) {
      res.set('Content-Type', 'text/xml');
      return res.send(`
        <Response>
          <Say voice="Polly.Matthew">Encountered an error processing command. Please check dashboard.</Say>
          <Hangup/>
        </Response>
      `);
    }
  }
}

module.exports = new VoiceCallGateway();
