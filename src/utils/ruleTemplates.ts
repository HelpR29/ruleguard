export interface RuleTemplate {
  category: 'psychology' | 'risk' | 'entry-exit' | 'analysis' | 'discipline' | 'money';
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  rules: {
    text: string;
    tags: string[];
    description: string;
  }[];
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    category: 'psychology',
    categoryName: 'Psychology & Emotional',
    categoryColor: 'purple',
    categoryIcon: '🧠',
    rules: [
      {
        text: 'Never engage in revenge trading after a loss',
        tags: ['emotional', 'discipline', 'recovery'],
        description: 'Wait for proper setups instead of forcing trades to recover losses'
      },
      {
        text: 'Avoid FOMO - only trade when your setup criteria are met',
        tags: ['emotional', 'patience', 'setup'],
        description: 'Don\'t chase trades just because others are making money'
      },
      {
        text: 'Accept losses gracefully and move on',
        tags: ['emotional', 'acceptance', 'mindset'],
        description: 'Don\'t let losing trades affect your decision-making'
      },
      {
        text: 'Don\'t overtrade when on a winning streak',
        tags: ['emotional', 'overconfidence', 'discipline'],
        description: 'Stick to your plan even when things are going well'
      },
      {
        text: 'Take breaks after significant wins or losses',
        tags: ['emotional', 'self-care', 'discipline'],
        description: 'Clear your mind to maintain objectivity'
      }
    ]
  },
  {
    category: 'risk',
    categoryName: 'Risk Management',
    categoryColor: 'red',
    categoryIcon: '🛡️',
    rules: [
      {
        text: 'Never risk more than 2% of capital per trade',
        tags: ['risk', 'position-sizing', 'capital-preservation'],
        description: 'Protect your account from significant drawdowns'
      },
      {
        text: 'Always use stop losses on every trade',
        tags: ['risk', 'stops', 'protection'],
        description: 'Define maximum loss before entering any position'
      },
      {
        text: 'Maintain favorable risk-reward ratios (minimum 1:2)',
        tags: ['risk', 'reward', 'profitability'],
        description: 'Ensure potential gains outweigh potential losses'
      },
      {
        text: 'Don\'t add to losing positions',
        tags: ['risk', 'averaging-down', 'discipline'],
        description: 'Avoid the temptation to double down on losers'
      },
      {
        text: 'Limit daily loss to 5% of capital',
        tags: ['risk', 'daily-limit', 'protection'],
        description: 'Stop trading for the day if losses exceed this threshold'
      }
    ]
  },
  {
    category: 'entry-exit',
    categoryName: 'Entry & Exit Strategy',
    categoryColor: 'blue',
    categoryIcon: '🎯',
    rules: [
      {
        text: 'Only enter trades that match your predefined setup',
        tags: ['entry', 'setup', 'consistency'],
        description: 'Have clear criteria for trade entry and stick to them'
      },
      {
        text: 'Exit when your profit target is reached',
        tags: ['exit', 'targets', 'discipline'],
        description: 'Don\'t get greedy - take profits when planned'
      },
      {
        text: 'Exit immediately when stop loss is hit',
        tags: ['exit', 'stops', 'discipline'],
        description: 'Don\'t hope for reversals - follow your plan'
      },
      {
        text: 'Wait for confirmation before entering',
        tags: ['entry', 'confirmation', 'patience'],
        description: 'Multiple signals should align before taking a position'
      },
      {
        text: 'Scale out of positions gradually',
        tags: ['exit', 'scaling', 'profit-taking'],
        description: 'Take partial profits at predetermined levels'
      }
    ]
  },
  {
    category: 'analysis',
    categoryName: 'Market Analysis',
    categoryColor: 'green',
    categoryIcon: '📊',
    rules: [
      {
        text: 'Trade in the direction of the trend',
        tags: ['analysis', 'trend', 'direction'],
        description: 'Identify and follow the overall market direction'
      },
      {
        text: 'Confirm signals across multiple timeframes',
        tags: ['analysis', 'timeframes', 'confirmation'],
        description: 'Check alignment from daily, 4H, 1H, and 15m charts'
      },
      {
        text: 'Volume must confirm price movement',
        tags: ['analysis', 'volume', 'confirmation'],
        description: 'Look for increasing volume on breakouts and trends'
      },
      {
        text: 'Support and resistance levels must be respected',
        tags: ['analysis', 'levels', 'structure'],
        description: 'Wait for clear breaks of key levels with confirmation'
      },
      {
        text: 'Economic news impacts must be considered',
        tags: ['analysis', 'fundamentals', 'events'],
        description: 'Be aware of major economic releases and their potential impact'
      }
    ]
  },
  {
    category: 'discipline',
    categoryName: 'Trading Discipline',
    categoryColor: 'orange',
    categoryIcon: '⚡',
    rules: [
      {
        text: 'Follow your trading plan without exception',
        tags: ['discipline', 'plan', 'consistency'],
        description: 'Your plan is your roadmap - deviations lead to mistakes'
      },
      {
        text: 'Track every trade in your journal',
        tags: ['discipline', 'journaling', 'analysis'],
        description: 'Record all trades with reasoning and lessons learned'
      },
      {
        text: 'Review your performance weekly',
        tags: ['discipline', 'review', 'improvement'],
        description: 'Analyze what worked and what didn\'t each week'
      },
      {
        text: 'Maintain consistent trading hours',
        tags: ['discipline', 'routine', 'consistency'],
        description: 'Trade during your optimal hours and avoid fatigue'
      },
      {
        text: 'No trading when emotionally compromised',
        tags: ['discipline', 'emotional', 'self-awareness'],
        description: 'Skip trading if you\'re stressed, tired, or distracted'
      }
    ]
  },
  {
    category: 'money',
    categoryName: 'Money Management',
    categoryColor: 'gold',
    categoryIcon: '💰',
    rules: [
      {
        text: 'Never risk money you can\'t afford to lose',
        tags: ['money', 'capital', 'preservation'],
        description: 'Only trade with disposable income'
      },
      {
        text: 'Maintain emergency fund separate from trading capital',
        tags: ['money', 'emergency', 'separation'],
        description: 'Keep 6-12 months of expenses in safe, liquid assets'
      },
      {
        text: 'Withdraw profits regularly',
        tags: ['money', 'withdrawals', 'realization'],
        description: 'Take money out of your trading account periodically'
      },
      {
        text: 'Don\'t chase unrealistic returns',
        tags: ['money', 'expectations', 'realism'],
        description: 'Aim for consistent, sustainable growth over time'
      },
      {
        text: 'Diversify across multiple strategies',
        tags: ['money', 'diversification', 'risk'],
        description: 'Don\'t put all your eggs in one basket'
      }
    ]
  }
];

export const CATEGORY_COLORS = {
  psychology: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    icon: 'text-purple-600',
    button: 'bg-purple-100 hover:bg-purple-200'
  },
  risk: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    button: 'bg-red-100 hover:bg-red-200'
  },
  'entry-exit': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    button: 'bg-blue-100 hover:bg-blue-200'
  },
  analysis: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    button: 'bg-green-100 hover:bg-green-200'
  },
  discipline: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: 'text-orange-600',
    button: 'bg-orange-100 hover:bg-orange-200'
  },
  money: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    button: 'bg-yellow-100 hover:bg-yellow-200'
  }
} as const;
