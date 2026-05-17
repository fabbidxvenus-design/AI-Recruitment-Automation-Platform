import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article';
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  headingLevel?: 'h2' | 'h3' | 'h4';
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', as: Component = 'article' }: CardProps) {
  return <Component className={`${styles.card} ${className}`}>{children}</Component>;
}

export function CardHeader({ title, description, action, headingLevel: Heading = 'h3' }: CardHeaderProps) {
  return (
    <div className={styles.cardHeader}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading className={styles.cardTitle}>{title}</Heading>
          {description && <p className={styles.cardDescription}>{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`${styles.cardContent} ${className}`}>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className={styles.cardFooter}>{children}</div>;
}

export function Panel({ children, className = '' }: CardProps) {
  return <div className={`${styles.panel} ${className}`}>{children}</div>;
}
