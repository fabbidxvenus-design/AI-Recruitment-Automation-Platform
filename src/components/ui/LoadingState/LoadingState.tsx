import styles from './LoadingState.module.css';

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = 'Loading...' }: LoadingStateProps) {
  return (
    <div className={styles.loadingState} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.loadingText}>{text}</span>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`${styles.skeleton} ${className}`} />;
}

export function SkeletonText() {
  return <div className={`${styles.skeleton} ${styles.skeletonText}`} />;
}

export function SkeletonTitle() {
  return <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />;
}

export function SkeletonCard() {
  return <div className={`${styles.skeleton} ${styles.skeletonCard}`} />;
}