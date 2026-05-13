import { ReactNode } from 'react';
import styles from './PageTemplate.module.css';

interface PageProps {
  title: string;
  description: string;
  screenId: string;
  coveredRequirements: string[];
  children?: ReactNode;
}

export function PageTemplate({ title, description, screenId, coveredRequirements, children }: PageProps) {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
        <code className={styles.screenId}>Stitch ID: {screenId}</code>
      </header>

      {children}

      <div className={styles.placeholder}>
        <span className={styles.placeholderIcon}>📋</span>
        <h2 className={styles.placeholderTitle}>Screen Implementation Pending</h2>
        <p className={styles.placeholderDescription}>
          This screen is currently a placeholder. The UI Foundation Implementer has set up the navigation shell and shared components.
        </p>
      </div>

      <div className={styles.todoList}>
        <h3 className={styles.todoListTitle}>Requirements to be covered by Core Gate 4 Screens Implementer:</h3>
        <ul>
          {coveredRequirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}