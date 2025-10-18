// ========================================
// PORTFOLIO STATISTICS CONFIGURATION
// ========================================
// Edit these values to customize your portfolio statistics

const PORTFOLIO_CONFIG = {
  // Set to true to use custom values, false to use GitHub data
  useCustomValues: false,
  
  // Custom values (only used if useCustomValues is true)
  yearsExperience: 5,        // Your years of experience
  totalProjects: 50,        // Total projects completed
  aiProjects: 15,           // Number of AI projects
  clientSatisfaction: 100,  // Client satisfaction percentage
  
  // AI project keywords for automatic detection from GitHub
  aiKeywords: [
    'ai', 'ml', 'machine-learning', 'tensorflow', 'pytorch', 
    'neural', 'deep-learning', 'computer-vision', 'nlp', 
    'jarvis', 'intelligence', 'opencv', 'scikit-learn',
    'artificial', 'automation', 'chatbot', 'recommendation'
  ],
  
  // GitHub username
  githubUsername: 'Arsh227',
  
  // CRM System URL
  crmUrl: 'https://app.houseofsaintnoir.com'
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PORTFOLIO_CONFIG;
}
