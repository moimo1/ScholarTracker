export type Role = 'scholar' | 'field_manager' | 'finance_officer' | 'director';

export type SubmissionStatus = 'pending' | 'reviewed' | 'approved' | 'processed' | 'rejected';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DocumentSubmission {
  id: string;
  scholarId: string;
  title: string;
  type: 'transcript' | 'enrollment' | 'receipt' | 'other';
  fileUrl: string;
  status: SubmissionStatus;
  submittedAt: string;
  updatedAt: string;
  notes?: string;
}

// Specific view models
export interface ScholarProgress {
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingAction: number;
}
