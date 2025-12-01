'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getIri } from '@/lib/api';
import { Questionnaire, Question } from '@/types';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent, Alert, LoadingPage, MediaSelector } from '@/components/ui';
import styles from './page.module.css';

export default function NewQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = Number(params.id);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    content: '',
    mediaFilename: '',
    mediaType: '' as '' | 'image' | 'video',
  });

  // For adding choices - start empty for terminal questions
  const [choices, setChoices] = useState<{ label: string; targetQuestion: string }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [questionnaireData, questionsData] = await Promise.all([
        api.getQuestionnaire(questionnaireId),
        api.getQuestions(questionnaireId),
      ]);
      setQuestionnaire(questionnaireData);
      setQuestions(questionsData.member || questionsData['hydra:member'] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  }, [questionnaireId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addChoice = () => {
    setChoices([...choices, { label: '', targetQuestion: '' }]);
  };

  const removeChoice = (index: number) => {
    setChoices(choices.filter((_, i) => i !== index));
  };

  const updateChoice = (index: number, field: 'label' | 'targetQuestion', value: string) => {
    const updated = [...choices];
    updated[index][field] = value;
    setChoices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Create the question
      const question = await api.createQuestion({
        content: formData.content,
        questionnaire: getIri('questionnaires', questionnaireId),
        mediaFilename: formData.mediaFilename || undefined,
        mediaType: formData.mediaType || undefined,
      });

      // Create choices
      const validChoices = choices.filter((c) => c.label.trim());
      for (const choice of validChoices) {
        await api.createChoice({
          label: choice.label,
          question: getIri('questions', question.id),
          targetQuestion: choice.targetQuestion || null,
        });
      }

      router.push(`/admin/questionnaires/${questionnaireId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer la question');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Chargement..." />;
  }

  if (!questionnaire) {
    return (
      <div className={styles.container}>
        <Alert variant="error">Questionnaire non trouvé</Alert>
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
        <span>Nouvelle question</span>
      </nav>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className={styles.alert}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Textarea
              label="Texte de la question"
              name="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Ex: Quel type de document recherchez-vous ?"
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
                  <p className={styles.emptyChoicesText}>
                    Aucun choix = Question terminale (fin du questionnaire)
                  </p>
                  <p className={styles.helpText}>
                    Cette question sera affichée comme message de fin. Ajoutez des choix pour en faire une question interactive.
                  </p>
                </div>
              ) : (
                choices.map((choice, index) => (
                  <div key={index} className={styles.choiceRow}>
                    <Input
                      label={`Choix ${index + 1}`}
                      value={choice.label}
                      onChange={(e) => updateChoice(index, 'label', e.target.value)}
                      placeholder="Libellé du choix"
                    />
                    <Select
                      label="Question suivante"
                      value={choice.targetQuestion}
                      onChange={(e) => updateChoice(index, 'targetQuestion', e.target.value)}
                      options={questions.map((q) => ({
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
                      onClick={() => removeChoice(index)}
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
                Annuler
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Créer la question
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
