'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card, StatusBadge } from '@/components';
import styles from './tools.module.css';

interface Tool {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  href: string;
  status: 'ready' | 'in_progress' | 'coming_soon';
  workflowStep: string;
  nextActionKey: string;
}

export default function ToolsHubPage() {
  const { t } = useTranslation();

  const tools: Tool[] = [
    {
      id: 'content-generation',
      titleKey: 'tools.contentGeneration.title',
      descKey: 'tools.contentGeneration.workspaceDesc',
      icon: '✍️',
      href: '/tools/content-generation',
      status: 'ready',
      workflowStep: 'tools.hub.workflow.input',
      nextActionKey: 'tools.contentGeneration.form.startWorkflow',
    },
    {
      id: 'ai-design',
      titleKey: 'tools.aiDesign.title',
      descKey: 'tools.aiDesign.workspaceDesc',
      icon: '🎨',
      href: '/tools/ai-design',
      status: 'ready',
      workflowStep: 'tools.hub.workflow.designBrief',
      nextActionKey: 'tools.aiDesign.form.startWorkflow',
    },
    {
      id: 'cv-evidence',
      titleKey: 'tools.cvEvidence.title',
      descKey: 'tools.cvEvidence.workspaceDesc',
      icon: '📄',
      href: '/tools/cv-evidence',
      status: 'ready',
      workflowStep: 'tools.hub.workflow.selectCandidate',
      nextActionKey: 'tools.cvEvidence.form.selectCandidate',
    },
    {
      id: 'cv-translation',
      titleKey: 'tools.cvTranslation.title',
      descKey: 'tools.cvTranslation.workspaceDesc',
      icon: '🌐',
      href: '/tools/cv-translation',
      status: 'ready',
      workflowStep: 'tools.hub.workflow.selectCv',
      nextActionKey: 'tools.cvTranslation.form.startTranslation',
    },
    {
      id: 'interview-translation',
      titleKey: 'tools.interviewTranslation.title',
      descKey: 'tools.interviewTranslation.workspaceDesc',
      icon: '🗣️',
      href: '/tools/interview-translation',
      status: 'ready',
      workflowStep: 'tools.hub.workflow.selectInterview',
      nextActionKey: 'tools.interviewTranslation.form.startTranslation',
    },
  ];

  const getStatusVariant = (status: Tool['status']) => {
    switch (status) {
      case 'ready':
        return 'success' as const;
      case 'in_progress':
        return 'warning' as const;
      case 'coming_soon':
        return 'info' as const;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('tools.hub.title')}</h1>
        <p className={styles.description}>{t('tools.hub.description')}</p>
      </header>

      <div className={styles.toolsGrid} role="list">
        {tools.map((tool) => (
          <div key={tool.id} role="listitem">
            <Card className={styles.toolCard}>
              <Link href={tool.href} className={styles.toolLink}>
                <div className={styles.toolIcon} aria-hidden="true">{tool.icon}</div>
                <h2 className={styles.toolTitle}>{t(tool.titleKey)}</h2>
                <p className={styles.toolDescription}>{t(tool.descKey)}</p>
                <div className={styles.toolFooter}>
                  <div className={styles.toolStatusGroup}>
                    <StatusBadge
                      label={t(`tools.hub.status.${tool.status}`)}
                      variant={getStatusVariant(tool.status)}
                    />
                    <span className={styles.toolWorkflow}>
                      {t('tools.hub.workflow.currentStep')}: {t(tool.workflowStep)}
                    </span>
                  </div>
                </div>
                <div className={styles.toolNextAction}>
                  <span className={styles.nextActionLabel}>{t('tools.hub.nextAction')}</span>
                  <span className={styles.nextActionText}>{t(tool.nextActionKey)}</span>
                </div>
              </Link>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
