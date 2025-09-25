import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Shield, CheckCircle, XCircle, Brain, Target, TrendingUp, Activity, Users, DollarSign, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { RULE_TEMPLATES, CATEGORY_COLORS } from '../utils/ruleTemplates';

export default function Rules() {
  const { progress, rules, addRule, editRule, updateRuleMeta, deleteRule, toggleRuleActive, recordViolation, markCompliance } = useUser();
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTags, setEditingTags] = useState('');
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showRestrictionInfo, setShowRestrictionInfo] = useState(false);
  const [newTags, setNewTags] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isPremiumOrChampion = useMemo(() => {
    try {
      const ps = localStorage.getItem('premium_status') || 'none';
      const ach = JSON.parse(localStorage.getItem('user_achievements') || '[]');
      return ps === 'premium' || (Array.isArray(ach) && ach.includes('champion'));
    } catch {
      return false;
    }
  }, []);

  const activeCount = rules.filter(r => r.active).length;
  const totalViolations = rules.reduce((sum, r) => sum + r.violations, 0);

  // Category-based filtering
  const filteredRules = rules.filter(r => {
    const categoryMatch = selectedCategory === 'all' || r.category === selectedCategory;
    const tagMatch = activeFilters.length === 0 || (r.tags || []).some(t => activeFilters.includes(t));
    return categoryMatch && tagMatch;
  });

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; violations: number; active: number }> = {};
    RULE_TEMPLATES.forEach(template => {
      stats[template.category] = { count: 0, violations: 0, active: 0 };
    });

    rules.forEach(rule => {
      if (rule.category && stats[rule.category]) {
        stats[rule.category].count++;
        stats[rule.category].violations += rule.violations;
        if (rule.active) stats[rule.category].active++;
      }
    });

    return stats;
  }, [rules]);

  const getCategoryIcon = (category: string) => {
    const template = RULE_TEMPLATES.find(t => t.category === category);
    return template?.categoryIcon || '📋';
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.psychology;
  };

  const handleAddFromTemplate = (templateRule: { text: string; tags: string[]; description: string }, category: string) => {
    const tags = [...templateRule.tags, category];
    addRule(templateRule.text, tags);
    setShowTemplates(false);
    setSelectedTemplateCategory('');
    addToast('success', 'Rule added from template!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trading Rules</h1>
                <p className="text-gray-600">Organized by category for better discipline management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Templates
              </button>
              <button
                onClick={() => setShowAddRule(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Rule
              </button>
            </div>
          </div>

          {/* Discipline Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-green-600 text-sm mb-1">Discipline Score</p>
              <p className="text-2xl font-bold text-green-700">{progress.disciplineScore}%</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-amber-600 text-sm mb-1">Active Rules</p>
              <p className="text-2xl font-bold text-amber-700">{activeCount}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-red-600 text-sm mb-1">Total Violations</p>
              <p className="text-2xl font-bold text-red-700">{totalViolations}</p>
            </div>
          </div>
        </div>

        {/* Category Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {RULE_TEMPLATES.map((template) => {
              const stats = categoryStats[template.category] || { count: 0, violations: 0, active: 0 };
              const complianceRate = stats.count > 0 ? ((stats.active / stats.count) * 100).toFixed(0) : '0';
              return (
                <div
                  key={template.category}
                  className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                    selectedCategory === template.category
                      ? getCategoryColor(template.category).border + ' ' + getCategoryColor(template.category).bg
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory(template.category)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{template.categoryIcon}</div>
                    <h4 className="font-semibold text-sm mb-1">{template.categoryName}</h4>
                    <div className="text-xs text-gray-600">
                      <div>{stats.count} rules</div>
                      <div>{complianceRate}% active</div>
                      {stats.violations > 0 && (
                        <div className="text-red-600">{stats.violations} violations</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-sm text-gray-700 font-medium mr-2">Filter by Category:</span>

            {/* All Categories Button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              All ({rules.length})
            </button>

            {/* Category Filter Buttons */}
            {RULE_TEMPLATES.map((template) => {
              const stats = categoryStats[template.category] || { count: 0, violations: 0, active: 0 };
              return (
                <button
                  key={template.category}
                  onClick={() => setSelectedCategory(template.category)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    selectedCategory === template.category
                      ? getCategoryColor(template.category).button + ' ' + getCategoryColor(template.category).text + ' border-current'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{template.categoryIcon}</span>
                  {template.categoryName} ({stats.count})
                </button>
              );
            })}
          </div>

          {/* Tag Filters */}
          {Array.from(new Set(rules.flatMap(r => r.tags || []))).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-700 font-medium mr-2">Filter by Tags:</span>
              {Array.from(new Set(rules.flatMap(r => r.tags || []))).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilters(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`px-2 py-1 rounded-full text-xs border ${activeFilters.includes(tag) ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                >
                  {tag}
                </button>
              ))}
              {activeFilters.length > 0 && (
                <button className="ml-2 text-sm text-gray-600 hover:text-gray-900" onClick={() => setActiveFilters([])}>Clear</button>
              )}
            </div>
          )}
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {rules.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-600">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">No rules yet!</p>
              <p className="mb-4">Start building your discipline framework with our categorized rule templates.</p>
              <button
                onClick={() => setShowTemplates(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
              >
                Browse Templates
              </button>
            </div>
          )}

          {filteredRules.length === 0 && rules.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-600">
              <p>No rules match your current filters. Try adjusting your category or tag filters.</p>
            </div>
          )}

          {filteredRules.map((rule) => {
            const categoryColors = getCategoryColor(rule.category || 'psychology');
            return (
              <div key={rule.id} className="bg-white rounded-2xl p-6 shadow-sm border-l-4" style={{ borderLeftColor: categoryColors.icon.replace('text-', '') }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(rule.category || 'psychology')}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{rule.text}</h3>
                      </div>
                      <button
                        onClick={() => {
                          if (!isPremiumOrChampion) {
                            addToast('warning', 'Editing rules requires Premium or Champion.', 'Upgrade', () => navigate('/premium'));
                            return;
                          }
                          toggleRuleActive(rule.id);
                          addToast('success', `Rule marked as ${rule.active ? 'Inactive' : 'Active'}.`);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                          rule.active
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {rule.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <button
                        className="flex items-center gap-1 hover:text-red-600"
                        onClick={() => { recordViolation(rule.id); addToast('warning', 'Violation recorded.'); }}
                        title="Record a violation for this rule"
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>{rule.violations} violations</span>
                      </button>
                      <button
                        className="text-green-700 hover:text-green-800"
                        onClick={() => { markCompliance(rule.id); addToast('success', 'Compliance marked.'); }}
                        title="Mark compliance (reduce violations)"
                      >
                        <span className="inline-flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Mark Compliance</span>
                      </button>
                      {rule.lastViolation && (
                        <div>
                          Last violation: {rule.lastViolation}
                        </div>
                      )}
                    </div>

                    {(rule.tags && rule.tags.length > 0) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {rule.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={() => {
                        if (!isPremiumOrChampion) {
                          setShowRestrictionInfo(true);
                          return;
                        }
                        setEditingId(rule.id);
                        setEditingText(rule.text);
                        setEditingTags((rule.tags || []).join(', '));
                        setShowEditDrawer(true);
                      }}
                      title="Edit rule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      onClick={() => {
                        if (!isPremiumOrChampion) {
                          addToast('warning', 'Deleting rules requires Premium or Champion.', 'Upgrade', () => navigate('/premium'));
                          return;
                        }
                        if (confirm('Delete this rule?')) { deleteRule(rule.id); addToast('success', 'Rule deleted.'); }
                      }}
                      title="Delete rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Violation History */}
                {rule.violations > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Violations</p>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(rule.violations, 10) }).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-red-300 rounded-full"></div>
                      ))}
                      {rule.violations > 10 && (
                        <span className="text-xs text-gray-500 ml-2">+{rule.violations - 10} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced Rule Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RULE_TEMPLATES.map((template) => {
              const stats = categoryStats[template.category] || { count: 0, violations: 0, active: 0 };
              const complianceRate = stats.count > 0 ? ((stats.active / stats.count) * 100).toFixed(0) : '0';
              const avgViolations = stats.count > 0 ? (stats.violations / stats.count).toFixed(1) : '0';

              return (
                <div key={template.category} className={`rounded-xl p-4 ${getCategoryColor(template.category).bg} border ${getCategoryColor(template.category).border}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{template.categoryIcon}</span>
                    <h4 className="font-semibold">{template.categoryName}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rules:</span>
                      <span className="font-medium">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-medium text-green-700">{stats.active} ({complianceRate}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Violations:</span>
                      <span className="font-medium text-red-600">{avgViolations}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Rule Templates by Category</h3>
              <button onClick={() => setShowTemplates(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RULE_TEMPLATES.map((template) => (
                <div key={template.category} className={`rounded-xl p-4 border-2 ${getCategoryColor(template.category).bg} ${getCategoryColor(template.category).border}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{template.categoryIcon}</span>
                    <h4 className="text-lg font-bold">{template.categoryName}</h4>
                  </div>

                  <div className="space-y-3">
                    {template.rules.map((ruleTemplate, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-medium text-gray-900 mb-1">{ruleTemplate.text}</p>
                        <p className="text-sm text-gray-600 mb-2">{ruleTemplate.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1 flex-wrap">
                            {ruleTemplate.tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{tag}</span>
                            ))}
                          </div>
                          <button
                            onClick={() => handleAddFromTemplate(ruleTemplate, template.category)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Add Rule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add New Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Description
                </label>
                <textarea
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Never risk more than 2% per trade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedTemplateCategory}
                  onChange={(e) => setSelectedTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category (optional)</option>
                  {RULE_TEMPLATES.map((template) => (
                    <option key={template.category} value={template.category}>
                      {template.categoryIcon} {template.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Risk, Mindset, Entry, Exit"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddRule(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newRule.trim()) {
                      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
                      addRule(newRule, tags);
                      setNewRule('');
                      setNewTags('');
                      setSelectedTemplateCategory('');
                      setShowAddRule(false);
                      addToast('success', 'Rule added.');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      {showEditDrawer && editingId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditDrawer(false)}></div>
          <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Edit Rule</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowEditDrawer(false)}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Text</label>
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingTags}
                  onChange={(e) => setEditingTags(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const t = editingTags.trim();
                      if (!t || t.endsWith(',') || t.endsWith(', ')) return;
                      setEditingTags(t + ', ');
                    }
                    if (e.key === 'Backspace') {
                      const el = e.target as HTMLInputElement;
                      if (el.selectionStart === 0 && el.selectionEnd === 0 && el.value.trim() === '') {
                        e.preventDefault();
                        const arr = editingTags.split(',').map(s=>s.trim()).filter(Boolean);
                        arr.pop();
                        setEditingTags(arr.length ? arr.join(', ') + ', ' : '');
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Risk, Mindset, Entry, Exit"
                />
                {(() => {
                  const chips = editingTags.split(',').map(t=>t.trim()).filter(Boolean);
                  if (!chips.length) return null;
                  return (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {chips.map((tag, idx) => (
                        <button
                          key={`${tag}-${idx}`}
                          type="button"
                          onClick={() => {
                            const next = chips.filter((_, i) => i !== idx);
                            setEditingTags(next.length ? next.join(', ') + ', ' : '');
                          }}
                          className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          title="Click to remove"
                        >
                          {tag} ×
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button
                className="text-sm text-gray-600 hover:text-gray-900 underline"
                onClick={() => setShowRestrictionInfo(true)}
              >
                Why restricted?
              </button>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setShowEditDrawer(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    updateRuleMeta(editingId, { text: editingText.trim(), tags: editingTags.split(',').map(t=>t.trim()).filter(Boolean) });
                    addToast('success', 'Rule saved.');
                    setShowEditDrawer(false);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Restricted Modal */}
      {showRestrictionInfo && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRestrictionInfo(false)}></div>
          <div className="absolute inset-0 m-auto bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg h-fit">
            <h3 className="text-xl font-bold mb-2">Why is editing restricted?</h3>
            <p className="text-gray-700 mb-4">
              Editing, deleting, and toggling rules are Premium features to protect discipline frameworks and prevent accidental changes.
              Upgrade to unlock:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
              <li>Rule version history and rollback</li>
              <li>Advanced tag analytics and custom dashboards</li>
              <li>Premium avatars and exclusive achievements</li>
              <li>Priority support and early feature access</li>
            </ul>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setShowRestrictionInfo(false)}>Close</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700" onClick={() => { setShowRestrictionInfo(false); navigate('/premium'); }}>Upgrade to Premium</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );