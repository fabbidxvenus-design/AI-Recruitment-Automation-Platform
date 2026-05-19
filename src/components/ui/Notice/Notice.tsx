'use client';

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
  const role = variant === 'danger' || variant === 'blocker' ? 'alert' : 'status';
  const ariaLive = variant === 'danger' || variant === 'blocker' ? 'assertive' : 'polite';
  const noticeId = useId();
  const titleId = title ? `${noticeId}-title` : undefined;
  const messageId = `${noticeId}-message`;

  return (
    <div
      className={`${styles.notice} ${styles[variant]}`}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      aria-live={ariaLive}
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