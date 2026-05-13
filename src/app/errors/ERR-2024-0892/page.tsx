'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  const error = mockErrorRemediationItems.find(e => e.errorCode === 'ERR-2024-0892') || mockErrorRemediationItems[0];

  const [retryAttempts] = useState<RetryAttempt[]>([
    { id: '1', attempt: 3, status: 'failed', timestamp: '2024-04-22T16:45:00Z', errorMessage: 'Connection timeout after 30s' },
    { id: '2', attempt: 2, status: 'failed', timestamp: '2024-04-22T16:30:00Z', errorMessage: 'Video format not supported: .mov (iPhone)' },
    { id: '3', attempt: 1, status: 'failed', timestamp: '2024-04-22T16:15:00Z', errorMessage: 'Storage bucket permissions denied' },
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

  const getElapsedMinutes = () => {
    return Math.round((new Date().getTime() - new Date(error.createdAt).getTime()) / (1000 * 60));
  };

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
            <Button variant="ghost">Back to Admin</Button>
          </Link>
        </div>
      </div>

      <div className={`${styles.severityBanner} ${severityClass}`}>
        <span className={styles.severityIcon}>
          {error.severity === 'critical' ? '🚨' : error.severity === 'high' ? '⚠️' : error.severity === 'medium' ? '📊' : 'ℹ️'}
        </span>
        <div className={styles.severityContent}>
          <span className={styles.severityLabel}>Severity: {error.severity.toUpperCase()}</span>
          <span className={styles.severityText}>
            {error.severity === 'critical' && 'Immediate attention required. System functionality is impacted.'}
            {error.severity === 'high' && 'High priority issue affecting candidate processing pipeline.'}
            {error.severity === 'medium' && 'Moderate impact on system operations.'}
            {error.severity === 'low' && 'Minor issue with minimal operational impact.'}
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

      <Notice variant="blocker" title="BQ-004: AI Video Interview Analysis Blocked">
        Video analysis requires Google Cloud AI services. Error remediation may temporarily restore pipeline function,
        but full analysis requires Vertex AI configuration.
      </Notice>

      <div className={styles.mainContent}>
        <div className={styles.contentLeft}>
          <Card>
            <CardHeader
              title="Resolution Progress"
              description="Current status of remediation steps"
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
                        {index < currentStep && 'Completed'}
                        {index === currentStep && 'In progress'}
                        {index > currentStep && 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Affected Entities"
              description={`${error.affectedEntities.length} entities impacted`}
            />
            <CardContent>
              <div className={styles.entityList}>
                {error.affectedEntities.map((entityId, index) => (
                  <div key={index} className={styles.entityItem}>
                    <span className={styles.entityIcon}>🎬</span>
                    <span className={styles.entityId}>{entityId}</span>
                    <StatusBadge variant="danger" label="Failed" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Resolution Steps"
              description="Detailed actions to resolve this error"
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
                        {index === 0 && 'Check application logs for specific error codes'}
                        {index === 1 && 'Verify IAM roles and bucket policies in GCP Console'}
                        {index === 2 && 'Review supported formats: MP4, WebM, AVI'}
                        {index === 3 && 'Enable verbose logging and retry batch'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.contentRight}>
          <div className={styles.retrySettings}>
            <Card>
              <CardHeader title="Retry Configuration" />
              <CardContent>
                <div className={styles.settingsCard}>
                  <h3 className={styles.settingsTitle}>Current Settings</h3>
                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>Max Attempts</span>
                      <span className={`${styles.settingValue} ${styles.danger}`}>3 / 3</span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>Retry Backoff</span>
                      <span className={styles.settingValue}>{retryBackoff}s</span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>Attempts Used</span>
                      <span className={styles.settingValue}>{retryAttempts.length}</span>
                    </div>
                    <div className={styles.settingItem}>
                      <span className={styles.settingLabel}>Next Retry In</span>
                      <span className={styles.settingValue}>--</span>
                    </div>
                  </div>
                </div>

                <div className={styles.previousCard}>
                  <h3 className={styles.previousTitle}>Previous Valid State</h3>
                  <p className={styles.previousValue}>
                    All candidates processed successfully until 2024-04-22 14:00 UTC.
                    Last successful video: int-002 (Sarah Chen) at 13:45 UTC.
                  </p>
                </div>

                <Notice variant="info" title="RETRY-005 & RETRY-006">
                  Retry backoff follows exponential increase: 30s → 60s → 120s.
                  Maximum 3 attempts before requiring manual review.
                </Notice>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader title="Assignment" description="Owner for this error" />
            <CardContent>
              <div className={styles.assignmentCard}>
                <div className={styles.assigneeSection}>
                  <div className={styles.assigneeAvatar}>👥</div>
                  <div className={styles.assigneeInfo}>
                    <span className={styles.assigneeName}>{error.assignee || 'Unassigned'}</span>
                    <span className={styles.assigneeRole}>Backend Engineering</span>
                  </div>
                  <Button variant="secondary" size="sm">Reassign</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className={styles.escalationWarning}>
            <div className={styles.escalationIcon}>⚠️</div>
            <h3 className={styles.escalationTitle}>Escalation Pending</h3>
            <p className={styles.escalationText}>
              Error will auto-escalate to Engineering Manager after 4 hours of no resolution.
              Current SLA: {getElapsedMinutes()} minutes elapsed.
            </p>
          </div>

          <Card>
            <CardHeader title="Manual Review Options" />
            <CardContent>
              <div className={styles.manualReview}>
                <h3 className={styles.manualTitle}>Available Actions</h3>
                <div className={styles.manualOptions}>
                  <div className={styles.manualOption}>
                    <span className={styles.manualOptionIcon}>🔄</span>
                    <span>Force retry with custom backoff</span>
                  </div>
                  <div className={styles.manualOption}>
                    <span className={styles.manualOptionIcon}>⏭️</span>
                    <span>Skip failed videos and continue</span>
                  </div>
                  <div className={styles.manualOption}>
                    <span className={styles.manualOptionIcon}>📥</span>
                    <span>Export failed entities for manual processing</span>
                  </div>
                </div>
              </div>
              <div className={styles.actionButtons}>
                <Button variant="secondary" onClick={() => setShowRetryModal(true)}>
                  🔄 Manual Retry
                </Button>
                <Button variant="danger" onClick={() => setShowEscalateModal(true)}>
                  🚨 Escalate Now
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
              <h2>Manual Retry Configuration</h2>
              <button className={styles.closeButton} onClick={() => setShowRetryModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="retryBackoff">Retry Backoff (seconds)</label>
                <select
                  id="retryBackoff"
                  className={styles.textarea}
                  value={retryBackoff}
                  onChange={(e) => setRetryBackoff(Number(e.target.value))}
                  style={{ height: 'auto', minHeight: 'auto', padding: '8px 12px' }}
                >
                  <option value={30}>30 seconds (Fast retry)</option>
                  <option value={60}>60 seconds (Standard)</option>
                  <option value={120}>120 seconds (Extended)</option>
                  <option value={300}>300 seconds (Extended +60%)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="retryReason">Reason for Manual Retry *</label>
                <textarea
                  id="retryReason"
                  className={styles.textarea}
                  rows={4}
                  value={retryReason}
                  onChange={(e) => setRetryReason(e.target.value)}
                  placeholder="Document why manual retry is necessary..."
                  required
                />
              </div>
              <Notice variant="info" title="BP-010">
                Backoff strategy prevents overwhelming the video processing service.
                This retry will count against max attempts.
              </Notice>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setShowRetryModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleRetry} disabled={!retryReason.trim()}>
                Start Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEscalateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Escalate Error</h2>
              <button className={styles.closeButton} onClick={() => setShowEscalateModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-on-surface)' }}>
                Escalating will notify the Engineering Manager and open a priority incident.
              </p>
              <div className={styles.formGroup}>
                <label htmlFor="escalateReason">Escalation Reason *</label>
                <textarea
                  id="escalateReason"
                  className={styles.textarea}
                  rows={4}
                  placeholder="Explain why this requires escalation..."
                  required
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setShowEscalateModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleEscalate}>
                Confirm Escalation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}