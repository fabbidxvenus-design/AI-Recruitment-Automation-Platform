'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Notice,
  LoadingState,
  EmptyState,
  StatusBadge,
} from '@/components';
import {
  DesignBrief,
  DesignVariant,
  DesignStatus,
  DesignFormat,
  PublishChannel,
  ApprovalRecord,
} from '@/types/ai-design';
import {
  generateDesignVariants,
  validateDesignBrief,
  mockApprovalRequest,
  mockExportDesign,
} from '@/lib/ai-design-mock';
import styles from './ai-design.module.css';

export default function AIDesignPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();

  const [status, setStatus] = useState<DesignStatus>('empty');
  const [brief, setBrief] = useState<Partial<DesignBrief>>({
    designType: 'job_poster',
    jobTitle: '',
    companyName: '',
    keyMessage: '',
    targetAudience: '',
    colorPreference: '',
    additionalNotes: '',
  });
  const [variants, setVariants] = useState<DesignVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRecord[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<DesignFormat>('png');
  const [publishChannel, setPublishChannel] = useState<PublishChannel>('linkedin');
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBriefChange = (field: keyof DesignBrief, value: string) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const handleGenerate = async (): Promise<void> => {
    const errors = validateDesignBrief(brief);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStatus('generating');
    setValidationErrors([]);

    try {
      const isValidBrief = (b: Partial<DesignBrief>): b is DesignBrief => {
        return !!(
          b.designType &&
          b.jobTitle &&
          b.companyName &&
          b.keyMessage &&
          b.targetAudience
        );
      };

      if (!isValidBrief(brief)) {
        setValidationErrors(['All required fields must be filled']);
        setStatus('empty');
        return;
      }

      const generatedVariants = await generateDesignVariants(brief);
      setVariants(generatedVariants);
      setStatus('generated');
      setSelectedVariantId(generatedVariants[0]?.id || null);
    } catch (error: unknown) {
      setStatus('empty');
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate designs. Please try again.';
      setValidationErrors([errorMessage]);
    }
  };

  const handleRequestApproval = async (): Promise<void> => {
    if (!selectedVariantId) return;

    setStatus('pending_approval');
    const newRecord: ApprovalRecord = {
      id: `approval-${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    setApprovalHistory(prev => [newRecord, ...prev]);

    try {
      await mockApprovalRequest(selectedVariantId);
    } catch (error: unknown) {
      console.warn('Approval request failed:', error);
      setStatus('generated');
      setApprovalHistory(prev => prev.filter(r => r.id !== newRecord.id));
    }
  };

  const handleApprove = (): void => {
    setStatus('approved');
    const updatedHistory = approvalHistory.map((record) =>
      record.status === 'pending'
        ? { ...record, status: 'approved' as const, approver: 'HR Manager', timestamp: new Date().toISOString() }
        : record
    );
    setApprovalHistory(updatedHistory);
  };

  const handleReject = (reason: string): void => {
    setStatus('rejected');
    const updatedHistory = approvalHistory.map((record) =>
      record.status === 'pending'
        ? {
            ...record,
            status: 'rejected' as const,
            approver: 'HR Manager',
            reason,
            timestamp: new Date().toISOString(),
          }
        : record
    );
    setApprovalHistory(updatedHistory);
  };

  const handleExport = async (): Promise<void> => {
    if (!selectedVariantId || status !== 'approved') {
      setExportMessage({ type: 'error', text: t('tools.aiDesign.export.approvalRequired') });
      return;
    }

    setExportMessage(null);
    try {
      const result = await mockExportDesign(selectedVariantId, exportFormat, publishChannel);
      if (result.success) {
        setStatus('exported');
        setExportMessage({ type: 'success', text: t('tools.aiDesign.export.exportSuccess') });
      } else {
        setExportMessage({ type: 'error', text: result.error || t('tools.aiDesign.export.exportFailed') });
      }
    } catch (error: unknown) {
      setExportMessage({ type: 'error', text: t('tools.aiDesign.export.exportFailed') });
    }
  };

  const handleBackToBrief = (): void => {
    setStatus('empty');
    setVariants([]);
    setSelectedVariantId(null);
    setApprovalHistory([]);
    setExportMessage(null);
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/tools" className={styles.backLink}>
            ← {t('tools.hub.title')}
          </a>
        </div>
        <h1 className={styles.title}>{t('tools.aiDesign.title')}</h1>
        <p className={styles.description}>{t('tools.aiDesign.description')}</p>
      </header>

      <Notice variant="info" title={t('tools.aiDesign.notice.mockGeneration')}>
        {t('tools.aiDesign.notice.mockGenerationDesc')}
      </Notice>

      {status === 'empty' && (
        <Card>
          <CardHeader title={t('tools.aiDesign.form.designType')} />
          <CardContent>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label htmlFor="designType" className={styles.label}>
                  {t('tools.aiDesign.form.designType')} *
                </label>
                <select
                  id="designType"
                  className={styles.select}
                  value={brief.designType}
                  onChange={(e) => handleBriefChange('designType', e.target.value)}
                  required
                  aria-required="true"
                >
                  <option value="job_poster">{t('tools.aiDesign.form.jobPoster')}</option>
                  <option value="social_media">{t('tools.aiDesign.form.socialMedia')}</option>
                  <option value="email_banner">{t('tools.aiDesign.form.emailBanner')}</option>
                  <option value="presentation_slide">{t('tools.aiDesign.form.presentationSlide')}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jobTitle" className={styles.label}>
                  {t('tools.aiDesign.form.jobTitle')} *
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  className={styles.input}
                  placeholder={t('tools.aiDesign.form.jobTitlePlaceholder')}
                  value={brief.jobTitle}
                  onChange={(e) => handleBriefChange('jobTitle', e.target.value)}
                  required
                  aria-required="true"
                  aria-invalid={validationErrors.some(e => e.includes('title')) ? 'true' : 'false'}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="companyName" className={styles.label}>
                  {t('tools.aiDesign.form.companyName')} *
                </label>
                <input
                  id="companyName"
                  type="text"
                  className={styles.input}
                  placeholder={t('tools.aiDesign.form.companyNamePlaceholder')}
                  value={brief.companyName}
                  onChange={(e) => handleBriefChange('companyName', e.target.value)}
                  required
                  aria-required="true"
                  aria-invalid={validationErrors.some(e => e.includes('company')) ? 'true' : 'false'}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="keyMessage" className={styles.label}>
                  {t('tools.aiDesign.form.keyMessage')} *
                </label>
                <input
                  id="keyMessage"
                  type="text"
                  className={styles.input}
                  placeholder={t('tools.aiDesign.form.keyMessagePlaceholder')}
                  value={brief.keyMessage}
                  onChange={(e) => handleBriefChange('keyMessage', e.target.value)}
                  required
                  aria-required="true"
                  aria-invalid={validationErrors.some(e => e.includes('message')) ? 'true' : 'false'}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="targetAudience" className={styles.label}>
                  {t('tools.aiDesign.form.targetAudience')} *
                </label>
                <input
                  id="targetAudience"
                  type="text"
                  className={styles.input}
                  placeholder={t('tools.aiDesign.form.targetAudiencePlaceholder')}
                  value={brief.targetAudience}
                  onChange={(e) => handleBriefChange('targetAudience', e.target.value)}
                  required
                  aria-required="true"
                  aria-invalid={validationErrors.some(e => e.includes('audience')) ? 'true' : 'false'}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="colorPreference" className={styles.label}>
                  {t('tools.aiDesign.form.colorPreference')}
                </label>
                <input
                  id="colorPreference"
                  type="text"
                  className={styles.input}
                  placeholder={t('tools.aiDesign.form.colorPreferencePlaceholder')}
                  value={brief.colorPreference}
                  onChange={(e) => handleBriefChange('colorPreference', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="additionalNotes" className={styles.label}>
                  {t('tools.aiDesign.form.additionalNotes')}
                </label>
                <textarea
                  id="additionalNotes"
                  className={styles.textarea}
                  placeholder={t('tools.aiDesign.form.additionalNotesPlaceholder')}
                  value={brief.additionalNotes}
                  onChange={(e) => handleBriefChange('additionalNotes', e.target.value)}
                  rows={4}
                />
              </div>

              {validationErrors.length > 0 && (
                <div role="alert" aria-live="assertive">
                  <Notice variant="danger">
                    <ul className={styles.errorList}>
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Notice>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} variant="primary">
              {t('tools.aiDesign.form.generate')}
            </Button>
          </CardFooter>
        </Card>
      )}

      {status === 'generating' && (
        <Card>
          <CardContent>
            <LoadingState text={t('tools.aiDesign.workspace.generating')} />
          </CardContent>
        </Card>
      )}

      {(status === 'generated' || status === 'pending_approval' || status === 'approved' || status === 'rejected' || status === 'exported') && (
        <div className={styles.workspace}>
          <div className={styles.workspaceHeader}>
            <Button onClick={handleBackToBrief} variant="ghost" size="sm">
              ← {t('tools.aiDesign.workspace.backToBrief')}
            </Button>
            <StatusBadge label={t(`tools.aiDesign.states.${status}`)} variant="info" />
          </div>

          <div className={styles.workspaceGrid}>
            <Card className={styles.variantsPanel}>
              <CardHeader title={t('tools.aiDesign.workspace.variants')} description={`${variants.length} variants`} />
              <CardContent>
                <div className={styles.variantsList} role="radiogroup" aria-label={t('tools.aiDesign.workspace.variants')}>
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`${styles.variantCard} ${selectedVariantId === variant.id ? styles.variantCardSelected : ''}`}
                      onClick={() => setSelectedVariantId(variant.id)}
                      type="button"
                      role="radio"
                      aria-checked={selectedVariantId === variant.id}
                      aria-label={`${variant.title}: ${variant.description}`}
                    >
                      <div className={styles.variantThumbnail}>
                        <div className={styles.mockImage} aria-hidden="true">{variant.title.substring(0, 2)}</div>
                      </div>
                      <div className={styles.variantInfo}>
                        <h4 className={styles.variantTitle}>{variant.title}</h4>
                        <p className={styles.variantDescription}>{variant.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className={styles.mainPanel}>
              {selectedVariant && (
                <>
                  <Card>
                    <CardHeader title={t('tools.aiDesign.workspace.selectedDesign')} />
                    <CardContent>
                      <div className={styles.selectedDesign}>
                        <div className={styles.mockImageLarge}>{selectedVariant.title}</div>
                        <div className={styles.designMeta}>
                          <p>
                            <strong>{t('tools.aiDesign.workspace.dimensions')}:</strong> {selectedVariant.dimensions.width} x{' '}
                            {selectedVariant.dimensions.height}
                          </p>
                        </div>
                      </div>

                      <Notice variant="info" title={t('tools.aiDesign.notice.aiGenerated')}>
                        {t('tools.aiDesign.notice.aiGeneratedDesc')}
                      </Notice>

                      <div className={styles.provenance}>
                        <h4 className={styles.provenanceTitle}>{t('tools.aiDesign.workspace.aiProvenance')}</h4>
                        <dl className={styles.provenanceList}>
                          <dt>{t('tools.aiDesign.workspace.model')}:</dt>
                          <dd>{selectedVariant.provenance.model}</dd>
                          <dt>{t('tools.aiDesign.workspace.confidence')}:</dt>
                          <dd>{(selectedVariant.provenance.confidence * 100).toFixed(1)}%</dd>
                          <dt>{t('tools.aiDesign.workspace.generatedAt')}:</dt>
                          <dd>{formatDateTime(selectedVariant.provenance.generatedAt, locale)}</dd>
                        </dl>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {status === 'generated' && (
                        <Button onClick={handleRequestApproval} variant="primary">
                          {t('tools.aiDesign.workspace.requestApproval')}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>

                  {(status === 'pending_approval' || status === 'approved' || status === 'rejected') && (
                    <Card>
                      <CardHeader title={t('tools.aiDesign.approval.title')} />
                      <CardContent>
                        <Notice variant="warning" title={t('tools.aiDesign.notice.approvalGate')}>
                          {t('tools.aiDesign.notice.approvalGateDesc')}
                        </Notice>

                        {status === 'pending_approval' && (
                          <div className={styles.approvalActions}>
                            <Button onClick={handleApprove} variant="primary">
                              {t('tools.aiDesign.approval.approve')}
                            </Button>
                            <Button onClick={() => handleReject('Design does not meet brand guidelines')} variant="danger">
                              {t('tools.aiDesign.approval.reject')}
                            </Button>
                          </div>
                        )}

                        {approvalHistory.length > 0 && (
                          <div className={styles.approvalHistory}>
                            <h4>{t('tools.aiDesign.approval.approvalHistory')}</h4>
                            <ul className={styles.historyList}>
                              {approvalHistory.map((record) => (
                                <li key={record.id} className={styles.historyItem}>
                                  <StatusBadge
                                    label={t(`tools.aiDesign.approval.${record.status}`)}
                                    variant={record.status === 'approved' ? 'success' : record.status === 'rejected' ? 'danger' : 'warning'}
                                  />
                                  {record.approver && <span> by {record.approver}</span>}
                                  <span className={styles.historyTimestamp}> - {formatDateTime(record.timestamp, locale)}</span>
                                  {record.reason && <p className={styles.historyReason}>{record.reason}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {(status === 'approved' || status === 'exported') && (
                    <Card>
                      <CardHeader title={t('tools.aiDesign.export.title')} description={t('tools.aiDesign.export.description')} />
                      <CardContent>
                        <div className={styles.exportForm}>
                          <div className={styles.formGroup}>
                            <label htmlFor="exportFormat" className={styles.label}>
                              {t('tools.aiDesign.export.format')}
                            </label>
                            <select
                              id="exportFormat"
                              className={styles.select}
                              value={exportFormat}
                              onChange={(e) => setExportFormat(e.target.value as DesignFormat)}
                            >
                              <option value="png">PNG</option>
                              <option value="jpg">JPG</option>
                              <option value="svg">SVG</option>
                              <option value="pdf">PDF</option>
                            </select>
                          </div>

                          <div className={styles.formGroup}>
                            <label htmlFor="publishChannel" className={styles.label}>
                              {t('tools.aiDesign.export.channel')}
                            </label>
                            <select
                              id="publishChannel"
                              className={styles.select}
                              value={publishChannel}
                              onChange={(e) => setPublishChannel(e.target.value as PublishChannel)}
                            >
                              <option value="linkedin">{t('tools.aiDesign.export.linkedin')}</option>
                              <option value="facebook">{t('tools.aiDesign.export.facebook')}</option>
                              <option value="email">{t('tools.aiDesign.export.email')}</option>
                              <option value="website">{t('tools.aiDesign.export.website')}</option>
                              <option value="internal">{t('tools.aiDesign.export.internal')}</option>
                            </select>
                          </div>

                          <Notice variant="info">{t('tools.aiDesign.export.publishNotice')}</Notice>

                          {exportMessage && (
                            <Notice variant={exportMessage.type === 'success' ? 'success' : 'danger'}>{exportMessage.text}</Notice>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleExport} variant="primary" disabled={status === 'exported'}>
                          {t('tools.aiDesign.export.download')}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
