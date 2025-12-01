'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import styles from './page.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const redirect = searchParams.get('redirect') || '/questionnaires';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData.email, formData.password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects');
    }
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
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
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Se connecter
          </Button>
        </form>

        <p className={styles.footer}>
          Pas encore de compte ?{' '}
          <Link href={`/register?redirect=${encodeURIComponent(redirect)}`}>
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <h1>📚 Médiathèque</h1>
        <p>Questionnaires interactifs</p>
      </div>
      <Suspense fallback={<div>Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
