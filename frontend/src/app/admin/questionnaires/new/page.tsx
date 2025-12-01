'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import styles from './page.module.css';

export default function NewQuestionnairePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const questionnaire = await api.createQuestionnaire({
        title: formData.title,
        description: formData.description || undefined,
      });
      router.push(`/admin/questionnaires/${questionnaire.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer le questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Nouveau questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className={styles.alert} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Titre"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Satisfaction des usagers"
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez brièvement l'objectif de ce questionnaire..."
              rows={4}
            />

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Créer le questionnaire
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
