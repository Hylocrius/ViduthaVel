// Internationalization support for Hindi and English

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Common
    'app.title': 'ViduthaVel - AI Market Price Planner',
    'app.subtitle': 'Maximize Your Harvest Returns',
    'app.description': 'Our multi-agent AI analyzes market prices, transport costs, and storage losses to recommend the optimal time and place to sell your crops.',
    
    // Form
    'form.cropType': 'Crop Type',
    'form.quantity': 'Quantity (Quintals)',
    'form.location': 'Farm Location',
    'form.storage': 'Storage Condition',
    'form.analyze': 'Analyze Markets & Get Recommendation',
    'form.analyzing': 'Analyzing...',
    
    // Results
    'results.recommendation': 'Recommendation',
    'results.comparison': 'Net Revenue Comparison',
    'results.sensitivity': 'Sensitivity Analysis',
    'results.logistics': 'Logistics Checklist',
    'results.risks': 'Risk Analysis',
    'results.trace': 'Agent Reasoning Trace',
    
    // Markets
    'market.sellNow': 'Sell Now',
    'market.sellIn7Days': 'Sell in 7 Days',
    'market.grossRevenue': 'Gross Revenue',
    'market.transport': 'Transport',
    'market.storageCost': 'Storage Cost',
    'market.lossValue': 'Loss Value',
    'market.netRevenue': 'Net Revenue',
    'market.margin': 'Margin',
    
    // Disclaimer
    'disclaimer.title': 'Important Disclaimer',
    'disclaimer.text': 'This tool provides estimates based on simulated data. Actual results may vary due to market fluctuations, weather, and local conditions.',
    'disclaimer.verify': 'Verify prices at Agmarknet',
    'disclaimer.sources': 'Data Sources: FAO Post-Harvest Guidelines, ICAR Research Publications',
    
    // Stats
    'stats.cropsTracked': 'Crops Tracked',
    'stats.marketsAnalyzed': 'Markets Analyzed',
    'stats.transportOptions': 'Transport Options',
    'stats.factorsConsidered': 'Factors Considered',
  },
  hi: {
    // Common
    'app.title': 'विदुथा वेल - AI बाजार मूल्य योजनाकार',
    'app.subtitle': 'अपनी फसल की आय को अधिकतम करें',
    'app.description': 'हमारा मल्टी-एजेंट AI बाजार मूल्य, परिवहन लागत और भंडारण हानि का विश्लेषण करके आपकी फसल बेचने के लिए इष्टतम समय और स्थान की सिफारिश करता है।',
    
    // Form
    'form.cropType': 'फसल प्रकार',
    'form.quantity': 'मात्रा (क्विंटल)',
    'form.location': 'खेत का स्थान',
    'form.storage': 'भंडारण स्थिति',
    'form.analyze': 'बाजारों का विश्लेषण करें और सिफारिश प्राप्त करें',
    'form.analyzing': 'विश्लेषण कर रहे हैं...',
    
    // Results
    'results.recommendation': 'सिफारिश',
    'results.comparison': 'शुद्ध राजस्व तुलना',
    'results.sensitivity': 'संवेदनशीलता विश्लेषण',
    'results.logistics': 'रसद चेकलिस्ट',
    'results.risks': 'जोखिम विश्लेषण',
    'results.trace': 'एजेंट तर्क ट्रेस',
    
    // Markets
    'market.sellNow': 'अभी बेचें',
    'market.sellIn7Days': '7 दिनों में बेचें',
    'market.grossRevenue': 'सकल राजस्व',
    'market.transport': 'परिवहन',
    'market.storageCost': 'भंडारण लागत',
    'market.lossValue': 'हानि मूल्य',
    'market.netRevenue': 'शुद्ध राजस्व',
    'market.margin': 'मार्जिन',
    
    // Disclaimer
    'disclaimer.title': 'महत्वपूर्ण अस्वीकरण',
    'disclaimer.text': 'यह उपकरण सिम्युलेटेड डेटा के आधार पर अनुमान प्रदान करता है। बाजार में उतार-चढ़ाव, मौसम और स्थानीय स्थितियों के कारण वास्तविक परिणाम भिन्न हो सकते हैं।',
    'disclaimer.verify': 'Agmarknet पर मूल्य सत्यापित करें',
    'disclaimer.sources': 'डेटा स्रोत: FAO पोस्ट-हार्वेस्ट दिशानिर्देश, ICAR अनुसंधान प्रकाशन',
    
    // Stats
    'stats.cropsTracked': 'ट्रैक की गई फसलें',
    'stats.marketsAnalyzed': 'विश्लेषित बाजार',
    'stats.transportOptions': 'परिवहन विकल्प',
    'stats.factorsConsidered': 'विचारित कारक',
  },
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
  }
}

export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'hi')) {
      return saved;
    }
  }
  return currentLanguage;
}

export function t(key: string): string {
  const lang = getLanguage();
  return translations[lang][key as keyof typeof translations.en] || key;
}

// Initialize language on load
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('language') as Language;
  if (savedLang) {
    setLanguage(savedLang);
  }
}

