import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PageTemplate.module.css';

interface PageProps {
  title: string;
  description: string;
  screenId: string;
  coveredRequirements: string[];
  children?: ReactNode;
}

export function PageTemplate({ title, description, screenId, coveredRequirements, children }: PageProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
        <code className={styles.screenId}>{t('common.pageTemplate.reference', { screenId })}</code>
      </header>

      {children ?? (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden="true">📋</span>
          <h2 className={styles.placeholderTitle}>{t('common.pageTemplate.placeholderTitle')}</h2>
          <p className={styles.placeholderDescription}>
            {t('common.pageTemplate.placeholderDescription')}
          </p>
        </div>
      )}

      <div className={styles.todoList}>
        <h3 className={styles.todoListTitle}>{t('common.pageTemplate.coverageTitle')}</h3>
        <ul>
          {coveredRequirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}