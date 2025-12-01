'use client';

import React from 'react';
import styles from './Loading.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({ size = 'medium', className }: LoadingSpinnerProps) {
  return (
    <div className={`${styles.spinner} ${styles[size]} ${className || ''}`}>
      <div className={styles.ring}></div>
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Chargement...' }: LoadingPageProps) {
  return (
    <div className={styles.page}>
      <LoadingSpinner size="large" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
