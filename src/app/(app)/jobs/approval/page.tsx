'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { Card, Button, Notice, StatusBadge, Modal } from '@/components';
import type { ParsedJDProfile, JDVersion } from '@/types';
import { mockParsedJDProfiles, mockJDVersions, mockJobs } from '@/lib/jobIntakeMockData';
import styles from './jd-approval.module.css';

type WorkflowStep = 'list' | 'review' | 'approved' | 'rejected';
type ValidationState = 'approved' | 'rejected' | 'incomplete' | 'pending';

const requiredCriteria: (keyof Pick<ParsedJDProfile, 'skills' | 'responsibilities' | 'requirements' | 'language' | 'education'>)[] = [
  'skills',
  'responsibilities',
  'requirements',
  'language',
  'education',
];

interface JDApprovalItem {
  parsedProfile: ParsedJDProfile;
  jdVersion: JDVersion;
  jobTitle: string;
}

function getMissingCriteria(profile: ParsedJDProfile): string[] {
  const missingList = requiredCriteria.filter((criterion) => profile[criterion].length === 0);
  return profile.seniority.trim() ? missingList : [...missingList, 'seniority'];
}

function getValidationState(profile: ParsedJDProfile, decision: ValidationState | undefined): ValidationState {
  if (decision === 'rejected') return 'rejected';
  if (profile.status === 'approved') return 'approved';
  if (getMissingCriteria(profile).length > 0) return 'incomplete';
  return 'pending';
}

