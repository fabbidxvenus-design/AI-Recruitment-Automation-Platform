'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockFinalReviewPackages } from '@/lib/mockData';
import styles from './final-review.module.css';

export default function FinalReviewPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<'PASS' | 'FAIL' | null>(null);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const selected = mockFinalReviewPackages.find(p => p.id === selectedCandidate) || mockFinalReviewPackages[0];

  const handleDecision = (type: 'PASS' | 'FAIL') => {
    setDecision(type);
    setShowDecisionModal(true);
  };

  const handleSubmitDecision = () => {
    if (!reason.trim()) {
      setReasonError('Reason is required for final decision');
      return;
    }
    if (mfaVerified && reason.trim()) {
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
      setReasonError('Reason is required for final decision');
    } else {
      setReasonError('');
    }
  };

  return (
    <div className={styles.finalReviewPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Final Review & Decision</h1>
          <p className={styles.description}>
            Review complete candidate package and make final hiring decision
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost">View History</Button>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <Notice variant="blocker" title="BQ-006: Combined Policy Unresolved">
        Combined approval policy and compensation analysis not fully configured. Escalation workflows may require manual intervention. HR/IT Admin approval needed.
      </Notice>

      <div className={styles.mainContent}>
        <div className={styles.candidatePanel}>
          <Card>
            <CardHeader
              title="Candidates for Final Review"
              description={`${mockFinalReviewPackages.length} candidates`}
            />
            <CardContent>
              <div className={styles.candidateList}>
                {mockFinalReviewPackages.map(candidate => (
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
                        label={candidate.recommendation.replace('_', ' ').replace('hire', ' Hire')}
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
                  <h3 className={styles.sectionTitle}>Interview Summary</h3>
                  <p className={styles.summaryText}>{selected.interviewSummary}</p>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>Test Results Summary</h3>
                  <p className={styles.summaryText}>{selected.testResultsSummary}</p>
                  <div className={styles.testScoreDisplay}>
                    <ProgressBar
                      value={selected.overallScore}
                      max={100}
                      showValue
                      variant={selected.overallScore >= 80 ? 'success' : selected.overallScore >= 60 ? 'warning' : 'danger'}
                      label="Overall Assessment"
                    />
                  </div>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>Compensation</h3>
                  <div className={styles.compensationGrid}>
                    <div className={styles.compItem}>
                      <span className={styles.compLabel}>Requested</span>
                      <span className={styles.compValue}>${selected.compensation.requested.toLocaleString()}</span>
                    </div>
                    <div className={styles.compItem}>
                      <span className={styles.compLabel}>Recommended</span>
                      <span className={styles.compValue}>${selected.compensation.recommended.toLocaleString()}</span>
                    </div>
                    <div className={styles.compItem}>
                      <span className={styles.compLabel}>Status</span>
                      <StatusBadge
                        variant={selected.compensation.approved ? 'success' : 'warning'}
                        label={selected.compensation.approved ? 'Approved' : 'Pending'}
                      />
                    </div>
                  </div>
                  <Notice variant="info" title="Market Rate Analysis">
                    BQ-006: External market data not integrated. Recommended compensation based on internal data only.
                  </Notice>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>Documents</h3>
                  <div className={styles.documentList}>
                    {selected.documents.map(doc => (
                      <div key={doc.id} className={styles.documentItem}>
                        <span className={styles.docIcon}>📄</span>
                        <span className={styles.docName}>{doc.name}</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>Approval Workflow</h3>
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
                            {new Date(approver.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.reviewSection}>
                  <h3 className={styles.sectionTitle}>Recommendation</h3>
                  <div className={styles.recommendation}>
                    <span className={`${styles.recBadge} ${styles[selected.recommendation]}`}>
                      {selected.recommendation.replace('_', ' ').replace('hire', ' Hire').replace('no', 'No ')}
                    </span>
                    <p className={styles.recText}>
                      Based on interview performance and test scores, this candidate is recommended for {selected.recommendation.includes('no') ? 'rejection' : 'hiring'}.
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
            <div className={styles.actionButtons}>
              <Button variant="ghost">Request More Info</Button>
              <Button variant="danger" onClick={() => handleDecision('FAIL')}>
                Reject (FAIL)
              </Button>
              <Button variant="primary" onClick={() => handleDecision('PASS')}>
                Approve (PASS)
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {showDecisionModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Confirm Final Decision: {decision}</h2>
              <button className={styles.closeButton} onClick={() => setShowDecisionModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.decisionInfo}>
                <p>
                  You are about to make a <strong>{decision === 'PASS' ? 'PASS' : 'FAIL'}</strong> decision for <strong>{selected.candidateName}</strong>.
                </p>
                <p className={styles.decisionWarning}>
                  This action requires MFA verification and will be logged for audit purposes.
                </p>
              </div>

              {!mfaVerified ? (
                <div className={styles.mfaSection}>
                  <p className={styles.mfaLabel}>Verify your identity to continue:</p>
                  <Button variant="secondary" onClick={handleVerifyMfa}>
                    🔐 Verify with MFA Device
                  </Button>
                </div>
              ) : (
                <div className={styles.reasonSection}>
                  <div className={styles.mfaVerified}>
                    <span aria-hidden="true">✓</span>
                    <span>MFA Verified</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="decisionReason">Reason for Decision *</label>
                    <textarea
                      id="decisionReason"
                      className={styles.textarea}
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      onBlur={handleReasonBlur}
                      placeholder="Enter your reason for this decision..."
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
              <Button variant="ghost" onClick={() => setShowDecisionModal(false)}>Cancel</Button>
              <Button
                variant={decision === 'PASS' ? 'primary' : 'danger'}
                onClick={handleSubmitDecision}
                disabled={!mfaVerified || !reason.trim()}
              >
                Confirm {decision} Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}