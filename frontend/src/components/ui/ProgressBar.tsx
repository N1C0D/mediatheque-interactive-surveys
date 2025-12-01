'use client';

import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ current, total, showLabel = true, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {showLabel && (
        <div className={styles.label}>
          <span>Progression</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div
          className={styles.bar}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
