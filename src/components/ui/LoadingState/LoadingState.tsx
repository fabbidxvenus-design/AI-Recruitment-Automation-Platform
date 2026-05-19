'use client';

import { useTranslation } from 'react-i18next';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text }: LoadingStateProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.loadingState} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.loadingText}>{text ?? t('common.loading')}</span>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`${styles.skeleton} ${className}`} aria-hidden="true" />;
}

export function SkeletonText() {
  return <div className={`${styles.skeleton} ${styles.skeletonText}`} aria-hidden="true" />;
}

export function SkeletonTitle() {
  return <div className={`${styles.skeleton} ${styles.skeletonTitle}`} aria-hidden="true" />;
}

export function SkeletonCard() {
  return <div className={`${styles.skeleton} ${styles.skeletonCard}`} aria-hidden="true" />;
}