'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, getIdFromIri } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedParticipation, saveParticipation, removeParticipation } from '@/lib/storage';
import { Participation, Question, Choice } from '@/types';

interface UseQuestionnaireOptions {
  questionnaireId: number;
}

interface UseQuestionnaireReturn {
  participation: Participation | null;
  currentQuestion: Question | null;
  isLoading: boolean;
  isCompleted: boolean;
  error: string | null;
  answeredCount: number;
  startQuestionnaire: () => Promise<void>;
  answerQuestion: (choice: Choice) => Promise<void>;
  resetQuestionnaire: () => Promise<void>;
}

export function useQuestionnaire({ questionnaireId }: UseQuestionnaireOptions): UseQuestionnaireReturn {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAnsweredCount, setLocalAnsweredCount] = useState(0);

  // Load existing participation based on authentication status
  const loadParticipation = useCallback(async () => {
    // Wait for auth to be ready
    if (authLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // If user is authenticated, look for their participation via API
      if (isAuthenticated && user?.id) {
        try {
          const result = await api.getUserParticipationForQuestionnaire(questionnaireId, user.id);
          const members = result.member || result['hydra:member'] || [];
          if (members.length > 0) {
            // Found user's existing participation
            const existingParticipation = members[0];
            setParticipation(existingParticipation);
            setCurrentQuestion(existingParticipation.currentQuestion || null);
            setLocalAnsweredCount(existingParticipation.answers?.length || 0);
            setIsLoading(false);
            return;
          }
        } catch {
          // No participation found for this user, continue to show start screen
        }
        
        // No existing participation for authenticated user
        setParticipation(null);
        setCurrentQuestion(null);
        setIsLoading(false);
        return;
      }

      // For anonymous users, check sessionStorage
      const saved = getSavedParticipation(questionnaireId);
      
      if (saved) {
        // Try to resume participation by token
        try {
          const result = await api.getParticipationByToken(saved.token);
          const members = result.member || result['hydra:member'] || [];
          if (members.length > 0) {
            const existingParticipation = members[0];
            setParticipation(existingParticipation);
            setCurrentQuestion(existingParticipation.currentQuestion || null);
            setLocalAnsweredCount(existingParticipation.answers?.length || 0);
            setIsLoading(false);
            return;
          }
        } catch {
          // Token invalid, remove it
          removeParticipation(questionnaireId);
        }
      }

      // No existing participation found
      setParticipation(null);
      setCurrentQuestion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [questionnaireId, isAuthenticated, authLoading, user?.id]);

  useEffect(() => {
    loadParticipation();
  }, [loadParticipation]);

  const startQuestionnaire = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get questionnaire to find start question
      const questionnaire = await api.getQuestionnaire(questionnaireId);
      
      if (!questionnaire.startQuestion) {
        throw new Error('Ce questionnaire n\'a pas de question de départ configurée.');
      }

      // Create new participation
      const newParticipation = await api.createParticipation({
        questionnaire: `/api/questionnaires/${questionnaireId}`,
        currentQuestion: `/api/questions/${questionnaire.startQuestion.id}`,
      });

      // Save to sessionStorage only for anonymous users
      if (!isAuthenticated) {
        saveParticipation(questionnaireId, newParticipation.id, newParticipation.token);
      }

      setParticipation(newParticipation);
      setCurrentQuestion(questionnaire.startQuestion);
      setLocalAnsweredCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de démarrer le questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = async (choice: Choice) => {
    if (!participation || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);

    try {
      // Create answer
      await api.createParticipationAnswer({
        participation: `/api/participations/${participation.id}`,
        question: `/api/questions/${currentQuestion.id}`,
        choice: `/api/choices/${choice.id}`,
      });

      // Increment local answer count
      setLocalAnsweredCount(prev => prev + 1);

      // Determine next question or end
      if (choice.targetQuestion) {
        const nextQuestionId = typeof choice.targetQuestion === 'object' 
          ? choice.targetQuestion.id 
          : getIdFromIri(choice.targetQuestion as string);
        
        // Get full question data
        const nextQuestion = await api.getQuestion(nextQuestionId);

        // Check if next question is a terminal question (no choices = end screen)
        const hasChoices = nextQuestion.choices && nextQuestion.choices.length > 0;

        // Update participation
        const updatedParticipation = await api.updateParticipation(participation.id, {
          currentQuestion: `/api/questions/${nextQuestionId}`,
          isCompleted: !hasChoices, // Mark as completed if terminal question
        });

        setParticipation(updatedParticipation);
        setCurrentQuestion(nextQuestion);
      } else {
        // End of questionnaire (no target question)
        const completedParticipation = await api.updateParticipation(participation.id, {
          isCompleted: true,
        });

        setParticipation(completedParticipation);
        setCurrentQuestion(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'enregistrer la réponse');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const resetQuestionnaire = async () => {
    if (participation) {
      try {
        await api.deleteParticipation(participation.id);
      } catch {
        // Ignore errors when deleting
      }
    }
    
    // Only clear sessionStorage for anonymous users
    if (!isAuthenticated) {
      removeParticipation(questionnaireId);
    }
    
    setParticipation(null);
    setCurrentQuestion(null);
    setError(null);
    setLocalAnsweredCount(0);
  };

  return {
    participation,
    currentQuestion,
    isLoading: isLoading || isSubmitting,
    isCompleted: participation?.isCompleted ?? false,
    error,
    answeredCount: localAnsweredCount,
    startQuestionnaire,
    answerQuestion,
    resetQuestionnaire,
  };
}
