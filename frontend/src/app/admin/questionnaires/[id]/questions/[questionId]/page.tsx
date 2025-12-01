'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getIri, getIdFromIri } from '@/lib/api';
import { Questionnaire, Question, Choice } from '@/types';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent, Alert, LoadingPage, MediaSelector } from '@/components/ui';
import styles from './page.module.css';

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = Number(params.id);
  const questionId = Number(params.questionId);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [choices, setChoices] = useState<(Choice & { isNew?: boolean; isDeleted?: boolean })[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    content: '',
    mediaFilename: '',
    mediaType: '' as '' | 'image' | 'video',
  });

  const [isDeletingChoice, setIsDeletingChoice] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [questionnaireData, questionData, questionsData, choicesData] = await Promise.all([
        api.getQuestionnaire(questionnaireId),
        api.getQuestion(questionId),
        api.getQuestions(questionnaireId),
        api.getChoices(questionId),
      ]);

      setQuestionnaire(questionnaireData);
      setQuestion(questionData);
      const questions = questionsData.member || questionsData['hydra:member'] || [];
      setAllQuestions(questions.filter((q) => q.id !== questionId));
      const choices = choicesData.member || choicesData['hydra:member'] || [];
      setChoices(choices);
      setFormData({
        content: questionData.content,
        mediaFilename: questionData.mediaFilename || '',
        mediaType: questionData.mediaType || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  }, [questionnaireId, questionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addChoice = () => {
    setChoices([
      ...choices,
      {
        id: Date.now(), // Temporary ID
        label: '',
        targetQuestion: null,
        isNew: true,
      },
    ]);
  };

  const updateChoice = (id: number, field: 'label' | 'targetQuestion', value: string) => {
    setChoices(
      choices.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            [field]: field === 'targetQuestion' ? (value ? { id: getIdFromIri(value) } : null) : value,
          };
        }
        return c;
      })
    );
  };

  const handleDeleteChoice = async (choiceId: number) => {
    const choice = choices.find((c) => c.id === choiceId);
    if (!choice) return;

    if (choice.isNew) {
      setChoices(choices.filter((c) => c.id !== choiceId));
      return;
    }

    setIsDeletingChoice(true);
    try {
      await api.deleteChoice(choiceId);
      setChoices(choices.filter((c) => c.id !== choiceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le choix');
    } finally {
      setIsDeletingChoice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update the question
      await api.updateQuestion(questionId, {
        content: formData.content,
        mediaFilename: formData.mediaFilename || undefined,
        mediaType: formData.mediaType || undefined,
      });

      // Handle choices
      for (const choice of choices) {
        if (choice.isNew && choice.label.trim()) {
          await api.createChoice({
            label: choice.label,
            question: getIri('questions', questionId),
            targetQuestion: choice.targetQuestion ? getIri('questions', choice.targetQuestion.id) : null,
          });
        } else if (!choice.isNew && choice.label.trim()) {
          await api.updateChoice(choice.id, {
            label: choice.label,
            targetQuestion: choice.targetQuestion ? getIri('questions', choice.targetQuestion.id) : null,
          });
        }
      }

      setSuccess('Question mise à jour avec succès');
      loadData(); // Reload to get fresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de sauvegarder');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Chargement de la question..." />;
  }

  if (!questionnaire || !question) {
    return (
      <div className={styles.container}>
        <Alert variant="error">Question non trouvée</Alert>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/admin">Administration</Link>
        <span>/</span>
        <Link href={`/admin/questionnaires/${questionnaireId}`}>{questionnaire.title}</Link>
        <span>/</span>
        <span>Modifier la question</span>
      </nav>

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

      <Card>
        <CardHeader>
          <CardTitle>Modifier la question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Textarea
              label="Texte de la question"
              name="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={3}
            />

            <div className={styles.mediaSection}>
              <MediaSelector
                label="Média (optionnel)"
                value={{ filename: formData.mediaFilename, type: formData.mediaType }}
                onChange={({ filename, type }) => setFormData({ 
                  ...formData, 
                  mediaFilename: filename, 
                  mediaType: type as '' | 'image' | 'video' 
                })}
              />
            </div>

            <div className={styles.choicesSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.subsectionTitle}>Choix de réponse ({choices.length})</h3>
                <Button type="button" variant="secondary" size="small" onClick={addChoice}>
                  + Ajouter un choix
                </Button>
              </div>

              {choices.length === 0 ? (
                <div className={styles.emptyChoicesInfo}>
                  <p className={styles.emptyChoices}>
                    Aucun choix = Question terminale (fin du questionnaire)
                  </p>
                  <p className={styles.helpText}>
                    Cette question sera affichée comme message de fin. Ajoutez des choix pour en faire une question interactive.
                  </p>
                </div>
              ) : (
                choices.map((choice, index) => (
                  <div key={choice.id} className={styles.choiceRow}>
                    <Input
                      label={`Choix ${index + 1}`}
                      value={choice.label}
                      onChange={(e) => updateChoice(choice.id, 'label', e.target.value)}
                      placeholder="Libellé du choix"
                    />
                    <Select
                      label="Question suivante"
                      value={choice.targetQuestion ? getIri('questions', choice.targetQuestion.id) : ''}
                      onChange={(e) => updateChoice(choice.id, 'targetQuestion', e.target.value)}
                      options={allQuestions.map((q) => ({
                        value: getIri('questions', q.id),
                        label: q.content.substring(0, 40) + (q.content.length > 40 ? '...' : ''),
                      }))}
                      placeholder="Sélectionner une question..."
                      required
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteChoice(choice.id)}
                      disabled={isDeletingChoice}
                      className={styles.removeButton}
                      title="Supprimer ce choix"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                      </svg>
                    </Button>
                  </div>
                ))
              )}
              {choices.length > 0 && (
                <p className={styles.helpText}>
                  Chaque choix doit pointer vers une question suivante. Pour terminer le questionnaire, 
                  pointez vers une question sans choix (question terminale).
                </p>
              )}
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/admin/questionnaires/${questionnaireId}`)}
                disabled={isSaving}
              >
                Retour
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
