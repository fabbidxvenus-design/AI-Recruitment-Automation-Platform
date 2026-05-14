'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockErrorRemediationItems } from '@/lib/mockData';
import styles from './error-detail.module.css';

type RetryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface RetryAttempt {
  id: string;
  attempt: number;
  status: RetryStatus;
  timestamp: string;
  errorMessage?: string;
  completedBy?: string;
}

export default function ErrorDetailPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const error = mockErrorRemediationItems.find(e => e.errorCode === 'ERR-2024-0892') || mockErrorRemediationItems[0];

  const [retryAttempts] = useState<RetryAttempt[]>([
    { id: '1', attempt: 4, status: 'in_progress', timestamp: '2024-04-22T17:00:00Z' },
    { id: '2', attempt: 3, status: 'failed', timestamp: '2024-04-22T16:45:00Z', errorMessage: 'Connection timeout after 30s' },
    { id: '3', attempt: 2, status: 'failed', timestamp: '2024-04-22T16:30:00Z', errorMessage: 'Video format not supported: .mov (iPhone)' },
    { id: '4', attempt: 1, status: 'completed', timestamp: '2024-04-22T16:15:00Z' },
  ]);

  const [currentStep, setCurrentStep] = useState(2);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [retryReason, setRetryReason] = useState('');
  const [retryBackoff, setRetryBackoff] = useState(60);

  const severityClass = styles[error.severity] || '';

  const handleRetry = () => {
    if (retryReason.trim()) {
      alert(`Retry initiated with ${retryBackoff}s backoff. Reason: ${retryReason}`);
      setShowRetryModal(false);
      setRetryReason('');
      setCurrentStep(3);
    }
  };

  const handleEscalate = () => {
    alert('Escalated to engineering team. Engineering Manager has been notified.');
    setShowEscalateModal(false);
  };

  const elapsedMinutes = 187;

  return (
    <div className={styles.errorDetailPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.errorCode}>{error.errorCode}</span>
        </div>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{error.title}</h1>
          <p className={styles.description}>{error.description}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin">
            <Button variant="ghost">{t('errors.detail.backToAdmin')}</Button>
          </Link>
        </div>
      </div>

      <div className={`${styles.severityBanner} ${severityClass}`}>
        <span className={styles.severityIcon}>
          {error.severity === 'critical' ? '🚨' : error.severity === 'high' ? '⚠️' : error.severity === 'medium' ? '📊' : 'ℹ️'}
        </span>
        <div className={styles.severityContent}>
          <span className={styles.severityLabel}>{t('errors.detail.severity.label', { level: error.severity.toUpperCase() })}</span>
          <span className={styles.severityText}>
            {error.severity === 'critical' && t('errors.detail.severity.critical')}
            {error.severity === 'high' && t('errors.detail.severity.high')}
            {error.severity === 'medium' && t('errors.detail.severity.medium')}
            {error.severity === 'low' && t('errors.detail.severity.low')}
          </span>
        </div>
        <div className={styles.metaInfo}>
          <span className={styles.metaLabel}>Created</span>
          <span className={styles.metaValue}>
            {new Date(error.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      <Notice variant="blocker" title={t('errors.detail.notice.title')}>
        {t('errors.detail.notice.body')}
      </Notice>

      <div className={styles.mainContent}>
        <div className={styles.contentLeft}>
          <Card>
            <CardHeader
              title={t('errors.detail.resolutionProgress.title')}
              description={t('errors.detail.resolutionProgress.description')}
            />
            <CardContent>
              <div className={styles.timeline}>
                {error.resolutionSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`${styles.timelineItem} ${
                      index < currentStep ? styles.completed :
                      index === currentStep ? styles.current : ''
                    }`}
                  >
                    <div className={styles.timelineDot}>
                      {index < currentStep && '✓'}
                      {index === currentStep && (index + 1)}
                    </div>
                    <div className={styles.timelineItemContent}>
                      <h3 className={styles.timelineTitle}>{step}</h3>
                      <span className={styles.timelineTime}>
                        {index < currentStep && t('errors.detail.resolutionProgress.completed')}
                        {index === currentStep && t('errors.detail.resolutionProgress.inProgress')}
                        {index > currentStep && t('errors.detail.resolutionProgress.pending')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('errors.detail.affectedEntities.title')}
              description={t('errors.detail.affectedEntities.description', { count: error.affectedEntities.length })}
            />
            <CardContent>
              <div className={styles.entityList}>
                {error.affectedEntities.map((entityId, index) => (
                  <div key={index} className={styles.entityItem}>
                    <span className={styles.entityIcon}>🎬</span>
                    <span className={styles.entityId}>{entityId}</span>
                    <StatusBadge variant="danger" label={t('errors.detail.affectedEntities.failed')} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('errors.detail.resolutionSteps.title')}
              description={t('errors.detail.resolutionSteps.description')}
            />
            <CardContent>
              <div className={styles.resolutionSteps}>
                {error.resolutionSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`${styles.resolutionStep} ${
                      index < currentStep ? styles.completed : ''
                    }`}
                  >
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <div className={styles.stepContent}>
                      <span className={styles.stepTitle}>{step}</span>
                      <span className={styles.stepDesc}>
                        {index === 0 && t('errors.detail.resolutionSteps.stepDescriptions.checkLogs')}
                        {index === 1 && t('errors.detail.resolutionSteps.stepDescriptions.verifyIam')}
                        {index === 2 && t('errors.detail.resolutionSteps.stepDescriptions.reviewFormats')}
                        {index === 3 && t('errors.detail.resolutionSteps.stepDescriptions.retryBatch')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className={styles.retryHistorySection}>
            <Card>
              <CardHeader title={t('errors.detail.retryConfig.retryHistory.title')} />
              <CardContent>
                {retryAttempts.length > 0 ? (
                  <div className={styles.retryHistoryTableContainer}>
                    <table className={styles.retryHistoryTable}>
                      <thead>
                        <tr>
                          <th>{t('errors.detail.retryConfig.retryHistory.attempt')}</th>
                          <th>{t('errors.detail.retryConfig.retryHistory.timestamp')}</th>
                          <th>{t('errors.detail.retryConfig.retryHistory.status')}</th>
                          <th>{t('errors.detail.retryConfig.retryHistory.errorMessage')}</th>
                          <th>{t('errors.detail.retryConfig.retryHistory.duration')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retryAttempts.map((attempt) => (
                          <tr key={attempt.id} className={styles.retryRow}>
                            <td>{attempt.attempt}</td>
                            <td>{formatDateTime(attempt.timestamp, locale)}</td>
                            <td className={styles.statusCell}>
                              <span className={`${styles.badge} ${styles[attempt.status]}`}>
                                {attempt.status}
                              </span>
                            </td>
                            <td>{attempt.errorMessage || '-'}</td>
                            <td>{attempt.status === 'failed' ? '45s' : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>{t('errors.detail.retryConfig.retryHistory.noAttempts')}</p>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        <div className={styles.contentRight}>
          <div className={styles.retrySettings}>
            <Card>
              <CardHeader title={t('errors.detail.retryConfig.title')} />
              <CardContent>
                <div className={styles.settingsCard}>
                  <h3 className={styles.settingsTitle}>{t('errors.detail.retryConfig.currentSettings')}</h3>
                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>{t('errors.detail.retryConfig.maxAttempts')}</span>
                      <span className={`${styles.settingValue} ${styles.danger}`}>3 / 3</span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>{t('errors.detail.retryConfig.retryBackoff')}</span>
                      <span className={styles.settingValue}>{retryBackoff}s</span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>{t('errors.detail.retryConfig.attemptsUsed')}</span>
                      <span className={styles.settingValue}>{retryAttempts.length}</span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>{t('errors.detail.retryConfig.nextRetryIn')}</span>
                      <span className={styles.settingValue}>{t('errors.detail.retryConfig.noAttempts')}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.previousStateCard}>
                  <h3 className={styles.previousTitle}>{t('errors.detail.retryConfig.enhancedPreviousState.title')}</h3>
                  <div className={styles.previousStateGrid}>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>{t('errors.detail.retryConfig.enhancedPreviousState.candidateState')}</span>
                      <span className={styles.settingValue}>INTERVIEW_SCHEDULED</span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>{t('errors.detail.retryConfig.enhancedPreviousState.lastSuccess')}</span>
                      <span className={styles.settingValue}>
                        Video int-002 (Sarah Chen)<br/>
                        <small>2024-04-22 13:45 UTC</small>
                      </span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>{t('errors.detail.retryConfig.enhancedPreviousState.affectedCount')}</span>
                      <span className={`${styles.settingValue} ${styles.danger}`}>42 Candidates</span>
                    </div>
                  </div>

                  <div className={styles.stateComparison}>
                    <div className={styles.stateBox}>
                      <span className={`${styles.stateTag} ${styles.before}`}>BEFORE</span>
                      <span>Processing_Queue</span>
                    </div>
                    <div className={styles.stateArrow}>→</div>
                    <div className={styles.stateBox}>
                      <span className={`${styles.stateTag} ${styles.after}`}>AFTER</span>
                      <span>Error_State</span>
                    </div>
                  </div>
                </div>

                <Notice variant="info" title={t('errors.detail.retryConfig.notice.title')}>
                  {t('errors.detail.retryConfig.notice.body')}
                </Notice>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader title={t('errors.detail.assignment.title')} description={t('errors.detail.assignment.description')} />
            <CardContent>
              <div className={styles.assignmentCard}>
                <div className={styles.assigneeSection}>
                  <div className={styles.assigneeAvatar}>👥</div>
                  <div className={styles.assigneeInfo}>
                    <span className={styles.assigneeName}>{error.assignee || 'Unassigned'}</span>
                    <span className={styles.assigneeRole}>{t('errors.detail.assignment.backendRole')}</span>
                  </div>
                  <Button variant="secondary" size="sm">{t('errors.detail.assignment.reassign')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className={styles.escalationWarning}>
            <div className={styles.escalationIcon}>⚠️</div>
            <h3 className={styles.escalationTitle}>{t('errors.detail.escalation.title')}</h3>
            <p className={styles.escalationText}>
              {t('errors.detail.escalation.body', { minutes: elapsedMinutes })}
            </p>
          </div>

          <Card>
            <CardHeader title={t('errors.detail.manualReview.title')} />
            <CardContent>
              <div className={styles.manualReview}>
                <h3 className={styles.manualTitle}>{t('errors.detail.manualReview.availableActions')}</h3>
                <div className={styles.manualOptions}>
                  <div className={styles.manualOption}>
                    <span className={styles.manualOptionIcon}>🔄</span>
                    <span>{t('errors.detail.manualReview.forceRetry')}</span>
                  </div>
                  <div className={styles.manualOption}>
                    <span className={styles.manualOptionIcon}>⏭️</span>
                    <span>{t('errors.detail.manualReview.skipFailed')}</span>
                  </div>
                  <div className={styles.manualOption}>
                    <span className={styles.manualOptionIcon}>📥</span>
                    <span>{t('errors.detail.manualReview.exportFailed')}</span>
                  </div>
                </div>
              </div>
              <div className={styles.actionButtons}>
                <Button variant="secondary" onClick={() => setShowRetryModal(true)}>
                  🔄 {t('errors.detail.actions.manualRetry')}
                </Button>
                <Button variant="danger" onClick={() => setShowEscalateModal(true)}>
                  🚨 {t('errors.detail.actions.escalateNow')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showRetryModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{t('errors.detail.retryModal.title')}</h2>
              <button className={styles.closeButton} onClick={() => setShowRetryModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="retryBackoff">{t('errors.detail.retryModal.backoffLabel')}</label>
                <select
                  id="retryBackoff"
                  className={styles.textarea}
                  value={retryBackoff}
                  onChange={(e) => setRetryBackoff(Number(e.target.value))}
                  style={{ height: 'auto', minHeight: 'auto', padding: '8px 12px' }}
                >
                  <option value={30}>{t('errors.detail.retryModal.backoffOptions.fast30')}</option>
                  <option value={60}>{t('errors.detail.retryModal.backoffOptions.standard60')}</option>
                  <option value={120}>{t('errors.detail.retryModal.backoffOptions.extended120')}</option>
                  <option value={300}>{t('errors.detail.retryModal.backoffOptions.extendedPlus')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="retryReason">{t('errors.detail.retryModal.reasonLabel')}</label>
                <textarea
                  id="retryReason"
                  className={styles.textarea}
                  rows={4}
                  value={retryReason}
                  onChange={(e) => setRetryReason(e.target.value)}
                  placeholder={t('errors.detail.retryModal.reasonPlaceholder')}
                  required
                />
              </div>
              <Notice variant="info" title={t('errors.detail.retryModal.bp010.title')}>
                {t('errors.detail.retryModal.bp010.body')}
              </Notice>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setShowRetryModal(false)}>{t('errors.detail.retryModal.cancel')}</Button>
              <Button variant="primary" onClick={handleRetry} disabled={!retryReason.trim()}>
                {t('errors.detail.retryModal.startRetry')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEscalateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{t('errors.detail.escalateModal.title')}</h2>
              <button className={styles.closeButton} onClick={() => setShowEscalateModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-on-surface)' }}>
                {t('errors.detail.escalateModal.body')}
              </p>
              <div className={styles.formGroup}>
                <label htmlFor="escalateReason">{t('errors.detail.escalateModal.reasonLabel')}</label>
                <textarea
                  id="escalateReason"
                  className={styles.textarea}
                  rows={4}
                  placeholder={t('errors.detail.escalateModal.reasonPlaceholder')}
                  required
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setShowEscalateModal(false)}>{t('errors.detail.escalateModal.cancel')}</Button>
              <Button variant="danger" onClick={handleEscalate}>
                {t('errors.detail.escalateModal.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}