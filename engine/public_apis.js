/**
 * JARVIS OFFICE - Public APIs & Data Scraping Engine
 * Integrated from public-apis (https://github.com/public-apis/public-apis).
 * Provides Jarvis, Friday, and specialist sub-agents with curated, zero-cost public APIs
 * for data scraping, email verification, domain intelligence, and market research.
 */

const https = require('https');
const http = require('http');

class PublicAPIsEngine {
  constructor() {
    // Curated catalog of high-value public APIs from public-apis repository
    this.directory = {
      // 1. Web Scraping & URL Extraction
      web_scraping: [
        {
          name: 'Microlink API',
          url: 'https://api.microlink.io?url={URL}',
          description: 'Extracts metadata, opengraph tags, screenshots, and page contents for any website URL.',
          auth: 'None',
          cors: 'Yes'
        },
        {
          name: 'Wayback Machine Archive',
          url: 'https://archive.org/wayback/available?url={URL}',
          description: 'Access cached and historical website snapshots to analyze past client websites.',
          auth: 'None',
          cors: 'Yes'
        }
      ],

      // 2. Domain & DNS Intelligence
      domain_intelligence: [
        {
          name: 'RDAP Domain Lookup',
          url: 'https://rdap.org/domain/{DOMAIN}',
          description: 'Fetches authoritative registrar, creation date, and expiration for prospective client domains.',
          auth: 'None',
          cors: 'Yes'
        },
        {
          name: 'HackerTarget DNS Lookup',
          url: 'https://api.hackertarget.com/dnslookup/?q={DOMAIN}',
          description: 'Queries DNS records (A, MX, TXT) to detect hosting providers, WordPress setups, or broken mail servers.',
          auth: 'None',
          cors: 'Yes'
        }
      ],

      // 3. Email & Lead Verification
      lead_verification: [
        {
          name: 'Disvalid Email Checker',
          url: 'https://api.disvalid.com/v1/check?email={EMAIL}',
          description: 'Validates if lead email is disposable, has valid MX records, and can receive proposals.',
          auth: 'None',
          cors: 'Yes'
        }
      ],

      // 4. Financial & Currency Conversions (Pricing Agency Packages)
      currency_and_finance: [
        {
          name: 'Frankfurter Exchange Rates',
          url: 'https://api.frankfurter.app/latest?from=USD&to=INR,EUR,GBP',
          description: 'Real-time currency exchange rates for quoting global clients in USD, INR, EUR, or GBP.',
          auth: 'None',
          cors: 'Yes'
        }
      ],

      // 5. Tech Trend Intelligence
      tech_trends: [
        {
          name: 'HackerNews Algolia API',
          url: 'https://hn.algolia.com/api/v1/search?query={QUERY}&tags=story',
          description: 'Mines tech trends, startup pain points, and software demand in real time.',
          auth: 'None',
          cors: 'Yes'
        },
        {
          name: 'GitHub Repository Search API',
          url: 'https://api.github.com/search/repositories?q={QUERY}&sort=stars&order=desc',
          description: 'Searches trending repositories, boilerplates, and new libraries.',
          auth: 'None',
          cors: 'Yes'
        }
      ]
    };
  }

  /**
   * Returns list of available API categories.
   */
  getCategories() {
    return Object.keys(this.directory);
  }

  /**
   * Returns APIs matching a category or keyword.
   */
  searchAPIs(query) {
    const q = (query || '').toLowerCase();
    const results = [];
    for (const [cat, apis] of Object.entries(this.directory)) {
      for (const api of apis) {
        if (!q || cat.includes(q) || api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q)) {
          results.push({ category: cat, ...api });
        }
      }
    }
    return results;
  }

  /**
   * Helper to execute a GET request to a public API endpoint.
   */
  async executeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { headers: { 'User-Agent': 'JarvisOffice-PublicAPIEngine/1.0' } }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve(body);
            }
          } else {
            resolve({ error: `API status ${res.statusCode}`, response: body.substring(0, 300) });
          }
        });
      });
      req.on('error', err => resolve({ error: err.message }));
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ error: 'Timeout after 10s' });
      });
    });
  }

  /**
   * Scrapes website metadata via Microlink free API.
   */
  async scrapeMetadata(targetUrl) {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`;
    return await this.executeRequest(endpoint);
  }

  /**
   * Fetches latest tech trends on HackerNews for a keyword.
   */
  async getHNTrends(keyword = 'web development') {
    const endpoint = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=story`;
    return await this.executeRequest(endpoint);
  }
}

module.exports = new PublicAPIsEngine();
