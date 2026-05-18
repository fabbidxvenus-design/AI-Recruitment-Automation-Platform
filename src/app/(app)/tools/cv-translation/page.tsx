'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { Card, Button, Notice, LoadingState, Modal } from '@/components';
import type { TranslatedCV, TargetLanguage, CVSection } from '@/types/cv-translation';
import { translateCV } from '@/services/translationService';
import { mockCandidates, mockJobs } from '@/lib/mockData';
import styles from './cv-translation.module.css';

type WorkflowStep = 'select' | 'generating' | 'review' | 'approved';

export default function CVTranslationPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [translatedCV, setTranslatedCV] = useState<TranslatedCV | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguage>('vi');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [translationError, setTranslationError] = useState<string>('');
  const getCandidateJobTitle = (jobId: string): string => mockJobs.find((job) => job.id === jobId)?.title ?? jobId;

  const handleTranslate = async (): Promise<void> => {
    if (!selectedCandidateId) return;

    setTranslationError('');
    setCurrentStep('generating');

    try {
      const result = await translateCV({
        candidateId: selectedCandidateId,
        targetLanguage: selectedLanguage,
      });

      if (!result.success || !result.data) {
        console.error('[CVTranslation] Translation failed:', result.error ?? 'Missing translated CV');
        setTranslationError(t('tools.cvTranslation.workspace.generationFailed'));
        setCurrentStep('select');
        return;
      }

      setTranslatedCV({
        ...result.data.translatedCV,
        status: 'pending_approval'
      });
      setCurrentStep('review');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[CVTranslation] Translation failed:', errorMessage);
      setTranslationError(t('tools.cvTranslation.workspace.generationFailed'));
      setCurrentStep('select');
    }
  };

  const handleApprove = (): void => {
    if (!translatedCV) return;

    setTranslatedCV({
      ...translatedCV,
      status: 'approved',
      approvedBy: 'hr.manager@company.com',
      approvedAt: new Date().toISOString(),
    });
    setCurrentStep('approved');
  };

  const handleReject = (): void => {
    if (!translatedCV || !rejectionReason.trim()) return;

    setTranslatedCV({
      ...translatedCV,
      status: 'rejected',
      rejectionReason,
    });
    setShowApprovalModal(false);
  };

  const handleReset = (): void => {
    setCurrentStep('select');
    setTranslatedCV(null);
    setSelectedCandidateId('');
    setSelectedLanguage('vi');
    setRejectionReason('');
    setTranslationError('');
  };

  return (
    <main id="main-content" className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/tools" className={styles.backLink}>
            ← {t('tools.hub.title')}
          </Link>
        </div>
        <h1 className={styles.title}>{t('tools.cvTranslation.title')}</h1>
        <p className={styles.description}>
          {t('tools.cvTranslation.description')}
        </p>
      </header>

      {currentStep === 'select' && (
        <>
          <Notice variant="info" title={t('tools.cvTranslation.workspace.sourceOfTruthTitle')}>
            {t('tools.cvTranslation.workspace.sourceOfTruthDesc')}
          </Notice>

          {translationError && (
            <Notice variant="danger" title={t('common.error.title')}>
              {translationError}
            </Notice>
          )}

          <Card className={styles.selectCard}>
            <h2 className={styles.sectionTitle}>{t('tools.cvTranslation.form.selectCandidate')}</h2>

            <div className={styles.formGroup}>
              <label htmlFor="candidateSelect">{t('tools.cvTranslation.form.selectCandidate')} *</label>
              <select
                id="candidateSelect"
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">{t('common.status.pending')}</option>
                {mockCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.firstName} {candidate.lastName} - {getCandidateJobTitle(candidate.jobId)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="languageSelect">{t('tools.cvTranslation.form.selectLanguage')} *</label>
              <select
                id="languageSelect"
                value={selectedLanguage}
                onChange={(e) => {
                  const VALID_LANGS: TargetLanguage[] = ['vi', 'en', 'ja'];
                  if (VALID_LANGS.includes(e.target.value as TargetLanguage)) {
                    setSelectedLanguage(e.target.value as TargetLanguage);
                  }
                }}
                className={styles.select}
                required
              >
                <option value="vi">{t('tools.cvTranslation.languages.vi')}</option>
                <option value="en">{t('tools.cvTranslation.languages.en')}</option>
                <option value="ja">{t('tools.cvTranslation.languages.ja')}</option>
              </select>
            </div>

            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={handleTranslate}
                disabled={!selectedCandidateId}
                aria-label={t('tools.cvTranslation.form.translateAria')}
              >
                {t('tools.cvTranslation.form.translate')}
              </Button>
            </div>
          </Card>
        </>
      )}

      {currentStep === 'generating' && (
        <Card className={styles.generatingCard}>
          <LoadingState text={t('tools.cvTranslation.workspace.generating')} />
        </Card>
      )}

      {(currentStep === 'review' || currentStep === 'approved') && translatedCV && (
        <div className={styles.workspace}>
          <div className={styles.workflowStepper}>
            <div className={`${styles.step} ${styles.stepComplete}`}>
              <span className={styles.stepLabel}>{t('tools.cvTranslation.steps.select.title')}</span>
            </div>
            <div className={`${styles.step} ${currentStep === 'review' ? styles.stepActive : currentStep === 'approved' ? styles.stepComplete : styles.stepPending}`}>
              <span className={styles.stepLabel}>{t('tools.cvTranslation.steps.review.title')}</span>
            </div>
            <div className={`${styles.step} ${currentStep === 'approved' ? styles.stepComplete : styles.stepPending}`}>
              <span className={styles.stepLabel}>{t('tools.cvTranslation.workspace.approved')}</span>
            </div>
          </div>
          <div className={styles.sideBySide}>
            <div className={styles.cvPanel}>
              <h2 className={styles.sectionTitle}>{t('tools.cvTranslation.workspace.original')}</h2>
              <Card className={styles.cvCard}>
                <h3 className={styles.candidateName}>{translatedCV.candidateName}</h3>
                {translatedCV.originalSections.map((section: CVSection) => (
                  <div key={section.id} className={styles.cvSection}>
                    <h4 className={styles.sectionTitleSmall}>{section.title}</h4>
                    <p className={styles.sectionContent}>{section.content}</p>
                  </div>
                ))}
              </Card>
            </div>

            <div className={styles.cvPanel}>
              <h2 className={styles.sectionTitle}>{t('tools.cvTranslation.workspace.translated')}</h2>
              <Card className={styles.cvCard}>
                <h3 className={styles.candidateName}>{translatedCV.candidateName}</h3>
                {translatedCV.translatedSections.map((section: CVSection) => (
                  <div key={section.id} className={styles.cvSection}>
                    <h4 className={styles.sectionTitleSmall}>{section.title}</h4>
                    <p className={styles.sectionContent}>{section.content}</p>
                  </div>
                ))}
              </Card>
            </div>
          </div>

          <Card className={styles.provenanceCard}>
            <h3>{t('tools.cvTranslation.workspace.provenance')}</h3>
            <div className={styles.provenanceMeta}>
              <span>{t('tools.cvTranslation.workspace.model')}: {translatedCV.aiModel}</span>
              <span>{t('tools.cvTranslation.workspace.confidence')}: {Math.round(translatedCV.confidence * 100)}%</span>
              <span>{t('tools.cvTranslation.workspace.translatedAt')}: {formatDateTime(translatedCV.translatedAt, locale)}</span>
            </div>
          </Card>

          {translatedCV.status === 'pending_approval' && (
            <Notice variant="warning" title={t('tools.cvTranslation.notice.approvalGate')}>
              {t('tools.cvTranslation.notice.approvalGateDesc')}
            </Notice>
          )}

          {currentStep === 'review' && (
            <div className={styles.actions}>
              <Button variant="secondary" onClick={handleReset}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={() => setShowApprovalModal(true)}>
                {t('tools.cvTranslation.workspace.reject')}
              </Button>
              <Button variant="primary" onClick={handleApprove}>
                {t('tools.cvTranslation.workspace.approve')}
              </Button>
            </div>
          )}

          {currentStep === 'approved' && translatedCV.status === 'approved' && (
            <Notice variant="success" title={t('tools.cvTranslation.workspace.approved')}>
              {t('tools.cvTranslation.workspace.approved')}
            </Notice>
          )}

          {translatedCV.status === 'rejected' && (
            <Notice variant="danger" title={t('tools.cvTranslation.workspace.rejected')}>
              {translatedCV.rejectionReason}
            </Notice>
          )}
        </div>
      )}

      {showApprovalModal && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={t('tools.cvTranslation.workspace.reject')}
        >
          <div className={styles.modalContent}>
            <div className={styles.formGroup}>
              <label htmlFor="rejectionReason">{t('tools.cvTranslation.workspace.rejectionReasonLabel')}</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={styles.textarea}
                rows={4}
              />
            </div>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                {t('tools.cvTranslation.workspace.reject')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}