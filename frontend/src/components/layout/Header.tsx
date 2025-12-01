'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>Médiathèque</span>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/questionnaires"
            className={`${styles.navLink} ${isActive('/questionnaires') ? styles.active : ''}`}
          >
            Questionnaires
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
            >
              Administration
            </Link>
          )}
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <span className={styles.userEmail}>{user?.email}</span>
              <Button variant="ghost" size="small" onClick={logout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="small">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button size="small">S'inscrire</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
