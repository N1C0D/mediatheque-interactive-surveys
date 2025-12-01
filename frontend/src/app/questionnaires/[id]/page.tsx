'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { api, getMediaUrl } from '@/lib/api';
import { Questionnaire, Choice } from '@/types';
import { Button, Card, CardContent, CardHeader, CardTitle, Alert, LoadingPage } from '@/components/ui';
import styles from './page.module.css';

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = Number(params.id);
  
  const [mounted, setMounted] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(true);
  const [questionnaireError, setQuestionnaireError] = useState<string | null>(null);

  const {
    participation,
    currentQuestion,
    isLoading,
    isCompleted,
    error,
    startQuestionnaire,
    answerQuestion,
    resetQuestionnaire,
  } = useQuestionnaire({ questionnaireId });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadQuestionnaire() {
      try {
        const data = await api.getQuestionnaire(questionnaireId);
        setQuestionnaire(data);
      } catch (err) {
        setQuestionnaireError(err instanceof Error ? err.message : 'Questionnaire non trouvé');
      } finally {
        setLoadingQuestionnaire(false);
      }
    }

    if (questionnaireId) {
      loadQuestionnaire();
    }
  }, [questionnaireId]);

  // Don't render until mounted on client to avoid hydration issues
  if (!mounted || loadingQuestionnaire) {
    return <LoadingPage message="Chargement du questionnaire..." />;
  }

  if (questionnaireError || !questionnaire) {
    return (
      <div className={styles.container}>
        <Alert variant="error" title="Erreur">
          {questionnaireError || 'Questionnaire non trouvé'}
        </Alert>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => router.push('/questionnaires')}>
            Retour aux questionnaires
          </Button>
        </div>
      </div>
    );
  }

  // Start screen
  if (!participation) {
    return (
      <div className={styles.container}>
        <Card className={styles.startCard}>
          <CardHeader>
            <CardTitle as="h1">{questionnaire.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {questionnaire.description && (
              <p className={styles.description}>{questionnaire.description}</p>
            )}
            
            {error && (
              <Alert variant="error" className={styles.alert}>
                {error}
              </Alert>
            )}

            <div className={styles.startActions}>
              <Button
                size="large"
                onClick={startQuestionnaire}
                isLoading={isLoading}
              >
                Commencer le questionnaire
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/questionnaires')}
              >
                Retour à la liste
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed screen (no current question)
  if (isCompleted && !currentQuestion) {
    return (
      <div className={styles.container}>
        <Card className={styles.completedCard}>
          <CardContent>
            <div className={styles.completedIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h1 className={styles.completedTitle}>Merci !</h1>
            <p className={styles.completedText}>
              Vous avez terminé le questionnaire "{questionnaire.title}".
              Vos réponses ont bien été enregistrées.
            </p>
            <div className={styles.completedActions}>
              <Button onClick={() => router.push('/questionnaires')}>
                Voir d'autres questionnaires
              </Button>
              <Button variant="ghost" onClick={resetQuestionnaire}>
                Recommencer ce questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Terminal question screen (question with no choices = final message)
  if (isCompleted && currentQuestion) {
    return (
      <div className={styles.container}>
        <Card className={styles.completedCard}>
          <CardContent>
            {/* Media for terminal question */}
            {currentQuestion.mediaFilename && (
              <div className={styles.media}>
                {currentQuestion.mediaType === 'video' ? (
                  <video
                    src={getMediaUrl(currentQuestion.mediaFilename)}
                    controls
                    autoPlay
                    muted
                    className={styles.video}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getMediaUrl(currentQuestion.mediaFilename)}
                    alt=""
                    className={styles.image}
                  />
                )}
              </div>
            )}
            
            <div className={styles.completedIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            
            <h1 className={styles.completedTitle}>{currentQuestion.content}</h1>
            
            <div className={styles.completedActions}>
              <Button onClick={() => router.push('/questionnaires')}>
                Voir d'autres questionnaires
              </Button>
              <Button variant="ghost" onClick={resetQuestionnaire}>
                Recommencer ce questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Question screen
  if (currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.questionContainer}>
          <Card className={styles.questionCard}>
            <CardContent>
              {/* Media */}
              {currentQuestion.mediaFilename && (
                <div className={styles.media}>
                  {currentQuestion.mediaType === 'video' ? (
                    <video
                      src={getMediaUrl(currentQuestion.mediaFilename)}
                      controls
                      autoPlay
                      muted
                      className={styles.video}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getMediaUrl(currentQuestion.mediaFilename)}
                      alt=""
                      className={styles.image}
                    />
                  )}
                </div>
              )}

              {/* Question text */}
              <h2 className={styles.questionText}>{currentQuestion.content}</h2>

              {/* Error */}
              {error && (
                <Alert variant="error" className={styles.alert}>
                  {error}
                </Alert>
              )}

              {/* Choices */}
              <div className={styles.choices}>
                {currentQuestion.choices?.map((choice) => (
                  <ChoiceButton
                    key={choice.id}
                    choice={choice}
                    onClick={() => answerQuestion(choice)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className={styles.questionActions}>
            <Button
              variant="ghost"
              onClick={resetQuestionnaire}
              disabled={isLoading}
            >
              Recommencer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingPage />;
}

interface ChoiceButtonProps {
  choice: Choice;
  onClick: () => void;
  disabled: boolean;
}

function ChoiceButton({ choice, onClick, disabled }: ChoiceButtonProps) {
  return (
    <button
      className={styles.choiceButton}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.choiceLabel}>{choice.label}</span>
      <svg
        className={styles.choiceArrow}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
