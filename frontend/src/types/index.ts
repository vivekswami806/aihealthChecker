export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export interface MedicalReport {
  id: string;
  name: string;
  date: string;
  type: string;
  status: 'Pending' | 'Complete' | 'Failed' | 'Analyzed';
  patientId: string;
  fileUrl: string;
  aiSummary?: string;
  markers?: HealthMarker[];
}

export interface HealthMarker {
  name: string;
  value: number | string;
  unit: string;
  status: 'Normal' | 'Warning' | 'Critical';
  previousValue?: number | string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
