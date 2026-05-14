'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDate, formatNumber } from '@/lib/formatDate';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockFinalReviewPackages } from '@/lib/mockData';
import { markFinalReviewSubmitted, resolveFinalReviewPackageForActivePlan } from '@/lib/assessmentWorkflowState';
import styles from './final-review.module.css';

export default function FinalReviewPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<'PASS' | 'FAIL' | null>(null);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const activeWorkflowPackage = resolveFinalReviewPackageForActivePlan();
  const finalReviewPackages = [activeWorkflowPackage, ...mockFinalReviewPackages.filter((reviewPackage) => reviewPackage.id !== activeWorkflowPackage.id)];
  const selected = finalReviewPackages.find(p => p.id === selectedCandidate) || activeWorkflowPackage;

  const handleDecision = (type: 'PASS' | 'FAIL') => {
    setDecision(type);
    setShowDecisionModal(true);
  };

  const handleSubmitDecision = () => {
    if (!reason.trim()) {
      setReasonError(t('finalReview.modal.reasonRequired'));
      return;
    }
    if (mfaVerified && reason.trim()) {
      markFinalReviewSubmitted(selected.id);
      alert(`Final decision ${decision} submitted for ${selected.candidateName}`);
      setShowDecisionModal(false);
      setDecision(null);
      setMfaVerified(false);
      setReason('');
      setReasonError('');
    }
  };

  const handleVerifyMfa = () => {
    setMfaVerified(true);
  };

  const handleReasonBlur = () => {
    if (!reason.trim()) {
      setReasonError(t('finalReview.modal.reasonRequired'));
    } else {
      setReasonError('');
    }
  };

  return (
    <div className={styles.finalReviewPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('finalReview.title')}</h1>
          <p className={styles.description}>
            {t('finalReview.description')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost">{t('finalReview.actions.viewHistory')}</Button>
          <Link href="/dashboard">
            <Button variant="secondary">{t('finalReview.actions.backToDashboard')}</Button>
          </Link>
        </div>
      </div>

      <Notice variant="blocker" title={t('finalReview.notice.title')}>
        {t('finalReview.notice.body')}
      </Notice>

      <div className={styles.mainContent}>
        <div className={styles.candidatePanel}>
          <Card>
            <CardHeader
              title={t('finalReview.candidates.title')}
              description={t('finalReview.candidates.count', { count: finalReviewPackages.length })}
            />
            <CardContent>
              <div className={styles.candidateList}>
                {finalReviewPackages.map(candidate => (
                  <div
                    key={candidate.id}
                    className={`${styles.candidateItem} ${selected?.id === candidate.id ? styles.selected : ''}`}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCandidate(candidate.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selected?.id === candidate.id}
                    aria-label={`${candidate.candidateName}, ${candidate.jobTitle}, Score ${candidate.overallScore}`}
                  >
                    <div className={styles.candidateInfo}>
                      <span className={styles.candidateName}>{candidate.candidateName}</span>
                      <span className={styles.jobTitle}>{candidate.jobTitle}</span>
                    </div>
                    <div className={styles.candidateScore}>
                      <span className={styles.scoreValue}>{candidate.overallScore}</span>
                      <StatusBadge
                        variant={candidate.recommendation.includes('strong') ? 'success' : 'warning'}
                        label={t(`finalReview.recommendation.label.${candidate.recommendation}`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.detailPanel}>
          <Card>
            <CardHeader
              title={selected.candidateName}
              description={selected.jobTitle}
              action={
                <div className={styles.overallScore}>
                  <span className={styles.scoreLabel}>Overall Score</span>
                  <span className={styles.scoreValue}>{selected.overallScore}/100</span>
                </div>
              }
            />
            <CardContent>
              <div className={styles.reviewSections}>
                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>{t('finalReview.sections.interviewSummary')}</h3>
                  <p className={styles.summaryText}>{selected.interviewSummary}</p>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>{t('finalReview.sections.testResultsSummary')}</h3>
                  <p className={styles.summaryText}>{selected.testResultsSummary}</p>
                  <div className={styles.testScoreDisplay}>
                    <ProgressBar
                      value={selected.overallScore}
                      max={100}
                      showValue
                      variant={selected.overallScore >= 80 ? 'success' : selected.overallScore >= 60 ? 'warning' : 'danger'}
                      label={t('finalReview.sections.overallScore')}
                    />
                  </div>
                </section>

                {selected.assessmentTraceability && (
                  <section className={styles.reviewSection}>
                    <h3 className={styles.sectionTitle}>{t('finalReview.sections.sourceOfTruth')}</h3>
                    <p className={styles.summaryText}>{t('finalReview.traceability.notice')}</p>
                    <div className={styles.compensationGrid}>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.cvVersionId')}</span>
                        <span className={styles.compValue}>{selected.cvVersionId ?? t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.jobId')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.jobId}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.jdVersionId')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.jdVersionId}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.parsedCriteriaVersion')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.parsedCriteriaVersion}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.assessmentPlanId')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.assessmentPlanId}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.assessmentPlanVersionId')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.assessmentPlanVersionId}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.rubricVersionId')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.rubricVersionId}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.interviewQuestionSetVersionId')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.interviewQuestionSetVersionId ?? t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.compItem}>
                        <span className={styles.compLabel}>{t('finalReview.traceability.testDefinitionVersionId')}</span>
                        <span className={styles.compValue}>{selected.assessmentTraceability.testDefinitionVersionId ?? t('common.notAvailable')}</span>
                      </div>
                    </div>
                  </section>
                )}

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>{t('finalReview.sections.compensation')}</h3>
                  <div className={styles.compensationGrid}>
                    <div className={styles.compItem}>
                      <span className={styles.compLabel}>{t('finalReview.sections.requested')}</span>
                      <span className={styles.compValue}>${formatNumber(selected.compensation.requested, locale)}</span>
                    </div>
                    <div className={styles.compItem}>
                      <span className={styles.compLabel}>{t('finalReview.sections.recommended')}</span>
                      <span className={styles.compValue}>${formatNumber(selected.compensation.recommended, locale)}</span>
                    </div>
                    <div className={styles.compItem}>
                      <span className={styles.compLabel}>{t('finalReview.sections.status')}</span>
                      <StatusBadge
                        variant={selected.compensation.approved ? 'success' : 'warning'}
                        label={selected.compensation.approved ? t('common.status.approved') : t('common.status.pending')}
                      />
                    </div>
                  </div>
                  <Notice variant="info" title={t('finalReview.compensationNotice.title')}>
                    {t('finalReview.compensationNotice.body')}
                  </Notice>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>{t('finalReview.sections.documents')}</h3>
                  <div className={styles.documentList}>
                    {selected.documents.map(doc => (
                      <div key={doc.id} className={styles.documentItem}>
                        <span className={styles.docIcon}>📄</span>
                        <span className={styles.docName}>{doc.name}</span>
                        <Button variant="ghost" size="sm">{t('finalReview.documentActions.view')}</Button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>{t('finalReview.sections.approvalWorkflow')}</h3>
                  <div className={styles.approverList}>
                    {selected.approvers.map((approver, index) => (
                      <div key={index} className={styles.approverItem}>
                        <div className={styles.approverInfo}>
                          <span className={styles.approverName}>{approver.name}</span>
                          <span className={styles.approverRole}>{approver.role}</span>
                        </div>
                        <StatusBadge
                          variant={approver.status === 'approved' ? 'success' : 'warning'}
                          label={approver.status}
                          dot
                        />
                        {approver.timestamp && (
                          <span className={styles.approverTime}>
                            {formatDate(approver.timestamp, locale)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>{t('finalReview.sections.recommendation')}</h3>
                  <div className={styles.recommendation}>
                    <span className={`${styles.recBadge} ${styles[selected.recommendation]}`}>
                      {t(`finalReview.recommendation.label.${selected.recommendation}`)}
                    </span>
                    <p className={styles.recText}>
                      {t('finalReview.recommendation.text', { decision: selected.recommendation.includes('no') ? t('common.decision.reject').toLowerCase() : t('common.decision.approve').toLowerCase() })}
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
            <div className={styles.actionButtons}>
              <Button variant="ghost">{t('finalReview.decisionActions.requestInfo')}</Button>
              <Button variant="danger" onClick={() => handleDecision('FAIL')}>
                {t('finalReview.decisionActions.reject')}
              </Button>
              <Button variant="primary" onClick={() => handleDecision('PASS')}>
                {t('finalReview.decisionActions.approve')}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {showDecisionModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{t('finalReview.modal.title', { decision })}</h2>
              <button className={styles.closeButton} onClick={() => setShowDecisionModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.decisionInfo}>
                <p>
                  {t('finalReview.modal.warning', { decision, name: selected.candidateName })}
                </p>
                <p className={styles.decisionWarning}>
                  {t('finalReview.modal.auditNotice')}
                </p>
              </div>

              {!mfaVerified ? (
                <div className={styles.mfaSection}>
                  <p className={styles.mfaLabel}>{t('finalReview.modal.mfaLabel')}</p>
                  <Button variant="secondary" onClick={handleVerifyMfa}>
                    🔐 {t('finalReview.modal.verifyMfa')}
                  </Button>
                </div>
              ) : (
                <div className={styles.reasonSection}>
                  <div className={styles.mfaVerified}>
                    <span aria-hidden="true">✓</span>
                    <span>{t('finalReview.modal.mfaVerified')}</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="decisionReason">{t('finalReview.modal.reasonLabel')}</label>
                    <textarea
                      id="decisionReason"
                      className={styles.textarea}
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      onBlur={handleReasonBlur}
                      placeholder={t('finalReview.modal.reasonPlaceholder')}
                      required
                      aria-required="true"
                      aria-invalid={!!reasonError}
                      aria-describedby={reasonError ? 'reason-error' : undefined}
                    />
                    {reasonError && (
                      <span id="reason-error" className={styles.fieldError} role="alert">
                        {reasonError}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setShowDecisionModal(false)}>{t('finalReview.modal.cancel')}</Button>
              <Button
                variant={decision === 'PASS' ? 'primary' : 'danger'}
                onClick={handleSubmitDecision}
                disabled={!mfaVerified || !reason.trim()}
              >
                {t('finalReview.modal.confirm', { decision })}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}