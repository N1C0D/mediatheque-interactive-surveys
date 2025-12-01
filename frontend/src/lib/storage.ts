// Session storage utilities for saving participation tokens
// Using sessionStorage ensures each tab/window has its own isolated participations

const PARTICIPATIONS_KEY = 'questionnaire_participations';

interface SavedParticipation {
  questionnaireId: number;
  participationId: number;
  token: string;
  savedAt: string;
}

export function getSavedParticipations(): SavedParticipation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = sessionStorage.getItem(PARTICIPATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSavedParticipation(questionnaireId: number): SavedParticipation | null {
  const participations = getSavedParticipations();
  return participations.find(p => p.questionnaireId === questionnaireId) || null;
}

export function saveParticipation(questionnaireId: number, participationId: number, token: string): void {
  if (typeof window === 'undefined') return;
  
  const participations = getSavedParticipations();
  
  // Remove existing participation for this questionnaire
  const filtered = participations.filter(p => p.questionnaireId !== questionnaireId);
  
  const newParticipation: SavedParticipation = {
    questionnaireId,
    participationId,
    token,
    savedAt: new Date().toISOString(),
  };
  
  filtered.push(newParticipation);
  sessionStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(filtered));
}

export function removeParticipation(questionnaireId: number): void {
  if (typeof window === 'undefined') return;
  
  const participations = getSavedParticipations();
  const filtered = participations.filter(p => p.questionnaireId !== questionnaireId);
  sessionStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(filtered));
}

export function clearAllParticipations(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PARTICIPATIONS_KEY);
}
