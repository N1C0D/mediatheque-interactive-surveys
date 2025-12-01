// Types for the API resources

export interface User {
  id: number;
  email: string;
  roles: string[];
  participations?: Participation[];
}

export interface Questionnaire {
  id: number;
  title: string;
  description?: string;
  startQuestion?: Question;
  questions?: Question[];
  createdAt: string;
}

export interface Question {
  id: number;
  content: string;
  mediaFilename?: string;
  mediaType?: 'image' | 'video';
  choices?: Choice[];
  questionnaire?: Questionnaire | string;
}

export interface Choice {
  id: number;
  label: string;
  question?: Question | string;
  targetQuestion?: Question | null;
}

export interface Participation {
  id: number;
  token: string;
  updatedAt: string;
  isCompleted: boolean;
  currentQuestion?: Question;
  answers?: ParticipationAnswer[];
  questionnaire?: Questionnaire;
  respondent?: User;
}

export interface ParticipationAnswer {
  id: number;
  participation?: Participation | string;
  choice?: Choice;
  question?: Question;
  answeredAt: string;
}

// API response types
export interface ApiCollection<T> {
  member: T[];
  totalItems: number;
  // Legacy hydra format support
  'hydra:member'?: T[];
  'hydra:totalItems'?: number;
  'hydra:view'?: {
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

// Form types for creating/updating resources
export interface QuestionnaireFormData {
  title: string;
  description?: string;
  startQuestion?: string;
}

export interface QuestionFormData {
  content: string;
  questionnaire: string;
  mediaFilename?: string;
  mediaType?: 'image' | 'video';
}

export interface ChoiceFormData {
  label: string;
  question: string;
  targetQuestion?: string | null;
}

export interface ParticipationFormData {
  questionnaire: string;
  currentQuestion?: string;
  isCompleted?: boolean;
}

export interface ParticipationAnswerFormData {
  participation: string;
  question: string;
  choice?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

// Auth context types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

// Media types
export interface MediaFile {
  filename: string;
  type: 'image' | 'video';
  name: string;
  url: string;
}

export interface MediaUploadResponse {
  success: boolean;
  filename: string;
  type: 'image' | 'video';
  name: string;
  url: string;
}
