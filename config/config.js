/**
 * Jarvis Office - Global Agency Configuration
 * KADARTECH Solutions (Altaf Shaikh)
 */

module.exports = {
  // Managing Director & Agency Owner
  user: {
    name: 'Altaf Shaikh',
    role: 'Founder & Managing Director',
    agency: 'KADARTECH Solutions',
    phone: '+91 9359086445',
    normalizedPhone: '919359086445',
    email: 'kadartechsolutions@gmail.com',
    portfolioUrl: 'https://kadartech.vercel.app'
  },

  // Google Gemini Brain Config
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    primaryModel: 'gemini-3-flash-preview',
    fallbackModels: ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash']
  },

  // Server & Deployment Config
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Communication Gateways
  channels: {
    whatsapp: {
      enabled: true,
      authorizedNumber: '919359086445',
      verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'jarvis_secret_token_2026'
    },
    voice: {
      enabled: true,
      authorizedNumber: '919359086445',
      provider: 'twilio_voice'
    },
    telegram: {
      enabled: true,
      botToken: process.env.TELEGRAM_BOT_TOKEN || ''
    }
  },

  // 20 Core Tech Stacks Mastery (Friday)
  techStacks: [
    'React.js',
    'Express.js',
    'Node.js',
    'Python',
    '.NET MVC',
    'C# Selenium',
    'Vue.js',
    'API Building',
    'AI-Driven Coding',
    'Integrations',
    'HTML',
    'CSS',
    'Core PHP',
    'Laravel',
    'WordPress',
    'PostgreSQL',
    'MySQL',
    'SQL Server',
    'TypeScript',
    'jQuery'
  ],

  // Agency Offer Packages
  packages: {
    singleWebsite: {
      price: '$100',
      turnaround: '3 Days',
      description: 'Single high-converting custom website, fully responsive, SEO-ready, includes free AI chatbot'
    },
    starterPack: {
      price: '$250',
      quantity: 3,
      turnaround: '5 Days',
      description: '3 custom responsive business websites + Free AI Autonomous Chatbot + 1 Month Support'
    },
    growthPack: {
      price: '$600',
      quantity: 9,
      unitPrice: '$66/site',
      discount: '60% OFF',
      turnaround: '5 Days',
      description: '9 professional custom websites, dedicated project manager, priority 24/7 delivery, free AI chatbots'
    },
    mobileApp: {
      startingAt: '$120',
      description: 'Cross-platform Android & iOS applications with modern UI/UX'
    },
    saasTool: {
      startingAt: '$800',
      description: 'Custom full-stack web software / micro-SaaS with zero recurring hosting locks'
    }
  },

  // Autonomous 24/7 Learning & Lead Scanning Intervals
  learning: {
    learnIntervalHours: 6,
    leadSearchIntervalHours: 4,
    redditSubreddits: ['forhire', 'freelance_forhire', 'webdev', 'startups', 'smallbusiness']
  }
};
