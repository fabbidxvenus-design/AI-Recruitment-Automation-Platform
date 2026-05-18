import { ReactNode, useId } from 'react';
import styles from './Notice.module.css';

type NoticeVariant = 'info' | 'warning' | 'danger' | 'success' | 'blocker';

const variantIcons: Record<NoticeVariant, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  danger: '🔴',
  success: '✅',
  blocker: '🚫',
};

// srOnly is intentionally not added because the title and children text already convey variant meaning.

interface NoticeProps {
  variant?: NoticeVariant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  role?: 'alert' | 'status';
}

export function Notice({
  variant = 'info',
  title,
  children,
  action,
  role: roleOverride,
}: NoticeProps) {
  const isAssertive = variant === 'danger' || variant === 'blocker' || roleOverride === 'alert';
  const role = roleOverride ?? (isAssertive ? 'alert' : 'status');
  const ariaLive = isAssertive ? 'assertive' : 'polite';
  const noticeId = useId();
  const titleId = title ? `${noticeId}-title` : undefined;
  const messageId = `${noticeId}-message`;

  return (
    <div
      className={`${styles.notice} ${styles[variant]}`}
      role={role}
      aria-live={ariaLive}
      aria-labelledby={titleId}
      aria-describedby={messageId}
    >
      <span className={styles.noticeIcon} aria-hidden="true">
        {variantIcons[variant]}
      </span>
      <div className={styles.noticeContent}>
        {title && <h3 id={titleId} className={styles.noticeTitle}>{title}</h3>}
        <div id={messageId} className={styles.noticeMessage}>{children}</div>
        {action && <div className={styles.noticeAction}>{action}</div>}
      </div>
    </div>
  );
}