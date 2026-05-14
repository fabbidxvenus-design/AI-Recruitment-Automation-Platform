'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { Card, Button, Notice, StatusBadge, Modal } from '@/components';
import type { ParsedJDProfile, JDVersion } from '@/types';
import { mockParsedJDProfiles, mockJDVersions, mockJobs } from '@/lib/jobIntakeMockData';
import styles from './jd-approval.module.css';

type WorkflowStep = 'list' | 'review' | 'approved' | 'rejected';

interface JDApprovalItem {
  parsedProfile: ParsedJDProfile;
  jdVersion: JDVersion;
  jobTitle: string;
}

export default function JDApprovalPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('list');
  const [selectedItem, setSelectedItem] = useState<JDApprovalItem | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter pending JD profiles
  const pendingItems: JDApprovalItem[] = mockParsedJDProfiles
    .filter((profile) => profile.status === 'draft')
    .map((profile) => {
      const jdVersion = mockJDVersions.find((v) => v.id === profile.jdVersionId);
      const job = mockJobs.find((j) => j.id === jdVersion?.jobId);
      return {
        parsedProfile: profile,
        jdVersion: jdVersion!,
        jobTitle: job?.title || 'Unknown Job',
      };
    });

  const handleSelectItem = (item: JDApprovalItem): void => {
    setSelectedItem(item);
    setCurrentStep('review');
  };

  const handleApprove = (): void => {
    if (!selectedItem) return;

    setSelectedItem({
      ...selectedItem,
      parsedProfile: { ...selectedItem.parsedProfile, status: 'approved' },
    });
    setCurrentStep('approved');
  };

  const handleReject = (): void => {
    if (!selectedItem || !rejectionReason.trim()) return;

    // Update status to rejected (using draft as fallback since type doesn't have rejected)
    setCurrentStep('rejected');
    setShowRejectModal(false);
  };

  const handleBackToList = (): void => {
    setCurrentStep('list');
    setSelectedItem(null);
    setRejectionReason('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/jobs" className={styles.backLink}>
            ← Jobs
          </a>
        </div>
        <h1 className={styles.title}>JD Approval Workflow</h1>
        <p className={styles.description}>
          Review and approve AI-parsed job descriptions before they can be used for candidate screening.
        </p>
      </header>

      {currentStep === 'list' && (
        <>
          <Notice variant="info" title="Approval Gate">
            All AI-generated JD profiles must be reviewed and approved by HR before they can be used in the screening process.
          </Notice>

          <Card className={styles.listCard}>
            <h2 className={styles.sectionTitle}>Pending Approvals ({pendingItems.length})</h2>

            {pendingItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No JD profiles pending approval.</p>
              </div>
            ) : (
              <div className={styles.itemList}>
                {pendingItems.map((item) => (
                  <div key={item.parsedProfile.id} className={styles.listItem}>
                    <div className={styles.itemHeader}>
                      <div>
                        <h3 className={styles.itemTitle}>{item.parsedProfile.title}</h3>
                        <p className={styles.itemMeta}>
                          Job: {item.jobTitle} • Version {item.jdVersion.versionNumber}
                        </p>
                      </div>
                      <StatusBadge variant="warning" label="Pending" />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemBadge}>{item.parsedProfile.seniority}</span>
                      <span className={styles.itemBadge}>{item.parsedProfile.skills.length} skills</span>
                      <span className={styles.itemBadge}>
                        Parsed v{item.parsedProfile.parsedCriteriaVersion}
                      </span>
                    </div>
                    <div className={styles.itemActions}>
                      <Button variant="primary" onClick={() => handleSelectItem(item)}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {(currentStep === 'review' || currentStep === 'approved' || currentStep === 'rejected') && selectedItem && (
        <div className={styles.workspace}>
          <Card className={styles.detailsCard}>
            <div className={styles.detailsHeader}>
              <div>
                <h2 className={styles.detailsTitle}>{selectedItem.parsedProfile.title}</h2>
                <p className={styles.detailsMeta}>
                  Job: {selectedItem.jobTitle} • Version {selectedItem.jdVersion.versionNumber}
                </p>
              </div>
              <StatusBadge variant={selectedItem.parsedProfile.status === 'approved' ? 'success' : 'warning'} label={selectedItem.parsedProfile.status === 'approved' ? 'Approved' : 'Pending'} />
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>Seniority</h3>
                <p className={styles.detailsText}>{selectedItem.parsedProfile.seniority}</p>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>Language Requirements</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.language.map((lang, idx) => (
                    <li key={idx}>{lang}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>Education</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.education.map((edu, idx) => (
                    <li key={idx}>{edu}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>Skills ({selectedItem.parsedProfile.skills.length})</h3>
                <div className={styles.skillsGrid}>
                  {selectedItem.parsedProfile.skills.map((skill, idx) => (
                    <span key={idx} className={styles.skillBadge}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>Responsibilities</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>Requirements</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className={styles.provenanceCard}>
            <h3 className={styles.provenanceTitle}>AI Provenance</h3>
            <div className={styles.provenanceMeta}>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>Parsed Criteria Version:</span>
                <span className={styles.provenanceValue}>v{selectedItem.parsedProfile.parsedCriteriaVersion}</span>
              </div>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>JD Version:</span>
                <span className={styles.provenanceValue}>{selectedItem.jdVersion.versionNumber}</span>
              </div>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>Created:</span>
                <span className={styles.provenanceValue}>
                  {formatDateTime(selectedItem.jdVersion.createdAt, locale)}
                </span>
              </div>
            </div>
          </Card>

          {currentStep === 'review' && (
            <>
              <Notice variant="warning" title="Approval Required">
                Please review the AI-parsed job description carefully. Once approved, this profile will be used for candidate screening.
              </Notice>

              <div className={styles.actions}>
                <Button variant="secondary" onClick={handleBackToList}>
                  Back to List
                </Button>
                <Button variant="danger" onClick={() => setShowRejectModal(true)}>
                  Reject
                </Button>
                <Button variant="primary" onClick={handleApprove}>
                  Approve
                </Button>
              </div>
            </>
          )}

          {currentStep === 'approved' && (
            <>
              <Notice variant="success" title="Approved">
                This JD profile has been approved and is now ready for candidate screening.
              </Notice>
              <div className={styles.actions}>
                <Button variant="primary" onClick={handleBackToList}>
                  Back to List
                </Button>
              </div>
            </>
          )}

          {currentStep === 'rejected' && (
            <>
              <Notice variant="danger" title="Rejected">
                This JD profile has been rejected. Reason: {rejectionReason}
              </Notice>
              <div className={styles.actions}>
                <Button variant="primary" onClick={handleBackToList}>
                  Back to List
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject JD Profile"
        >
          <div className={styles.modalContent}>
            <p className={styles.modalDescription}>
              Please provide a reason for rejecting this JD profile. This will help improve future AI parsing.
            </p>
            <div className={styles.formGroup}>
              <label htmlFor="rejectionReason">Rejection Reason *</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder="e.g., Missing key skills, incorrect seniority level, incomplete requirements..."
              />
            </div>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
