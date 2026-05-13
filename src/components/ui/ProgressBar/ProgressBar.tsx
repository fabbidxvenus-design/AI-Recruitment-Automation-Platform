import styles from './ProgressBar.module.css';

type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: ProgressVariant;
  size?: ProgressSize;
  striped?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'default',
  size = 'md',
  striped = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`${styles.progressWrapper} ${styles[size]}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      {(label || showValue) && (
        <div className={styles.progressLabel}>
          {label && <span className={styles.progressLabelText}>{label}</span>}
          {showValue && (
            <span className={styles.progressValue}>{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressBar} ${styles[variant]} ${striped ? styles.striped : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}