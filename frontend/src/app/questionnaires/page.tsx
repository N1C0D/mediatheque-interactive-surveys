'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Questionnaire } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button, LoadingPage, Alert } from '@/components/ui';
import { getSavedParticipation } from '@/lib/storage';
import styles from './page.module.css';

export default function QuestionnairesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [userParticipations, setUserParticipations] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      
      try {
        // Load questionnaires
        const response = await api.getQuestionnaires();
        const loadedQuestionnaires = response.member || response['hydra:member'] || [];
        setQuestionnaires(loadedQuestionnaires);

        // If authenticated, load user's in-progress participations
        if (isAuthenticated && user?.id) {
          const participationsInProgress = new Set<number>();
          
          for (const q of loadedQuestionnaires) {
            try {
              const result = await api.getUserParticipationForQuestionnaire(q.id, user.id);
              const members = result.member || result['hydra:member'] || [];
              if (members.length > 0) {
                participationsInProgress.add(q.id);
              }
            } catch {
              // Ignore errors for individual questionnaires
            }
          }
          
          setUserParticipations(participationsInProgress);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les questionnaires');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [authLoading, isAuthenticated, user?.id]);

  if (isLoading || authLoading) {
    return <LoadingPage message="Chargement des questionnaires..." />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Questionnaires</h1>
        <p className={styles.subtitle}>
          Découvrez nos questionnaires interactifs et partagez votre avis !
        </p>
      </header>

      {questionnaires.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucun questionnaire disponible pour le moment.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {questionnaires.map((questionnaire) => (
            <QuestionnaireCard 
              key={questionnaire.id} 
              questionnaire={questionnaire}
              isAuthenticated={isAuthenticated}
              hasUserParticipation={userParticipations.has(questionnaire.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuestionnaireCardProps {
  questionnaire: Questionnaire;
  isAuthenticated: boolean;
  hasUserParticipation: boolean;
}

function QuestionnaireCard({ questionnaire, isAuthenticated, hasUserParticipation }: QuestionnaireCardProps) {
  // For authenticated users, check user participations; for anonymous, check sessionStorage
  const savedInStorage = getSavedParticipation(questionnaire.id);
  const hasProgress = isAuthenticated ? hasUserParticipation : !!savedInStorage;

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{questionnaire.title}</CardTitle>
        {questionnaire.description && (
          <CardDescription>{questionnaire.description}</CardDescription>
        )}
      </CardHeader>
      <CardFooter>
        <Link href={`/questionnaires/${questionnaire.id}`} className={styles.link}>
          <Button variant={hasProgress ? 'secondary' : 'primary'}>
            {hasProgress ? 'Reprendre' : 'Commencer'}
          </Button>
        </Link>
        {hasProgress && (
          <span className={styles.progressBadge}>En cours</span>
        )}
      </CardFooter>
    </Card>
  );
}
