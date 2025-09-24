export type RuleCategory = 'security' | 'validation' | 'performance' | 'compliance' | 'business';
export type RuleStatus = 'active' | 'inactive' | 'draft';
export type RulePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Rule {
  id: string;
  title: string;
  description: string;
  category: RuleCategory;
  status: RuleStatus;
  priority: RulePriority;
  tags: string[];
  conditions: string[];
  actions: string[];
  createdAt: string;
  updatedAt: string;
}