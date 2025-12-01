import {
  ApiCollection,
  Questionnaire,
  Question,
  Choice,
  Participation,
  ParticipationAnswer,
  User,
  QuestionnaireFormData,
  QuestionFormData,
  ChoiceFormData,
  ParticipationFormData,
  ParticipationAnswerFormData,
  RegisterData,
  MediaFile,
  MediaUploadResponse,
} from '@/types';

// API Base URL - use the Symfony server directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://127.0.0.1:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Accept': 'application/ld+json',
      ...options.headers,
    };

    // Only set default Content-Type if not already set and we have a body
    if (options.body && !(options.body instanceof FormData)) {
      if (!(options.headers as Record<string, string>)?.['Content-Type']) {
        (headers as Record<string, string>)['Content-Type'] = 'application/ld+json';
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error['hydra:description'] || error.message || `HTTP Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Questionnaires
  async getQuestionnaires(): Promise<ApiCollection<Questionnaire>> {
    return this.request('/api/questionnaires');
  }

  async getQuestionnaire(id: number): Promise<Questionnaire> {
    return this.request(`/api/questionnaires/${id}`);
  }

  async createQuestionnaire(data: QuestionnaireFormData): Promise<Questionnaire> {
    return this.request('/api/questionnaires', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestionnaire(id: number, data: Partial<QuestionnaireFormData>): Promise<Questionnaire> {
    return this.request(`/api/questionnaires/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
    });
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    return this.request(`/api/questionnaires/${id}`, {
      method: 'DELETE',
    });
  }

  // Questions
  async getQuestions(questionnaireId?: number): Promise<ApiCollection<Question>> {
    const params = questionnaireId ? `?questionnaire=${questionnaireId}` : '';
    return this.request(`/api/questions${params}`);
  }

  async getQuestion(id: number): Promise<Question> {
    return this.request(`/api/questions/${id}`);
  }

  async createQuestion(data: QuestionFormData): Promise<Question> {
    return this.request('/api/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(id: number, data: Partial<QuestionFormData>): Promise<Question> {
    return this.request(`/api/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
    });
  }

  async deleteQuestion(id: number): Promise<void> {
    return this.request(`/api/questions/${id}`, {
      method: 'DELETE',
    });
  }

  // Choices
  async getChoices(questionId?: number): Promise<ApiCollection<Choice>> {
    const params = questionId ? `?question=${questionId}` : '';
    return this.request(`/api/choices${params}`);
  }

  async getChoice(id: number): Promise<Choice> {
    return this.request(`/api/choices/${id}`);
  }

  async createChoice(data: ChoiceFormData): Promise<Choice> {
    return this.request('/api/choices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChoice(id: number, data: Partial<ChoiceFormData>): Promise<Choice> {
    return this.request(`/api/choices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
    });
  }

  async deleteChoice(id: number): Promise<void> {
    return this.request(`/api/choices/${id}`, {
      method: 'DELETE',
    });
  }

  // Participations
  async getParticipations(): Promise<ApiCollection<Participation>> {
    return this.request('/api/participations');
  }

  async getParticipation(id: number): Promise<Participation> {
    return this.request(`/api/participations/${id}`);
  }

  async getParticipationByToken(token: string): Promise<ApiCollection<Participation>> {
    return this.request(`/api/participations?token=${token}`);
  }

  async getUserParticipationForQuestionnaire(questionnaireId: number, userId: number): Promise<ApiCollection<Participation>> {
    return this.request(`/api/participations?questionnaire=${questionnaireId}&respondent=${userId}&isCompleted=false`);
  }

  async createParticipation(data: ParticipationFormData): Promise<Participation> {
    return this.request('/api/participations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParticipation(id: number, data: Partial<ParticipationFormData>): Promise<Participation> {
    return this.request(`/api/participations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
    });
  }

  async deleteParticipation(id: number): Promise<void> {
    return this.request(`/api/participations/${id}`, {
      method: 'DELETE',
    });
  }

  // Participation Answers
  async createParticipationAnswer(data: ParticipationAnswerFormData): Promise<ParticipationAnswer> {
    return this.request('/api/participation_answers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getUsers(): Promise<ApiCollection<User>> {
    return this.request('/api/users');
  }

  async getUser(id: number): Promise<User> {
    return this.request(`/api/users/${id}`);
  }

  async register(data: RegisterData): Promise<User> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/me`, {
        credentials: 'include',
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.user || null;
    } catch {
      return null;
    }
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User }> {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Invalid credentials');
    }

    const data = await response.json();
    return { user: data.user };
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  // Media
  async getMedia(): Promise<MediaFile[]> {
    const response = await fetch(`${this.baseUrl}/api/media`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch media');
    }
    return response.json();
  }

  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/media/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const api = new ApiClient(API_BASE_URL);

// Helper to get the IRI from an entity
export function getIri(type: string, id: number): string {
  return `/api/${type}/${id}`;
}

// Helper to extract ID from an IRI
export function getIdFromIri(iri: string): number {
  const parts = iri.split('/');
  return parseInt(parts[parts.length - 1], 10);
}

// Media URL helper - use absolute URL for media files
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'https://127.0.0.1:8000';
export function getMediaUrl(filename: string): string {
  return `${MEDIA_BASE_URL}/media/${filename}`;
}
