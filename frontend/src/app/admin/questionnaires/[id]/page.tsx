'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getIri } from '@/lib/api';
import { Questionnaire, Question } from '@/types';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent, CardFooter, Alert, LoadingPage, ConfirmModal } from '@/components/ui';
import styles from './page.module.css';

export default function EditQuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = Number(params.id);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startQuestion: '',
  });

  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [questionnaireData, questionsData] = await Promise.all([
        api.getQuestionnaire(questionnaireId),
        api.getQuestions(questionnaireId),
      ]);

      setQuestionnaire(questionnaireData);
      setQuestions(questionsData.member || questionsData['hydra:member'] || []);
      setFormData({
        title: questionnaireData.title,
        description: questionnaireData.description || '',
        startQuestion: questionnaireData.startQuestion
          ? getIri('questions', questionnaireData.startQuestion.id)
          : '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le questionnaire');
    } finally {
      setIsLoading(false);
    }
  }, [questionnaireId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updateQuestionnaire(questionnaireId, {
        title: formData.title,
        description: formData.description || undefined,
        startQuestion: formData.startQuestion || undefined,
      });
      setSuccess('Questionnaire mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de sauvegarder');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionId) return;

    setIsDeletingQuestion(true);
    try {
      await api.deleteQuestion(deleteQuestionId);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteQuestionId));
      setDeleteQuestionId(null);
      
      // Reset start question if it was deleted
      if (formData.startQuestion === getIri('questions', deleteQuestionId)) {
        setFormData((prev) => ({ ...prev, startQuestion: '' }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer la question');
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Chargement du questionnaire..." />;
  }

  if (!questionnaire) {
    return (
      <div className={styles.container}>
        <Alert variant="error">Questionnaire non trouvé</Alert>
        <Button onClick={() => router.push('/admin')}>Retour</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/admin">Administration</Link>
        <span>/</span>
        <span>{questionnaire.title}</span>
      </nav>

      {/* Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)} className={styles.alert}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} className={styles.alert}>
          {success}
        </Alert>
      )}

      {/* Questionnaire form */}
      <Card className={styles.mainCard}>
        <CardHeader>
          <CardTitle>Paramètres du questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className={styles.form}>
            <Input
              label="Titre"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Select
              label="Question de départ"
              name="startQuestion"
              value={formData.startQuestion}
              onChange={(e) => setFormData({ ...formData, startQuestion: e.target.value })}
              options={questions.map((q) => ({
                value: getIri('questions', q.id),
                label: q.content.substring(0, 60) + (q.content.length > 60 ? '...' : ''),
              }))}
              placeholder="Sélectionnez la première question"
              helperText="La question par laquelle commencera le questionnaire"
            />

            <div className={styles.formActions}>
              <Button type="submit" isLoading={isSaving}>
                Enregistrer
              </Button>
              <Link href={`/admin/questionnaires/${questionnaireId}/tree`}>
                <Button type="button" variant="secondary">
                  Voir l'arbre
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Questions section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Questions ({questions.length})</h2>
          <Link href={`/admin/questionnaires/${questionnaireId}/questions/new`}>
            <Button>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Ajouter une question
            </Button>
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className={styles.emptyQuestions}>
            <p>Aucune question pour le moment.</p>
            <p>Commencez par créer votre première question.</p>
          </div>
        ) : (
          <div className={styles.questionsList}>
            {questions.map((question, index) => (
              <Card key={question.id} className={styles.questionCard}>
                <CardHeader>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>#{index + 1}</span>
                    <CardTitle as="h3" className={styles.questionTitle}>
                      {question.content}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={styles.questionMeta}>
                    {question.mediaFilename && (
                      <span className={styles.badge}>
                        {question.mediaType === 'video' ? '🎬 Vidéo' : '🖼️ Image'}
                      </span>
                    )}
                    <span className={styles.badge}>
                      {question.choices?.length || 0} choix
                    </span>
                    {formData.startQuestion === getIri('questions', question.id) && (
                      <span className={styles.startBadge}>Question de départ</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/admin/questionnaires/${questionnaireId}/questions/${question.id}`}>
                    <Button variant="secondary" size="small">
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => setDeleteQuestionId(question.id)}
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
        isOpen={deleteQuestionId !== null}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={handleDeleteQuestion}
        title="Supprimer la question"
        message="Êtes-vous sûr de vouloir supprimer cette question ? Tous les choix associés seront également supprimés."
        confirmText="Supprimer"
        variant="danger"
        isLoading={isDeletingQuestion}
      />
    </div>
  );
}
