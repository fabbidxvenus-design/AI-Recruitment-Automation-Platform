'use client';

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PageTemplate.module.css';

interface PageProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageTemplate({ title, description, children }: PageProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
      </header>

      {children ?? (
        <div className={styles.nextActionPanel}>
          <span className={styles.nextActionIcon} aria-hidden="true">📋</span>
          <h2 className={styles.nextActionTitle}>{t('common.pageTemplate.placeholderTitle')}</h2>
          <p className={styles.nextActionDescription}>
            {t('common.pageTemplate.placeholderDescription')}
          </p>
        </div>
      )}
    </div>
  );
}