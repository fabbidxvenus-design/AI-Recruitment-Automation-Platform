'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components';
import styles from './tools.module.css';

export default function ToolsHubPage() {
  const { t } = useTranslation();

  const tools = [
    {
      id: 'content-generation',
      titleKey: 'tools.contentGeneration.title',
      descKey: 'tools.contentGeneration.description',
      icon: '✍️',
      href: '/tools/content-generation',
      status: 'available' as const,
    },
    {
      id: 'ai-design',
      titleKey: 'tools.aiDesign.title',
      descKey: 'tools.aiDesign.description',
      icon: '🎨',
      href: '/tools/ai-design',
      status: 'available' as const,
    },
    {
      id: 'cv-evidence',
      titleKey: 'tools.cvEvidence.title',
      descKey: 'tools.cvEvidence.description',
      icon: '📄',
      href: '/tools/cv-evidence',
      status: 'available' as const,
    },
    {
      id: 'cv-translation',
      titleKey: 'tools.cvTranslation.title',
      descKey: 'tools.cvTranslation.description',
      icon: '🌐',
      href: '/tools/cv-translation',
      status: 'available' as const,
    },
    {
      id: 'interview-translation',
      titleKey: 'tools.interviewTranslation.title',
      descKey: 'tools.interviewTranslation.description',
      icon: '🗣️',
      href: '/tools/interview-translation',
      status: 'available' as const,
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('tools.hub.title')}</h1>
        <p className={styles.description}>{t('tools.hub.description')}</p>
      </header>

      <ul className={styles.toolsGrid}>
        {tools.map((tool) => (
          <li key={tool.id} className={styles.toolItem}>
            <Card className={styles.toolCard}>
              <Link href={tool.href} className={styles.toolLink}>
                <div className={styles.toolIcon} aria-hidden="true">{tool.icon}</div>
                <h2 className={styles.toolTitle}>{t(tool.titleKey)}</h2>
                <p className={styles.toolDescription}>{t(tool.descKey)}</p>
                <div className={styles.toolFooter}>
                  <span className={styles.toolStatus}>
                    {t('tools.hub.available')}
                  </span>
                </div>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
