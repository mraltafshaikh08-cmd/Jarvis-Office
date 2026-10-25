/**
 * Jarvis Office - Google Gemini Brain Client
 * Direct REST API client for Google Gemini models using the provided API key.
 */

const https = require('https');
const config = require('../config/config');

class GeminiClient {
  constructor() {
    this.apiKey = config.gemini.apiKey;
    this.defaultModel = config.gemini.primaryModel || 'gemini-3-flash-preview';
    this.fallbackModels = config.gemini.fallbackModels || [
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-flash-latest'
    ];
  }

  /**
   * Generates text content with system instructions.
   */
  async generateText({ prompt, systemInstruction = '', model = null, temperature = 0.7 }) {
    const selectedModel = model || this.defaultModel;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 4096
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await this._makeRequest(selectedModel, payload);
      const text = this._extractTextFromResponse(response);
      return text;
    } catch (err) {
      console.warn(`[GeminiClient] Primary request failed with model ${selectedModel}: ${err.message}. Trying fallback...`);
      for (const fallback of this.fallbackModels) {
        if (fallback === selectedModel) continue;
        try {
          const response = await this._makeRequest(fallback, payload);
          return this._extractTextFromResponse(response);
        } catch (fbErr) {
          console.warn(`[GeminiClient] Fallback ${fallback} failed: ${fbErr.message}`);
        }
      }
      throw new Error(`[GeminiClient] All Gemini models failed: ${err.message}`);
    }
  }

  /**
   * Generates structured JSON output.
   */
  async generateJSON({ prompt, systemInstruction = '', model = null }) {
    const enhancedInstruction = `${systemInstruction}\nYou MUST return your response strictly as valid, parsable JSON without markdown backticks, without preamble, and without conversational text.`;
    const raw = await this.generateText({
      prompt,
      systemInstruction: enhancedInstruction,
      model,
      temperature: 0.2
    });

    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('[GeminiClient] Failed to parse raw JSON output, attempting extraction:', err.message);
      const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error(`Invalid JSON returned by Gemini: ${raw.substring(0, 200)}...`);
    }
  }

  _makeRequest(model, payload) {
    return new Promise((resolve, reject) => {
      const cleanModel = model.replace('models/', '');
      const path = `/v1beta/models/${cleanModel}:generateContent?key=${this.apiKey}`;
      const postData = JSON.stringify(payload);

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'x-goog-api-key': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed);
            } catch (e) {
              reject(new Error(`Failed to parse JSON response: ${e.message}`));
            }
          } else {
            reject(new Error(`Gemini API error (Status ${res.statusCode}): ${data.substring(0, 300)}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.setTimeout(45000, () => {
        req.destroy(new Error('Gemini API request timed out after 45s'));
      });

      req.write(postData);
      req.end();
    });
  }

  _extractTextFromResponse(response) {
    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error('Gemini returned empty candidates list');
    }
    const candidate = response.candidates[0];
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      return candidate.content.parts.map(p => p.text || '').join('');
    }
    return '';
  }
}

module.exports = new GeminiClient();
