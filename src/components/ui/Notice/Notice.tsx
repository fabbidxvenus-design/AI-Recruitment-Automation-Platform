import { ReactNode } from 'react';
import styles from './Notice.module.css';

type NoticeVariant = 'info' | 'warning' | 'danger' | 'success' | 'blocker';

const variantIcons: Record<NoticeVariant, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  danger: '🔴',
  success: '✅',
  blocker: '🚫',
};

interface NoticeProps {
  variant?: NoticeVariant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Notice({
  variant = 'info',
  title,
  children,
  action,
}: NoticeProps) {
  return (
    <div className={`${styles.notice} ${styles[variant]}`} role="alert">
      <span className={styles.noticeIcon} aria-hidden="true">
        {variantIcons[variant]}
      </span>
      <div className={styles.noticeContent}>
        {title && <div className={styles.noticeTitle}>{title}</div>}
        <div className={styles.noticeMessage}>{children}</div>
        {action && <div className={styles.noticeAction}>{action}</div>}
      </div>
    </div>
  );
}