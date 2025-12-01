'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import styles from './page.module.css';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const redirect = searchParams.get('redirect') || '/questionnaires';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register(formData.email, formData.password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer le compte');
    }
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="error" className={styles.alert} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="votre@email.fr"
            required
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            helperText="Au moins 6 caractères"
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Créer mon compte
          </Button>
        </form>

        <p className={styles.footer}>
          Déjà un compte ?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}>
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <h1>📚 Médiathèque</h1>
        <p>Questionnaires interactifs</p>
      </div>
      <Suspense fallback={<div>Chargement...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
