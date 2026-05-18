'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const { t } = useTranslation();
  const { 'aria-label': ariaLabel, ...buttonProps } = props;
  const loadingLabel = t('common.loading', { defaultValue: 'Loading' });
  const accessibleLabel = loading
    ? [ariaLabel, loadingLabel].filter(Boolean).join(' ')
    : ariaLabel;

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${loading ? styles.loading : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={accessibleLabel}
      type={type}
      {...buttonProps}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true" role="presentation">
          ◐
        </span>
      )}
      <span className={loading ? styles.textLoading : ''}>{children}</span>
    </button>
  );
}