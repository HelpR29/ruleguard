import { useState } from 'react';
import { Star, Check, Zap, Crown, TrendingUp, Shield, Users, BarChart3, Calendar, Download } from 'lucide-react';

export default function Premium() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into your trading patterns and psychology',
      free: false,
      premium: true
    },
    {
      icon: Users,
      title: 'Private Groups',
      description: 'Create and join exclusive trading communities',
      free: false,
      premium: true
    },
    {
      icon: Crown,
      title: 'Custom Challenges',
      description: 'Design personalized discipline challenges',
      free: false,
      premium: true
    },
    {
      icon: TrendingUp,
      title: 'AI Trading Coach',
      description: 'Personalized recommendations and insights',
      free: false,
      premium: true
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 premium customer support',
      free: false,
      premium: true
    },
    {
      icon: Calendar,
      title: 'Unlimited Rules',
      description: 'Create unlimited trading rules and conditions',
      free: '5 rules',
      premium: true
    },
    {
      icon: Download,
      title: 'Export Data',
      description: 'Export all your data and reports',
      free: false,
      premium: true
    },
    {
      icon: Zap,
      title: 'Real-time Notifications',
      description: 'Instant alerts for rule violations and achievements',
      free: 'Basic',
      premium: 'Advanced'
    }
  ];

  const plans = {
    monthly: {
      price: 29,
      period: 'month',
      savings: null
    },
    yearly: {
      price: 290,
      period: 'year',
      savings: 'Save $58'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Upgrade to LockIn Pro</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock advanced features, detailed analytics, and exclusive tools to master your trading discipline
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-purple-200 dark:border-purple-700">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">LockIn Pro</h3>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-purple-600">${plans[selectedPlan].price}</span>
                <span className="text-gray-600">/{plans[selectedPlan].period}</span>
              </div>
              {plans[selectedPlan].savings && (
                <p className="text-green-600 font-medium mt-2">{plans[selectedPlan].savings}</p>
              )}
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-colors mb-6">
              Start Free 7-Day Trial
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">7-day free trial</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">All premium features included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">What's Included</h3>
          </div>
          
          <div className="p-6">
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Free:</span>
                        {feature.free ? (
                          typeof feature.free === 'string' ? (
                            <span className="text-xs text-gray-600">{feature.free}</span>
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )
                        ) : (
                          <span className="text-xs text-gray-400">Not included</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Pro:</span>
                        {feature.premium ? (
                          typeof feature.premium === 'string' ? (
                            <span className="text-xs text-purple-600 font-medium">{feature.premium}</span>
                          ) : (
                            <Check className="h-4 w-4 text-purple-600" />
                          )
                        ) : (
                          <span className="text-xs text-gray-400">Not included</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">What Pro Users Say</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">👨‍💼</span>
                </div>
                <div>
                  <p className="font-semibold">Alex Chen</p>
                  <p className="text-sm text-gray-600">Day Trader</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "LockIn Pro transformed my trading. The AI insights helped me identify my emotional patterns and improve my discipline by 40%."
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">👩‍💼</span>
                </div>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Swing Trader</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The private groups feature is amazing. Having accountability partners with similar goals has been game-changing for my consistency."
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What happens to my data if I cancel?</h4>
              <p className="text-gray-600">Your data remains safe and accessible. You'll revert to the free plan with basic features, but all your historical data is preserved.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes! We offer a 7-day free trial with full access to all Pro features. No credit card required to start.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}