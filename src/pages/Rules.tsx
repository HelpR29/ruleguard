import React, { useState } from 'react';
import { Plus, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Rules() {
  const { progress, rules, addRule, editRule, deleteRule, toggleRuleActive, recordViolation, markCompliance } = useUser();
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const activeCount = rules.filter(r => r.active).length;
  const totalViolations = rules.reduce((sum, r) => sum + r.violations, 0);

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
                <p className="text-gray-600">Manage your discipline framework</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddRule(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </button>
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

        {/* Rules List */}
        <div className="space-y-4">
          {rules.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-600">
              No rules yet. Click "Add Rule" to create your first trading rule.
            </div>
          )}
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {editingId === rule.id ? (
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-lg text-sm w-full max-w-md"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900">{rule.text}</h3>
                    )}
                    <button
                      onClick={() => toggleRuleActive(rule.id)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                        rule.active
                          ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <button
                      className="flex items-center gap-1 hover:text-red-600"
                      onClick={() => recordViolation(rule.id)}
                      title="Record a violation for this rule"
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{rule.violations} violations</span>
                    </button>
                    <button
                      className="text-green-700 hover:text-green-800"
                      onClick={() => markCompliance(rule.id)}
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
                </div>
                
                <div className="flex items-center gap-2">
                  {editingId === rule.id ? (
                    <>
                      <button
                        className="px-3 py-1 text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                        onClick={() => {
                          editRule(rule.id, editingText);
                          setEditingId(null);
                          setEditingText('');
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        onClick={() => { setEditingId(null); setEditingText(''); }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={() => { setEditingId(rule.id); setEditingText(rule.text); }}
                      title="Edit rule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    onClick={() => {
                      if (confirm('Delete this rule?')) deleteRule(rule.id);
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
          ))}
        </div>

        {/* Rule Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rule Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Most Violated Rules</h4>
              <div className="space-y-2">
                {rules
                  .slice()
                  .sort((a, b) => b.violations - a.violations)
                  .slice(0, 3)
                  .map((r) => (
                    <div key={r.id} className="flex justify-between">
                      <span className="text-sm text-gray-600 truncate">{r.text}</span>
                      <span className="text-sm font-medium text-red-600">{r.violations}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Compliance Trend</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span className="text-green-600 font-medium">92%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Week</span>
                  <span className="text-amber-600 font-medium">78%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>This Month</span>
                  <span className="text-green-600 font-medium">{progress.disciplineScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                      addRule(newRule);
                      setNewRule('');
                      setShowAddRule(false);
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
    </div>
  );
}