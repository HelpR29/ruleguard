import { useState, useRef, useEffect, startTransition } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';
import Logo from '../components/Logo';
import { RULE_TEMPLATES, CATEGORY_COLORS } from '../utils/ruleTemplates';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
  const [openPacks, setOpenPacks] = useState<string[]>([]);
  const packsRef = useRef<HTMLDivElement | null>(null);
  const lastToastRef = useRef<{ key: string; time: number } | null>(null);
  const { profile } = useAuth();
  const { addToast } = useToast();

  // Close pack popover when clicking outside the packs container
  useEffect(() => {
    if (!openPacks.length) return;
    const handler = (e: MouseEvent) => {
      const el = packsRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpenPacks([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPacks]);

  const progressObjects = [
    { value: 'beer', emoji: '🍺', label: 'Beer' },
    { value: 'wine', emoji: '🍷', label: 'Wine' },
    { value: 'donut', emoji: '🍩', label: 'Donut' },
    { value: 'diamond', emoji: '💎', label: 'Diamond' },
    { value: 'trophy', emoji: '🏆', label: 'Trophy' },
  ];

  // Helper to toggle a rule text into formData.rules
  const toggleRule = (text: string, checked: boolean) => {
    setFormData(prev => {
      const exists = prev.rules.includes(text);
      if (checked && !exists) return { ...prev, rules: [...prev.rules, text] };
      if (!checked && exists) return { ...prev, rules: prev.rules.filter(r => r !== text) };
      return prev;
    });
  };

  const steps = [
    {
      title: 'Welcome to LockIn',
      description: 'Your trading discipline companion',
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center">
            <Logo showText subtitle="Your trading discipline companion" frame="card" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to LockIn</h2>
            <p className="text-gray-700 text-lg max-w-md mx-auto">
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
          <div>
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem('force_name_prompt', '1'); } catch {}
                window.dispatchEvent(new Event('rg:force-name-prompt'));
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Change display name
            </button>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">$</span>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">What keeps you motivated?</h3>
            <p className="text-gray-700">
              Choose an object that represents your progress. Each successful rule completion removes one from your wall!
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
            {progressObjects.map((obj) => (
              <button
                key={obj.value}
                onClick={() => setFormData({ ...formData, progressObject: obj.value as any })}
                className={`p-4 sm:p-6 rounded-2xl border-2 transition-colors ${
                  formData.progressObject === obj.value
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                }`}
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{obj.emoji}</div>
                <p className="text-xs sm:text-sm font-medium text-gray-700">{obj.label}</p>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Your Progress Wall Preview</h4>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
              {Array.from({ length: Math.min(formData.targetCompletions, 40) }).map((_, i) => (
                <div key={i} className="text-sm sm:text-lg">
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Trading Rules</h3>
            <p className="text-gray-700">
              Choose from template categories below. You can also add custom rules.
            </p>
          </div>

          {/* Recommended Packs */}
          {(() => {
            const pack = (name: string, rules: string[], desc: string) => ({ name, rules, desc });
            const riskBasics = pack(
              'Risk Basics',
              [
                'Never risk more than 2% of capital per trade',
                'Always use stop losses on every trade',
                'Maintain favorable risk-reward ratios (minimum 1:2)',
                "Don't add to losing positions",
                'Limit daily loss to 5% of capital',
              ],
              'Foundational risk management to protect capital.'
            );
            const psychologyEssentials = pack(
              'Psychology Essentials',
              [
                'Never engage in revenge trading after a loss',
                'Avoid FOMO - only trade when your setup criteria are met',
                'Accept losses gracefully and move on',
                "Don't overtrade when on a winning streak",
                'Take breaks after significant wins or losses',
              ],
              'Mindset rules to reduce emotional mistakes.'
            );
            const entryExitCore = pack(
              'Entry & Exit Core',
              [
                'Only enter trades that match your predefined setup',
                'Exit when your profit target is reached',
                'Exit immediately when stop loss is hit',
                'Wait for confirmation before entering',
                'Scale out of positions gradually',
              ],
              'Clarity for getting in and out consistently.'
            );
            const packs = [riskBasics, psychologyEssentials, entryExitCore];
            return (
              <div ref={packsRef} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Recommended Packs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {packs.map(p => (
                    <div key={p.name} className="relative rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{p.name}</span>
                        <span className="text-[10px] text-gray-500">{p.rules.length} rules</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{p.desc}</p>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => {
                            setFormData(prev => {
                              const s = new Set(prev.rules);
                              let added = 0;
                              p.rules.forEach(r => { if (!s.has(r)) { s.add(r); added++; } });

                              // Scroll to relevant section immediately
                              const sectionMap: Record<string, string> = {
                                'Risk Basics': 'risk',
                                'Psychology Essentials': 'psychology',
                                'Entry & Exit Core': 'entry-exit',
                              };
                              const target = document.getElementById(`section-${sectionMap[p.name]}`);
                              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                              // Throttle duplicate toasts in React Strict Mode
                              const key = `apply-${p.name}-${added}`;
                              const now = Date.now();
                              const last = lastToastRef.current;
                              if (!last || last.key !== key || now - last.time > 1000) {
                                if (added > 0) addToast('success', `Added ${added} rule${added>1?'s':''} from ${p.name}`);
                                else addToast('info', `${p.name} already applied`);
                                lastToastRef.current = { key, time: now };
                              }

                              return { ...prev, rules: Array.from(s) };
                            });
                          }}
                        >Apply</button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                          onClick={() => setFormData(prev => ({ ...prev, rules: prev.rules.filter(r => !p.rules.includes(r)) }))}
                        >Clear</button>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
                          onClick={() => setOpenPacks(prev => prev.includes(p.name) ? prev.filter(n => n !== p.name) : [...prev, p.name])}
                          aria-expanded={openPacks.includes(p.name)}
                          aria-controls={`pack-popover-${p.name}`}
                        >
                          View
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${openPacks.includes(p.name) ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Popover toggled by View button */}
                      {openPacks.includes(p.name) && (
                        <div id={`pack-popover-${p.name}`} className="absolute left-0 right-0 top-full mt-2 z-50">
                          <div className="rounded-lg border border-gray-200 bg-white shadow-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold text-gray-800">Included rules</p>
                              <button
                                type="button"
                                className="text-[11px] text-gray-500 hover:text-gray-800"
                                onClick={() => setOpenPacks(prev => prev.filter(n => n !== p.name))}
                              >Close</button>
                            </div>
                            <ul className="space-y-1">
                              {p.rules.map(rule => (
                                <li key={rule} className="text-[11px] text-gray-700 flex items-start gap-2">
                                  <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                  <span>{rule}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Templates grouped by category */}
          <div className="space-y-5">
            {RULE_TEMPLATES.map((tpl) => (
              <div key={tpl.category} id={`section-${tpl.category}`} className={`rounded-xl border ${CATEGORY_COLORS[tpl.category].border} ${CATEGORY_COLORS[tpl.category].bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tpl.categoryIcon}</span>
                    <h4 className="font-semibold">{tpl.categoryName}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white"
                      onClick={() => {
                        // select all in category
                        setFormData(prev => {
                          const adds = tpl.rules.map(r => r.text).filter(t => !prev.rules.includes(t));
                          return { ...prev, rules: [...prev.rules, ...adds] };
                        });
                      }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white"
                      onClick={() => {
                        // clear all in category
                        setFormData(prev => ({ ...prev, rules: prev.rules.filter(t => !tpl.rules.some(r => r.text === t)) }));
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {tpl.rules.map(rule => (
                    <label key={rule.text} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={formData.rules.includes(rule.text)}
                        onChange={(e) => toggleRule(rule.text, e.target.checked)}
                      />
                      <div>
                        <span className="text-gray-800 text-sm font-medium">{rule.text}</span>
                        <p className="text-xs text-gray-600">{rule.description}</p>
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {rule.tags.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/70 text-gray-700 border border-gray-200">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom rule add */}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You're Ready to Start!</h2>
            <p className="text-gray-700 text-lg max-w-md mx-auto">
              Your LockIn is configured and ready to help you build unbreakable trading discipline.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 max-w-lg mx-auto">
            <h3 className="font-bold text-gray-900 mb-4">Your Setup Summary</h3>
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
      // Defer route tree switch to avoid suspending during click
      startTransition(() => {
        onComplete();
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // When on the first step, if user hasn't set a display name yet, re-open the prompt
      if (!profile?.display_name) {
        try { localStorage.setItem('force_name_prompt', '1'); } catch {}
        window.dispatchEvent(new Event('rg:force-name-prompt'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-6 sm:p-8">
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
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-colors text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (<div />)}

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