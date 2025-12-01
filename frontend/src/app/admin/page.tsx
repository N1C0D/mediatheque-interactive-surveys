'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Questionnaire } from '@/types';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardFooter, LoadingPage, Alert, ConfirmModal } from '@/components/ui';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadQuestionnaires = async () => {
    try {
      const response = await api.getQuestionnaires();
      setQuestionnaires(response.member || response['hydra:member'] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les questionnaires');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await api.deleteQuestionnaire(deleteId);
      setQuestionnaires((prev) => prev.filter((q) => q.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le questionnaire');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Chargement du tableau de bord..." />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Administration</h1>
          <p className={styles.subtitle}>Gérez vos questionnaires</p>
        </div>
        <Link href="/admin/questionnaires/new">
          <Button>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau questionnaire
          </Button>
        </Link>
      </header>

      {error && (
        <Alert variant="error" title="Erreur" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{questionnaires.length}</span>
          <span className={styles.statLabel}>Questionnaires</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {questionnaires.reduce((acc, q) => acc + (q.questions?.length || 0), 0)}
          </span>
          <span className={styles.statLabel}>Questions</span>
        </div>
      </div>

      {/* Questionnaires list */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vos questionnaires</h2>

        {questionnaires.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucun questionnaire créé.</p>
            <Link href="/admin/questionnaires/new">
              <Button>Créer votre premier questionnaire</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {questionnaires.map((questionnaire) => (
              <Card key={questionnaire.id} className={styles.card}>
                <CardHeader>
                  <CardTitle>{questionnaire.title}</CardTitle>
                  {questionnaire.description && (
                    <CardDescription>{questionnaire.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <Link href={`/admin/questionnaires/${questionnaire.id}`}>
                    <Button variant="secondary" size="small">
                      Modifier
                    </Button>
                  </Link>
                  <Link href={`/admin/questionnaires/${questionnaire.id}/tree`}>
                    <Button variant="ghost" size="small">
                      Arbre
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => setDeleteId(questionnaire.id)}
                  >
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le questionnaire"
        message="Êtes-vous sûr de vouloir supprimer ce questionnaire ? Cette action est irréversible et supprimera également toutes les questions et réponses associées."
        confirmText="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