export default function JDApprovalPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('list');
  const [selectedItem, setSelectedItem] = useState<JDApprovalItem | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [decisionByProfileId, setDecisionByProfileId] = useState<Record<string, ValidationState>>({});

  // Filter pending JD profiles
  const pendingItems: JDApprovalItem[] = mockParsedJDProfiles
    .filter((profile) => profile.status === 'draft')
    .map((profile) => {
      const jdVersion = mockJDVersions.find((v) => v.id === profile.jdVersionId);
      const job = mockJobs.find((j) => j.id === jdVersion?.jobId);
      return {
        parsedProfile: profile,
        jdVersion: jdVersion!,
        jobTitle: job?.title || t('jobs.approval.unknownJob'),
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
    setDecisionByProfileId({ ...decisionByProfileId, [selectedItem.parsedProfile.id]: 'approved' });
    setCurrentStep('approved');
  };

  const handleReject = (): void => {
    if (!selectedItem || !rejectionReason.trim()) return;

    setDecisionByProfileId({ ...decisionByProfileId, [selectedItem.parsedProfile.id]: 'rejected' });
    setCurrentStep('rejected');
    setShowRejectModal(false);
  };

  const handleBackToList = (): void => {
    setCurrentStep('list');
    setSelectedItem(null);
    setRejectionReason('');
  };

  const selectedDecision = selectedItem ? decisionByProfileId[selectedItem.parsedProfile.id] : undefined;
  const validationState = selectedItem ? getValidationState(selectedItem.parsedProfile, selectedDecision) : 'pending';
  const missingCriteria = selectedItem ? getMissingCriteria(selectedItem.parsedProfile) : [];
  const missingCriteriaLabels = missingCriteria.map((criterion) => t(`jobs.approval.validation.fields.${criterion}`));
  const canUseForScreening = validationState === 'approved';

  return (
    <main id="main-content" className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/jobs/intake" className={styles.backLink}>
            {t('jobs.approval.workflow.backToJobs')}
          </a>
        </div>
        <h1 className={styles.title}>{t('jobs.approval.workflow.title')}</h1>
        <p className={styles.description}>{t('jobs.approval.workflow.description')}</p>
      </header>

      {currentStep === 'list' && (
        <>
          <Notice variant="info" title={t('jobs.approval.workflow.gateTitle')}>
            {t('jobs.approval.workflow.gateBody')}
          </Notice>

          <Card className={styles.listCard}>
            <h2 className={styles.sectionTitle}>
              {t('jobs.approval.workflow.pendingApprovals', { count: pendingItems.length })}
            </h2>

            {pendingItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('jobs.approval.workflow.empty')}</p>
              </div>
            ) : (
              <div className={styles.itemList}>
                {pendingItems.map((item) => (
                  <div key={item.parsedProfile.id} className={styles.listItem}>
                    <div className={styles.itemHeader}>
                      <div>
                        <h3 className={styles.itemTitle}>{item.parsedProfile.title}</h3>
                        <p className={styles.itemMeta}>
                          {t('jobs.approval.workflow.jobMeta', { jobTitle: item.jobTitle, version: item.jdVersion.versionNumber })}
                        </p>
                      </div>
                      <StatusBadge variant="warning" label={t('jobs.approval.workflow.pending')} />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemBadge}>{item.parsedProfile.seniority}</span>
                      <span className={styles.itemBadge}>
                        {t('jobs.approval.workflow.skillsCount', { count: item.parsedProfile.skills.length })}
                      </span>
                      <span className={styles.itemBadge}>
                        {t('jobs.approval.workflow.parsedVersion', { version: item.parsedProfile.parsedCriteriaVersion })}
                      </span>
                    </div>
                    <div className={styles.itemActions}>
                      <Button
                        variant="primary"
                        aria-label={t('jobs.approval.workflow.reviewAria', { title: item.parsedProfile.title })}
                        onClick={() => handleSelectItem(item)}
                      >
                        {t('jobs.approval.workflow.review')}
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
                  {t('jobs.approval.workflow.jobMeta', { jobTitle: selectedItem.jobTitle, version: selectedItem.jdVersion.versionNumber })}
                </p>
              </div>
              <StatusBadge
                variant={validationState === 'approved' ? 'success' : validationState === 'rejected' ? 'danger' : 'warning'}
                label={t(`jobs.approval.validationState.${validationState}`)}
              />
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>{t('jobs.approval.details.seniority')}</h3>
                <p className={styles.detailsText}>{selectedItem.parsedProfile.seniority}</p>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>{t('jobs.approval.details.languageRequirements')}</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.language.map((lang, idx) => (
                    <li key={idx}>{lang}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>{t('jobs.approval.details.education')}</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.education.map((edu, idx) => (
                    <li key={idx}>{edu}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>{t('jobs.approval.details.skills', { count: selectedItem.parsedProfile.skills.length })}</h3>
                <div className={styles.skillsGrid}>
                  {selectedItem.parsedProfile.skills.map((skill, idx) => (
                    <span key={idx} className={styles.skillBadge}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>{t('jobs.approval.details.responsibilities')}</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsSectionTitle}>{t('jobs.approval.details.requirements')}</h3>
                <ul className={styles.detailsList}>
                  {selectedItem.parsedProfile.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className={styles.provenanceCard}>
            <h3 className={styles.provenanceTitle}>{t('jobs.approval.validation.title')}</h3>
            <div className={styles.validationGrid}>
              <div className={styles.validationItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.validation.screeningUse')}</span>
                <span className={styles.provenanceValue}>
                  {canUseForScreening ? t('jobs.approval.validation.allowed') : t('jobs.approval.validation.blocked')}
                </span>
              </div>
              <div className={styles.validationItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.validation.minimumCriteria')}</span>
                <span className={styles.provenanceValue}>
                  {missingCriteria.length === 0 ? t('jobs.approval.validation.complete') : t('jobs.approval.validation.incompleteCount', { count: missingCriteria.length })}
                </span>
              </div>
            </div>
            {missingCriteria.length > 0 && (
              <Notice variant="warning" title={t('jobs.approval.validation.valJob002Title')}>
                {t('jobs.approval.validation.valJob002Body', { fields: missingCriteriaLabels.join(', ') })}
              </Notice>
            )}
          </Card>

          <Card className={styles.provenanceCard}>
            <h3 className={styles.provenanceTitle}>{t('jobs.approval.provenance.title')}</h3>
            <div className={styles.provenanceMeta}>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.provenance.model')}</span>
                <span className={styles.provenanceValue}>{t('jobs.approval.provenance.modelValue')}</span>
              </div>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.provenance.promptVersion')}</span>
                <span className={styles.provenanceValue}>{t('jobs.approval.provenance.promptVersionValue')}</span>
              </div>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.provenance.confidence')}</span>
                <span className={styles.provenanceValue}>{t('jobs.approval.provenance.confidenceValue', { value: missingCriteria.length === 0 ? '94%' : '71%' })}</span>
              </div>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.provenance.parsedCriteriaVersion')}</span>
                <span className={styles.provenanceValue}>v{selectedItem.parsedProfile.parsedCriteriaVersion}</span>
              </div>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.provenance.jdVersion')}</span>
                <span className={styles.provenanceValue}>{selectedItem.jdVersion.versionNumber}</span>
              </div>
              <div className={styles.provenanceItem}>
                <span className={styles.provenanceLabel}>{t('jobs.approval.provenance.created')}</span>
                <span className={styles.provenanceValue}>
                  {formatDateTime(selectedItem.jdVersion.createdAt, locale)}
                </span>
              </div>
            </div>
          </Card>

          {currentStep === 'review' && (
            <>
              <Notice variant="warning" title={t('jobs.approval.workflow.approvalRequiredTitle')}>
                {t('jobs.approval.workflow.approvalRequiredBody')}
              </Notice>

              <div className={styles.actions}>
                <Button variant="secondary" onClick={handleBackToList}>
                  {t('jobs.approval.actions.backToList')}
                </Button>
                <Button variant="danger" onClick={() => setShowRejectModal(true)}>
                  {t('jobs.approval.actions.reject')}
                </Button>
                <Button variant="primary" onClick={handleApprove}>
                  {t('jobs.approval.actions.approve')}
                </Button>
              </div>
            </>
          )}

          {currentStep === 'approved' && (
            <>
              <Notice variant="success" title={t('jobs.approval.workflow.approvedTitle')}>
                {t('jobs.approval.workflow.approvedBody')}
              </Notice>
              <Card className={styles.timelineCard}>
                <h3 className={styles.timelineTitle}>{t('jobs.approval.timeline.title')}</h3>
                <div className={styles.timeline}>
                  <div className={styles.timelineStep}>
                    <span className={styles.timelineDotCompleted}></span>
                    <span className={styles.timelineLabel}>{t('jobs.approval.timeline.review')}</span>
                  </div>
                  <div className={styles.timelineStep}>
                    <span className={styles.timelineDotCompleted}></span>
                    <span className={styles.timelineLabel}>{t('jobs.approval.timeline.approved')}</span>
                  </div>
                </div>
              </Card>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={handleBackToList}>
                  {t('jobs.approval.actions.backToList')}
                </Button>
                <Link href="/screening/review">
                  <Button variant="primary">
                    {t('jobs.approval.workflow.nextAction')}
                  </Button>
                </Link>
              </div>
              <p className={styles.nextActionHint}>{t('jobs.approval.workflow.nextActionHint')}</p>
            </>
          )}

          {currentStep === 'rejected' && (
            <>
              <Notice variant="danger" title={t('jobs.approval.workflow.rejectedTitle')}>
                {t('jobs.approval.workflow.rejectedBody', { reason: rejectionReason })}
              </Notice>
              <Card className={styles.timelineCard}>
                <h3 className={styles.timelineTitle}>{t('jobs.approval.timeline.title')}</h3>
                <div className={styles.timeline}>
                  <div className={styles.timelineStep}>
                    <span className={styles.timelineDotCompleted}></span>
                    <span className={styles.timelineLabel}>{t('jobs.approval.timeline.review')}</span>
                  </div>
                  <div className={styles.timelineStep}>
                    <span className={styles.timelineDotRejected}></span>
                    <span className={styles.timelineLabel}>{t('jobs.approval.timeline.rejected')}</span>
                  </div>
                </div>
              </Card>
              <div className={styles.actions}>
                <Button variant="primary" onClick={handleBackToList}>
                  {t('jobs.approval.actions.backToList')}
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
          title={t('jobs.approval.modal.title')}
        >
          <div className={styles.modalContent}>
            <p className={styles.modalDescription}>{t('jobs.approval.modal.description')}</p>
            <div className={styles.formGroup}>
              <label htmlFor="rejectionReason">{t('jobs.approval.modal.reasonLabel')}</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder={t('jobs.approval.modal.reasonPlaceholder')}
              />
            </div>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                {t('jobs.approval.modal.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                {t('jobs.approval.modal.confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
