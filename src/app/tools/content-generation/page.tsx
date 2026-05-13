'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Notice, LoadingState, StatusBadge, Modal } from '@/components';
import type { ContentBrief, GeneratedContent, ContentType, UserRole } from '@/types/content-generation';
import { simulateAIGeneration } from '@/lib/mock-content-data';
import styles from './content-generation.module.css';

type WorkflowStep = 'brief' | 'generating' | 'review' | 'approval' | 'export';

export default function ContentGenerationPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('brief');
  const [currentContent, setCurrentContent] = useState<GeneratedContent | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [clipboardError, setClipboardError] = useState<string>('');

  const [userRole] = useState<UserRole>('recruiter');

  const [brief, setBrief] = useState<ContentBrief>({
    contentType: 'job_description',
    jobTitle: '',
    department: '',
    experienceLevel: 'mid',
    keyRequirements: [],
    additionalNotes: '',
  });

  const handleGenerateContent = async (): Promise<void> => {
    setCurrentStep('generating');

    try {
      const result = await simulateAIGeneration(brief);

      const newContent: GeneratedContent = {
        id: `content-${Date.now()}`,
        brief,
        variants: result.variants,
        selectedVariantId: result.variants[0].id,
        status: 'generated',
        createdBy: 'recruiter@company.com',
        createdAt: new Date().toISOString(),
      };

      setCurrentContent(newContent);
      setSelectedVariantId(result.variants[0].id);
      setEditedContent(result.variants[0].content);
      setCurrentStep('review');
    } catch (error) {
      setCurrentStep('brief');
    }
  };

  const handleRequestApproval = () => {
    if (!currentContent) return;

    setCurrentContent({
      ...currentContent,
      status: 'pending_approval',
    });
    setCurrentStep('approval');
  };

  const handleApprove = () => {
    if (!currentContent) return;

    setCurrentContent({
      ...currentContent,
      status: 'approved',
      approvedBy: 'hr.manager@company.com',
      approvedAt: new Date().toISOString(),
    });
    setShowApprovalModal(false);
    setCurrentStep('export');
  };

  const handleReject = () => {
    if (!currentContent || !rejectionReason.trim()) return;

    setCurrentContent({
      ...currentContent,
      status: 'rejected',
      rejectionReason,
    });
    setShowApprovalModal(false);
    setCurrentStep('review');
  };

  const handleCopyToClipboard = async (): Promise<void> => {
    if (!editedContent) return;

    try {
      await navigator.clipboard.writeText(editedContent);
      setCopiedToClipboard(true);
      setClipboardError('');
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      setClipboardError(t('tools.contentGeneration.export.copyFailed') || 'Failed to copy to clipboard');
      setTimeout(() => setClipboardError(''), 3000);
    }
  };

  const handleDownload = (format: 'txt' | 'pdf' | 'docx'): void => {
    if (!editedContent || currentContent?.status !== 'approved') return;

    const sanitizedTitle = brief.jobTitle
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);

    const mimeTypes: Record<'txt' | 'pdf' | 'docx', string> = {
      txt: 'text/plain',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const blob = new Blob([editedContent], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedTitle}_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedVariant = currentContent?.variants.find(v => v.id === selectedVariantId);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/tools" className={styles.backLink}>
            ← {t('tools.hub.title')}
          </a>
        </div>
        <h1 className={styles.title}>{t('tools.contentGeneration.title')}</h1>
        <p className={styles.description}>
          {t('tools.contentGeneration.description')}
        </p>
      </header>

      <Notice variant="info" title={t('tools.contentGeneration.notice.aiGenerated')}>
        {t('tools.contentGeneration.notice.aiGeneratedDesc')}
      </Notice>

      {currentStep === 'brief' && (
        <Card className={styles.briefCard}>
          <h2 className={styles.sectionTitle}>{t('tools.contentGeneration.steps.input.title')}</h2>

          <div className={styles.formGroup}>
            <label htmlFor="contentType">{t('tools.contentGeneration.form.contentType')} *</label>
            <select
              id="contentType"
              value={brief.contentType}
              onChange={(e) => setBrief({ ...brief, contentType: e.target.value as ContentType })}
              className={styles.select}
              required
              aria-required="true"
            >
              <option value="job_description">{t('tools.contentGeneration.form.jobDescription')}</option>
              <option value="interview_questions">{t('tools.contentGeneration.form.interviewQuestions')}</option>
              <option value="email_template">{t('tools.contentGeneration.form.emailTemplate')}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jobTitle">{t('tools.contentGeneration.form.jobTitle')} *</label>
            <input
              id="jobTitle"
              type="text"
              value={brief.jobTitle}
              onChange={(e) => setBrief({ ...brief, jobTitle: e.target.value })}
              className={styles.input}
              required
              aria-required="true"
              aria-invalid={!brief.jobTitle && brief.jobTitle !== '' ? 'true' : 'false'}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="department">{t('tools.contentGeneration.form.department')} *</label>
            <input
              id="department"
              type="text"
              value={brief.department}
              onChange={(e) => setBrief({ ...brief, department: e.target.value })}
              className={styles.input}
              required
              aria-required="true"
              aria-invalid={!brief.department && brief.department !== '' ? 'true' : 'false'}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="experienceLevel">{t('tools.contentGeneration.form.experienceLevel')} *</label>
            <select
              id="experienceLevel"
              value={brief.experienceLevel}
              onChange={(e) => setBrief({ ...brief, experienceLevel: e.target.value as 'entry' | 'mid' | 'senior' | 'lead' })}
              className={styles.select}
              required
              aria-required="true"
            >
              <option value="entry">{t('tools.contentGeneration.form.entry')}</option>
              <option value="mid">{t('tools.contentGeneration.form.mid')}</option>
              <option value="senior">{t('tools.contentGeneration.form.senior')}</option>
              <option value="lead">{t('tools.contentGeneration.form.lead')}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="keyRequirements">{t('tools.contentGeneration.form.keyRequirements')} *</label>
            <textarea
              id="keyRequirements"
              value={brief.keyRequirements.join('\n')}
              onChange={(e) => setBrief({ ...brief, keyRequirements: e.target.value.split('\n').filter(r => r.trim()) })}
              placeholder={t('tools.contentGeneration.form.requirementsPlaceholder')}
              className={styles.textarea}
              rows={4}
              required
              aria-required="true"
              aria-invalid={brief.keyRequirements.length === 0 ? 'true' : 'false'}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="additionalNotes">{t('tools.contentGeneration.form.additionalNotes')}</label>
            <textarea
              id="additionalNotes"
              value={brief.additionalNotes}
              onChange={(e) => setBrief({ ...brief, additionalNotes: e.target.value })}
              placeholder={t('tools.contentGeneration.form.notesPlaceholder')}
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={handleGenerateContent}
              disabled={!brief.jobTitle || !brief.department || brief.keyRequirements.length === 0}
            >
              {t('tools.contentGeneration.form.generate')}
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 'generating' && (
        <Card className={styles.generatingCard}>
          <LoadingState text={t('tools.contentGeneration.workspace.generating')} />
        </Card>
      )}

      {(currentStep === 'review' || currentStep === 'approval' || currentStep === 'export') && currentContent && (
        <div className={styles.workspace}>
          <div className={styles.variantsPanel}>
            <h2 className={styles.sectionTitle}>{t('tools.contentGeneration.workspace.variants')}</h2>
            <div role="radiogroup" aria-label={t('tools.contentGeneration.workspace.variants')}>
              {currentContent.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  className={`${styles.variantCard} ${selectedVariantId === variant.id ? styles.variantCardSelected : ''}`}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setEditedContent(variant.content);
                    setIsEditing(false);
                  }}
                  role="radio"
                  aria-checked={selectedVariantId === variant.id}
                >
                  <Card>
                    <h3 className={styles.variantTitle}>{variant.title}</h3>
                    <div className={styles.variantMeta}>
                      <span>{t('tools.contentGeneration.workspace.model')}: {variant.aiModel}</span>
                      <span>{t('tools.contentGeneration.workspace.confidence')}: {Math.round(variant.confidence * 100)}%</span>
                    </div>
                  </Card>
                </button>
              ))}
            </div>

            {currentContent.status === 'pending_approval' && (
              <Notice variant="warning" title={t('tools.contentGeneration.notice.approvalGate')}>
                {t('tools.contentGeneration.notice.approvalGateDesc')}
              </Notice>
            )}

            {currentContent.status === 'approved' && (
              <Notice variant="success" title={t('common.status.approved')}>
                {t('tools.contentGeneration.approval.submittedBy')}: {currentContent.approvedBy}
              </Notice>
            )}
          </div>

          <div className={styles.contentPanel}>
            <div className={styles.contentHeader}>
              <h2 className={styles.sectionTitle}>{t('tools.contentGeneration.workspace.selectedContent')}</h2>
              <StatusBadge label={currentContent.status} variant={currentContent.status === 'approved' ? 'success' : currentContent.status === 'pending_approval' ? 'warning' : 'default'} />
            </div>

            {selectedVariant && (
              <Card className={styles.provenanceCard}>
                <h3>{t('tools.contentGeneration.workspace.aiProvenance')}</h3>
                <div className={styles.provenanceMeta}>
                  <span>{t('tools.contentGeneration.workspace.model')}: {selectedVariant.aiModel}</span>
                  <span>{t('tools.contentGeneration.workspace.confidence')}: {Math.round(selectedVariant.confidence * 100)}%</span>
                  <span>{t('tools.contentGeneration.workspace.generatedAt')}: {new Date(selectedVariant.generatedAt).toLocaleString()}</span>
                </div>
              </Card>
            )}

            <Card className={styles.contentCard}>
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className={styles.contentEditor}
                  rows={20}
                  aria-label={t('tools.contentGeneration.workspace.editedContent')}
                />
              ) : (
                <pre className={styles.contentDisplay} aria-label={t('tools.contentGeneration.workspace.selectedContent')}>{editedContent}</pre>
              )}
            </Card>

            <div className={styles.actions}>
              {currentStep === 'review' && (
                <>
                  <Button variant="secondary" onClick={() => setCurrentStep('brief')}>
                    {t('tools.contentGeneration.workspace.backToBrief')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? t('tools.contentGeneration.workspace.save') : t('tools.contentGeneration.workspace.edit')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleRequestApproval}
                    disabled={currentContent.status === 'pending_approval'}
                  >
                    {t('tools.contentGeneration.workspace.requestApproval')}
                  </Button>
                </>
              )}

              {currentStep === 'approval' && userRole === 'hr_manager' && (
                <>
                  <Button variant="secondary" onClick={() => setCurrentStep('review')}>
                    {t('common.cancel')}
                  </Button>
                  <Button variant="danger" onClick={() => setShowApprovalModal(true)}>
                    {t('tools.contentGeneration.approval.reject')}
                  </Button>
                  <Button variant="primary" onClick={handleApprove}>
                    {t('tools.contentGeneration.approval.approve')}
                  </Button>
                </>
              )}

              {currentStep === 'export' && currentContent.status === 'approved' && (
                <>
                  <Button variant="secondary" onClick={handleCopyToClipboard}>
                    {copiedToClipboard ? t('tools.contentGeneration.export.copied') : t('tools.contentGeneration.export.copyToClipboard')}
                  </Button>
                  <Button variant="primary" onClick={() => setShowExportModal(true)}>
                    {t('tools.contentGeneration.workspace.export')}
                  </Button>
                </>
              )}
            </div>

            {clipboardError && (
              <div role="alert" aria-live="assertive">
                <Notice variant="danger" title={t('common.status.failed')}>
                  {clipboardError}
                </Notice>
              </div>
            )}

            {copiedToClipboard && (
              <div role="status" aria-live="polite" className="sr-only">
                {t('tools.contentGeneration.export.copied')}
              </div>
            )}
          </div>
        </div>
      )}

      {showApprovalModal && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={t('tools.contentGeneration.approval.reject')}
        >
          <div className={styles.modalContent}>
            <p>{t('tools.contentGeneration.approval.description')}</p>
            <div className={styles.formGroup}>
              <label htmlFor="rejectionReason">{t('tools.contentGeneration.approval.rejectionReason')}</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('tools.contentGeneration.approval.rejectionPlaceholder')}
                className={styles.textarea}
                rows={4}
              />
            </div>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()}>
                {t('tools.contentGeneration.approval.reject')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title={t('tools.contentGeneration.export.title')}
        >
          <div className={styles.modalContent}>
            <p>{t('tools.contentGeneration.export.format')}</p>
            <div className={styles.exportOptions}>
              <Button variant="secondary" onClick={() => handleDownload('txt')}>
                TXT
              </Button>
              <Button variant="secondary" onClick={() => handleDownload('pdf')}>
                PDF (simulated)
              </Button>
              <Button variant="secondary" onClick={() => handleDownload('docx')}>
                DOCX (simulated)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
