import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    startingPortfolio: 100,
    targetCompletions: 50,
    growthPerCompletion: 1,
    progressObject: 'beer' as 'beer' | 'wine' | 'donut' | 'diamond' | 'trophy',
    rules: [] as string[]
  });

  const progressObjects = [
    { value: 'beer', emoji: '🍺', label: 'Beer' },
    { value: 'wine', emoji: '🍷', label: 'Wine' },
    { value: 'donut', emoji: '🍩', label: 'Donut' },
    { value: 'diamond', emoji: '💎', label: 'Diamond' },
    { value: 'trophy', emoji: '🏆', label: 'Trophy' },
  ];

  const steps = [
    {
      title: 'Welcome to LockIn',
      description: 'Your trading discipline companion',
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center">
            <Logo size={96} showText subtitle="Your trading discipline companion" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to LockIn</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Build unbreakable trading discipline with AI-powered rule tracking, gamified progress, 
              and compounding growth visualization.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-blue-900">Rule Enforcement</h3>
              <p className="text-sm text-blue-700">AI checks every trade</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-green-900">Progress Tracking</h3>
              <p className="text-sm text-green-700">Gamified completions</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-purple-900">Growth Projection</h3>
              <p className="text-sm text-purple-700">Compound your success</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Portfolio Settings',
      description: 'Set your starting values and targets',
      content: (
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Portfolio Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.startingPortfolio}
                onChange={(e) => setFormData({ ...formData, startingPortfolio: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">This is your baseline for growth calculations</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Completions
            </label>
            <input
              type="number"
              value={formData.targetCompletions}
              onChange={(e) => setFormData({ ...formData, targetCompletions: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">How many successful rule completions to reach your goal</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Growth Per Completion (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.growthPerCompletion}
              onChange={(e) => setFormData({ ...formData, growthPerCompletion: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">Expected portfolio growth per successful completion</p>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Projection Preview</h4>
            <p className="text-sm text-blue-700">
              Target: <span className="font-bold">
                ${(formData.startingPortfolio * Math.pow(1 + formData.growthPerCompletion / 100, formData.targetCompletions)).toFixed(2)}
              </span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {((Math.pow(1 + formData.growthPerCompletion / 100, formData.targetCompletions) - 1) * 100).toFixed(1)}% total growth
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Choose Your Progress Object',
      description: 'Pick what motivates you most',
      content: (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">What keeps you motivated?</h3>
            <p className="text-gray-600">
              Choose an object that represents your progress. Each successful rule completion removes one from your wall!
            </p>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {progressObjects.map((obj) => (
              <button
                key={obj.value}
                onClick={() => setFormData({ ...formData, progressObject: obj.value as any })}
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  formData.progressObject === obj.value
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                }`}
              >
                <div className="text-4xl mb-3">{obj.emoji}</div>
                <p className="text-sm font-medium text-gray-700">{obj.label}</p>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Your Progress Wall Preview</h4>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: Math.min(formData.targetCompletions, 50) }).map((_, i) => (
                <div key={i} className="text-lg">
                  {progressObjects.find(p => p.value === formData.progressObject)?.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Set Your Trading Rules',
      description: 'Define your discipline framework',
      content: (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Trading Rules</h3>
            <p className="text-gray-600">
              Set the rules that will keep you disciplined. Our AI will check every trade against these.
            </p>
          </div>

          <div className="space-y-4">
            {/* Predefined Rules */}
            {[
              'Never risk more than 2% per trade',
              'Only trade setups with 2:1 RR or better',
              'Maximum 3 trades per day',
              'No revenge trading after losses',
              'Always use stop losses'
            ].map((rule) => (
              <label key={rule} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, rules: [...formData.rules, rule] });
                    } else {
                      setFormData({ ...formData, rules: formData.rules.filter(r => r !== rule) });
                    }
                  }}
                />
                <span className="text-gray-700">{rule}</span>
              </label>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Add custom rule:</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Only trade during market hours"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      setFormData({ ...formData, rules: [...formData.rules, value] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  if (input) {
                    const value = input.value.trim();
                    if (value) {
                      setFormData({ ...formData, rules: [...formData.rules, value] });
                      input.value = '';
                    }
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>

          {formData.rules.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-2">Your Active Rules</h4>
              <ul className="space-y-1">
                {formData.rules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: 'Ready to build unbreakable discipline',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">You're Ready to Start!</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Your LockIn is configured and ready to help you build unbreakable trading discipline.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 max-w-lg mx-auto">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Setup Summary</h3>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Starting Portfolio:</span>
                <span className="font-semibold">${formData.startingPortfolio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Completions:</span>
                <span className="font-semibold">{formData.targetCompletions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth per Completion:</span>
                <span className="font-semibold">{formData.growthPerCompletion}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Progress Object:</span>
                <span className="font-semibold">
                  {progressObjects.find(p => p.value === formData.progressObject)?.emoji}{' '}
                  {progressObjects.find(p => p.value === formData.progressObject)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trading Rules:</span>
                <span className="font-semibold">{formData.rules.length} rules</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save settings and complete onboarding
      localStorage.setItem('onboarding_complete', 'true');
      localStorage.setItem('user_settings', JSON.stringify(formData));
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}