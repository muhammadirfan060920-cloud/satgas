export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FinancialData {
  income: number;
  expenses: number;
  debts: number;
  gamblingLosses: number;
  savings: number;
}

export interface PinjolEntity {
  name: string;
  status: 'legal' | 'ilegal';
  source: string;
}

export interface AgentAction {
  id: string;
  type: 'alert' | 'plan' | 'resource' | 'counseling' | 'external';
  title: string;
  description: string;
  status: 'pending' | 'completed';
  timestamp: Date;
  actionUrl?: string;
  autonomousDraft?: string;
}

export interface Milestone {
  id: string;
  title: string;
  isUnlocked: boolean;
  reward: string;
}

export interface UserState {
  financialHealthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  anonymousId: string;
  daysClean: number;
  milestones: Milestone[];
  isCrisisMode: boolean;
  sentinelSettings: {
    threshold: number;
    alertDestinations: {
      whatsapp: boolean;
      email: boolean;
      emergency: boolean;
    };
    emergencyContact: string;
  };
}
