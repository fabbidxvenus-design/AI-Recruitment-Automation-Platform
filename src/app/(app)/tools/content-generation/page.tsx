'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { createBrowserClient } from '@/lib/supabase/browser';
import { getProfileRole } from '@/services/auth/roles';
import { Card, Button, Notice, LoadingState, StatusBadge, Modal } from '@/components';
import type { ContentBrief, GeneratedContent, ContentType, UserRole, ApprovalHistoryEntry } from '@/types/content-generation';
import { simulateAIGeneration } from '@/lib/mock-content-data';
import styles from './content-generation.module.css';

type WorkflowStep = 'brief' | 'generating' | 'review' | 'approval' | 'export';

export default function ContentGenerationPage() {
  const { t } = useTranslation();
  const supabase = createBrowserClient();
  const [userRole, setUserRole] = useState<UserRole>('hr_manager');
  const [roleLoading, setRoleLoading] = useState(true);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string>('');
  const [roleError, setRoleError] = useState<string>('');
  const { locale } = useLanguage();
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
  const [generationError, setGenerationError] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [publishingChannel, setPublishingChannel] = useState<string | null>(null);
  const [publishedChannels, setPublishedChannels] = useState<Record<string, string>>({});
  const [lastPublishedChannel, setLastPublishedChannel] = useState<string | null>(null);
  const clipboardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipboardErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const publishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch real role from Supabase on mount
  useEffect(() => {
    async function loadRole() {
      try {
        const role = await getProfileRole(supabase);
        const validRole: UserRole = role === 'hr_manager' || role === 'recruiter' ? role : 'recruiter';
        setUserRole(validRole);
      } catch (error) {
        console.error('[ContentGeneration] Failed to load role:', error);
        setRoleError(t('tools.contentGeneration.error.loadRoleFailed', { defaultValue: 'Failed to load user role. Falling back to default role.' }));
      } finally {
        setRoleLoading(false);
      }
    }
    loadRole();
  }, [supabase, t]);

  useEffect(() => {
    return () => {
      if (clipboardTimerRef.current) clearTimeout(clipboardTimerRef.current);
      if (clipboardErrorTimerRef.current) clearTimeout(clipboardErrorTimerRef.current);
      if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
    };
  }, []);

  const mockHistory: ApprovalHistoryEntry[] = [
    {
      id: 'h1',
      contentId: 'mock-1',
      action: 'submitted',
      actor: 'recruiter@company.com',
      actorKey: 'recruiter',
      actorRole: 'recruiter',
      timestamp: '2026-05-12T18:00:00.000Z',
    },
    {
      id: 'h2',
      contentId: 'mock-1',
      action: 'edited',
      actor: 'hr.manager@company.com',
      actorKey: 'hrManager',
      actorRole: 'hr_manager',
      timestamp: '2026-05-13T06:00:00.000Z',
      notes: 'Updated requirements section for clarity',
      notesKey: 'requirementsUpdated',
    },
    {
      id: 'h3',
      contentId: 'mock-1',
      action: 'rejected',
      actor: 'hr.manager@company.com',
      actorKey: 'hrManager',
      actorRole: 'hr_manager',
      timestamp: '2026-05-13T18:00:00.000Z',
      notes: 'Still needs more emphasis on soft skills',
      notesKey: 'softSkillsNeeded',
    },
    {
      id: 'h4',
      contentId: 'mock-1',
      action: 'edited',
      actor: 'recruiter@company.com',
      actorKey: 'recruiter',
      actorRole: 'recruiter',
      timestamp: '2026-05-14T06:00:00.000Z',
      notes: 'Added soft skills section as requested',
      notesKey: 'softSkillsAdded',
    },
    {
      id: 'h5',
      contentId: 'mock-1',
      action: 'approved',
      actor: 'hr.manager@company.com',
      actorKey: 'hrManager',
      actorRole: 'hr_manager',
      timestamp: '2026-05-14T17:00:00.000Z',
    }
  ];

  const handlePublish = async (channelId: string) => {
    setPublishLoading(true);
    setPublishingChannel(channelId);
    setPublishError('');
    try {
      // Simulate async publish operation
      await new Promise((resolve) => {
        publishTimerRef.current = setTimeout(resolve, 1000);
      });
      setPublishedChannels(prev => ({
        ...prev,
        [channelId]: new Date().toISOString()
      }));
      setLastPublishedChannel(channelId);
    } catch (error) {
      console.error('[ContentGeneration] Publish failed', error);
      setPublishError(t('tools.contentGeneration.publish.failedToPublish') || 'Failed to prepare export package');
    } finally {
      setPublishLoading(false);
      setPublishingChannel(null);
    }
  };

  const channels = [
    { id: 'linkedin', name: t('tools.contentGeneration.publish.channels.linkedin') },
    { id: 'facebook', name: t('tools.contentGeneration.publish.channels.facebook') },
    { id: 'email', name: t('tools.contentGeneration.publish.channels.email') },
    { id: 'internal', name: t('tools.contentGeneration.publish.channels.internal') },
  ];

  const [brief, setBrief] = useState<ContentBrief>({
    contentType: 'job_description',
    jobTitle: '',
    department: '',
    experienceLevel: 'mid',
    keyRequirements: [],
    additionalNotes: '',
  });
  const [touchedFields, setTouchedFields] = useState({
    jobTitle: false,
    department: false,
    keyRequirements: false,
  });
  const variantRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const focusedIndex = currentContent?.variants.findIndex(v => v.id === selectedVariantId);
    if (focusedIndex !== undefined && focusedIndex >= 0 && variantRefs.current[focusedIndex]) {
      variantRefs.current[focusedIndex]?.focus();
    }
  }, [selectedVariantId, currentContent]);

  const handleGenerateContent = async (): Promise<void> => {
    setGenerationError('');
    setCurrentStep('generating');

    try {
      const result = await simulateAIGeneration(brief);

      if (!result.variants.length) {
        console.error('[ContentGeneration] AI returned empty variants');
        setGenerationError(t('tools.contentGeneration.workspace.noVariants'));
        setCurrentStep('brief');
        return;
      }

      const newContent: GeneratedContent = {
        id: `content-${Date.now()}`,
        brief,
        variants: result.variants,
        selectedVariantId: result.variants[0].id,
        status: 'generated',
        createdBy: 'recruiter@company.com',
        createdAt: new Date().toISOString(),
        isAiGenerated: true,
      };

      setCurrentContent(newContent);
      setSelectedVariantId(result.variants[0].id);
      setEditedContent(result.variants[0].content);
      setCurrentStep('review');
    } catch (error: unknown) {
      console.error('[ContentGeneration] Content generation failed:', error);
      setGenerationError(t('tools.contentGeneration.workspace.generationFailed'));
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
      approvedBy: t('tools.contentGeneration.history.actor.hrManager'),
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
      if (clipboardTimerRef.current) clearTimeout(clipboardTimerRef.current);
      clipboardTimerRef.current = setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('[ContentGeneration] Clipboard copy failed', error);
      setClipboardError(t('tools.contentGeneration.export.copyFailed') || 'Failed to copy to clipboard');
      if (clipboardErrorTimerRef.current) clearTimeout(clipboardErrorTimerRef.current);
      clipboardErrorTimerRef.current = setTimeout(() => setClipboardError(''), 3000);
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

  const selectVariant = (variant: GeneratedContent['variants'][number]): void => {
    setSelectedVariantId(variant.id);
    setEditedContent(variant.content);
    setIsEditing(false);
  };

  const handleVariantKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (!currentContent) return;

    const { variants } = currentContent;
    const lastIndex = variants.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: index === lastIndex ? 0 : index + 1,
      ArrowRight: index === lastIndex ? 0 : index + 1,
      ArrowUp: index === 0 ? lastIndex : index - 1,
      ArrowLeft: index === 0 ? lastIndex : index - 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();
    selectVariant(variants[nextIndex]);
  };

  const selectedVariant = currentContent?.variants.find(v => v.id === selectedVariantId);
  const currentContentStatusLabel = currentContent ? t(`common.status.${currentContent.status}`) : '';

  return (
    <main id="main-content" className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/tools" className={styles.backLink}>
            ← {t('tools.hub.title')}
          </Link>
        </div>
        <h1 className={styles.title}>{t('tools.contentGeneration.title')}</h1>
        <p className={styles.description}>
          {t('tools.contentGeneration.description')}
        </p>
      </header>

      {roleError && (
        <Notice role="alert" variant="warning" title={t('common.error.title')}>
          {roleError}
        </Notice>
      )}
      {roleLoading && (
        <LoadingState text={t('common.loading')} />
      )}

      <Notice variant="info" title={t('tools.contentGeneration.notice.aiGenerated')}>
        {t('tools.contentGeneration.notice.aiGeneratedDesc')}
      </Notice>

      {generationError && (
        <Notice variant="danger" title={t('common.error.title')}>
          {generationError}
        </Notice>
      )}

      {currentStep === 'brief' && (
        <Card className={styles.briefCard}>
          <h2 className={styles.sectionTitle}>{t('tools.contentGeneration.steps.input.title')}</h2>
          <p className={styles.stepDescription}>{t('tools.contentGeneration.steps.input.description')}</p>

          <div className={styles.formGroup}>
            <label htmlFor="contentType">{t('tools.contentGeneration.form.contentType')} *</label>
            <select
              id="contentType"
              value={brief.contentType}
              onChange={(e) => {
                const VALID_TYPES: ContentType[] = ['job_description', 'interview_questions', 'email_template'];
                if (VALID_TYPES.includes(e.target.value as ContentType)) {
                  setBrief((prev) => ({ ...prev, contentType: e.target.value as ContentType }));
                }
              }}
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
              onChange={(e) => setBrief((prev) => ({ ...prev, jobTitle: e.target.value }))}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, jobTitle: true }))}
              className={styles.input}
              required
              aria-required="true"
              aria-invalid={touchedFields.jobTitle && brief.jobTitle.trim().length === 0}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="department">{t('tools.contentGeneration.form.department')} *</label>
            <input
              id="department"
              type="text"
              value={brief.department}
              onChange={(e) => setBrief((prev) => ({ ...prev, department: e.target.value }))}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, department: true }))}
              className={styles.input}
              required
              aria-required="true"
              aria-invalid={touchedFields.department && brief.department.trim().length === 0}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="experienceLevel">{t('tools.contentGeneration.form.experienceLevel')} *</label>
            <select
              id="experienceLevel"
              value={brief.experienceLevel}
              onChange={(e) => setBrief((prev) => ({ ...prev, experienceLevel: e.target.value as 'entry' | 'mid' | 'senior' | 'lead' }))}
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
              onChange={(e) => setBrief((prev) => ({ ...prev, keyRequirements: e.target.value.split('\n').filter(r => r.trim()) }))}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, keyRequirements: true }))}
              placeholder={t('tools.contentGeneration.form.requirementsPlaceholder')}
              className={styles.textarea}
              rows={4}
              required
              aria-required="true"
              aria-invalid={touchedFields.keyRequirements && brief.keyRequirements.length === 0}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="additionalNotes">{t('tools.contentGeneration.form.additionalNotes')}</label>
            <textarea
              id="additionalNotes"
              value={brief.additionalNotes}
              onChange={(e) => setBrief((prev) => ({ ...prev, additionalNotes: e.target.value }))}
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
            <div className={styles.workflowStepper}>
              <div className={`${styles.step} ${styles.stepComplete}`}>
                <span className={styles.stepLabel}>{t('tools.contentGeneration.steps.input.title')}</span>
              </div>
              <div className={`${styles.step} ${styles.stepActive}`}>
                <span className={styles.stepLabel}>{t('tools.contentGeneration.steps.review.title')}</span>
              </div>
              <div className={`${styles.step} ${currentStep === 'approval' ? styles.stepActive : currentStep === 'export' ? styles.stepComplete : styles.stepPending}`}>
                <span className={styles.stepLabel}>{t('tools.contentGeneration.approval.title')}</span>
              </div>
              <div className={`${styles.step} ${currentStep === 'export' ? styles.stepActive : styles.stepPending}`}>
                <span className={styles.stepLabel}>{t('tools.contentGeneration.steps.export.title')}</span>
              </div>
            </div>
            <h2 className={styles.sectionTitle}>{t('tools.contentGeneration.workspace.variants')}</h2>
            <div role="radiogroup" aria-label={t('tools.contentGeneration.workspace.variants')}>
              {currentContent.variants.map((variant, index) => (
                <button
                  key={variant.id}
                  ref={(element) => {
                    variantRefs.current[index] = element;
                  }}
                  type="button"
                  className={`${styles.variantCard} ${selectedVariantId === variant.id ? styles.variantCardSelected : ''}`}
                  onClick={() => selectVariant(variant)}
                  onKeyDown={(e) => handleVariantKeyDown(e, index)}
                  role="radio"
                  aria-checked={selectedVariantId === variant.id}
                  tabIndex={selectedVariantId === variant.id ? 0 : -1}
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

            <div className={styles.historySection}>
              <details open={showHistory} onToggle={(e) => setShowHistory((e.target as HTMLDetailsElement).open)}>
                <summary className={styles.sectionTitle} style={{ cursor: 'pointer', listStyle: 'none' }}>
                  <span aria-hidden="true">{showHistory ? '▼' : '▶'}</span> {t('tools.contentGeneration.history.title')}
                </summary>
                <div className={styles.historyTimeline}>
                  {mockHistory.length > 0 ? (
                    mockHistory.map((entry) => {
                      const actorLabel = entry.actorKey
                        ? t(`tools.contentGeneration.history.actor.${entry.actorKey}`)
                        : entry.actor;
                      const noteLabel = entry.notesKey
                        ? t(`tools.contentGeneration.history.note.${entry.notesKey}`)
                        : entry.notes;

                      return (
                        <div key={entry.id} className={styles.historyEntry}>
                          <strong>{t(`tools.contentGeneration.history.action.${entry.action}`)}</strong>
                          <div className={styles.historyMeta}>
                            <span>{actorLabel} ({t(`tools.contentGeneration.history.role.${entry.actorRole}`)})</span>
                            <span aria-hidden="true">•</span>
                            <span>{formatDateTime(entry.timestamp, locale)}</span>
                          </div>
                          {noteLabel && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', fontStyle: 'italic' }}>&ldquo;{noteLabel}&rdquo;</p>}
                        </div>
                      );
                    })
                  ) : (
                    <p className={styles.noHistory}>{t('tools.contentGeneration.history.noHistory')}</p>
                  )}
                </div>
              </details>
            </div>
          </div>

          <div className={styles.contentPanel}>
            <div className={styles.contentHeader}>
              <h2 className={styles.sectionTitle}>{t('tools.contentGeneration.workspace.selectedContent')}</h2>
              <StatusBadge label={currentContentStatusLabel} variant={currentContent.status === 'approved' ? 'success' : currentContent.status === 'pending_approval' ? 'warning' : 'default'} />
            </div>

            {selectedVariant && (
              <Card className={styles.provenanceCard}>
                <h3>{t('tools.contentGeneration.workspace.aiProvenance')}</h3>
                <div className={styles.provenanceMeta}>
                  <span>{t('tools.contentGeneration.workspace.model')}: {selectedVariant.aiModel}</span>
                  <span>{t('tools.contentGeneration.workspace.confidence')}: {Math.round(selectedVariant.confidence * 100)}%</span>
                  <span>{t('tools.contentGeneration.workspace.generatedAt')}: {formatDateTime(selectedVariant.generatedAt, locale)}</span>
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

              {currentStep === 'approval' && !roleLoading && userRole === 'hr_manager' && (
                <>
                  <Button variant="secondary" onClick={() => setCurrentStep('review')}>
                    {t('common.cancel')}
                  </Button>
                  <Button variant="danger" onClick={() => setShowApprovalModal(true)} aria-label={t('tools.contentGeneration.approval.rejectAria', { defaultValue: 'Reject content' })}>
                    {t('tools.contentGeneration.approval.reject')}
                  </Button>
                  <Button variant="primary" onClick={handleApprove} aria-label={t('tools.contentGeneration.approval.approveAria', { defaultValue: 'Approve content' })}>
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

            {currentStep === 'export' && (
              <div className={styles.publishSection}>
                <h2 className={styles.sectionTitle}>{t('tools.contentGeneration.publish.title')}</h2>
                <p className={styles.description} style={{ marginBottom: '1rem' }}>
                  {t('tools.contentGeneration.publish.description')}
                </p>

                {currentContent.status !== 'approved' ? (
                  <Notice variant="warning" title={t('tools.contentGeneration.publish.approvalRequired')}>
                    {t('tools.contentGeneration.notice.approvalGateDesc')}
                  </Notice>
                ) : (
                  <>
                    {publishError && (
                      <Notice variant="danger" title={t('common.error.title')}>
                        {publishError}
                      </Notice>
                    )}
                    <div className={styles.channelGrid}>
                      {channels.map((channel) => (
                        <div key={channel.id} className={styles.channelCard}>
                          <h3 className={styles.variantTitle}>{channel.name}</h3>
                          <div className={styles.channelMeta}>
                            {publishedChannels[channel.id]
                              ? `${t('common.dateTime.lastSync')}: ${formatDateTime(publishedChannels[channel.id], locale)}`
                              : t('tools.contentGeneration.publish.neverPublished')}
                          </div>
                          {lastPublishedChannel === channel.id && (
                             <div style={{ color: 'var(--color-success)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                               {t('tools.contentGeneration.publish.success')}
                             </div>
                          )}
                          <Button
                            variant={publishedChannels[channel.id] ? "secondary" : "primary"}
                            onClick={() => handlePublish(channel.id)}
                            disabled={publishLoading}
                            loading={publishingChannel === channel.id && publishLoading}
                          >
                            {publishingChannel === channel.id && publishLoading ? t('common.loading') : t('tools.contentGeneration.publish.button')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
              <Button variant="secondary" onClick={() => setShowApprovalModal(false)} aria-label={t('common.cancelAria', { defaultValue: 'Cancel' })}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()} aria-label={t('tools.contentGeneration.approval.rejectAria', { defaultValue: 'Reject content' })}>
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
                {t('tools.contentGeneration.export.formatTxt')}
              </Button>
              <Button variant="secondary" onClick={() => handleDownload('pdf')}>
                {t('tools.contentGeneration.export.formatPdf')}
              </Button>
              <Button variant="secondary" onClick={() => handleDownload('docx')}>
                {t('tools.contentGeneration.export.formatDocx')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
