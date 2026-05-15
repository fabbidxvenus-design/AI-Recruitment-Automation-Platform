import styles from './StatusBadge.module.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'purple' | 'teal';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label: string;
  dot?: boolean;
}

export function StatusBadge({ variant = 'default', label, dot = false }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {label}
    </span>
  );
}