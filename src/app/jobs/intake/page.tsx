'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Notice, StatusBadge } from '@/components';
import jobService from '@/services/jobService';
import type { JDSourceType } from '@/types';
import styles from './job-intake.module.css';

type IntakeSource = 'manual' | 'text' | 'file' | 'drive' | 'sheet' | 'connector';
type ConnectorStatus = 'connected' | 'mocked' | 'needs_review';
type RequisitionStatus = 'ready' | 'synced' | 'needs_review';

interface JobFormData {
  title: string;
  department: string;
  location: string;
  content: string;
}

interface ConnectorMock {
  id: string;
  nameKey: string;
  status: ConnectorStatus;
  lastSynced: string;
}

interface RequisitionPreview {
  id: string;
  sourceKey: string;
  title: string;
  department: string;
  location: string;
  status: RequisitionStatus;
  lastSynced: string;
  content: string;
}

const sourceOptions: IntakeSource[] = ['manual', 'text', 'file', 'drive', 'sheet', 'connector'];

const connectorMocks: ConnectorMock[] = [
  { id: 'ats', nameKey: 'ats', status: 'mocked', lastSynced: '2026-05-14 09:10' },
  { id: 'job-board', nameKey: 'jobBoard', status: 'connected', lastSynced: '2026-05-14 09:05' },
  { id: 'career-site', nameKey: 'careerSite', status: 'connected', lastSynced: '2026-05-14 08:45' },
  { id: 'sheet', nameKey: 'requisitionSheet', status: 'needs_review', lastSynced: '2026-05-13 17:30' },
];

const requisitionPreviews: RequisitionPreview[] = [
  {
    id: 'req-001',
    sourceKey: 'ats',
    title: 'Senior Product Designer',
    department: 'Product',
    location: 'Ho Chi Minh City',
    status: 'ready',
    lastSynced: '2026-05-14 09:10',
    content: 'Lead end-to-end product design for recruiter workflows. Requires strong UX research, Figma, design systems, and stakeholder facilitation experience.',
  },
  {
    id: 'req-002',
    sourceKey: 'jobBoard',
    title: 'QA Automation Engineer',
    department: 'Engineering',
    location: 'Da Nang',
    status: 'synced',
    lastSynced: '2026-05-14 09:05',
    content: 'Build automated regression coverage for web recruitment workflows. Requires Playwright, API testing, CI experience, and strong debugging skills.',
  },
  {
    id: 'req-003',
    sourceKey: 'requisitionSheet',
    title: 'Talent Acquisition Partner',
    department: 'People',
    location: 'Hanoi',
    status: 'needs_review',
    lastSynced: '2026-05-13 17:30',
    content: 'Partner with hiring managers to define roles, source candidates, and coordinate recruitment operations across multiple departments.',
  },
];

export default function JobIntakePage() {
  const { t } = useTranslation();
  const [source, setSource] = useState<IntakeSource>('manual');
  const [loading, setLoading] = useState(false);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'warning'; title: string; body: string } | null>(null);
  const [jobData, setJobData] = useState<JobFormData>({
    title: '',
    department: '',
    location: '',
    content: '',
  });

  const sourceTypeByMode: Record<IntakeSource, JDSourceType> = {
    manual: 'manual',
    text: 'text',
    file: 'pdf',
    drive: 'drive',
    sheet: 'sheet',
    connector: 'sheet',
  };

  const handleSourceChange = (nextSource: IntakeSource): void => {
    setSource(nextSource);
  };

  const handleImportSheet = (): void => {
    const requisition = requisitionPreviews.find((item) => item.sourceKey === 'requisitionSheet') ?? requisitionPreviews[0];
    handleImportRequisition(requisition);
    setFeedback({
      variant: 'success',
      title: 'Sheet imported',
      body: `${requisition.title} was loaded from the mock requisition sheet for HR review.`,
    });
  };

  const handleImportRequisition = (requisition: RequisitionPreview): void => {
    setSelectedRequisitionId(requisition.id);
    setJobData({
      title: requisition.title,
      department: requisition.department,
      location: requisition.location,
      content: requisition.content,
    });
    setSource('text');
  };

  const handleCreate = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await jobService.createJob({
        ...jobData,
        sourceType: sourceTypeByMode[source],
      });

      if (response.success) {
        setFeedback({
          variant: 'success',
          title: t('tools.jobIntake.messages.created'),
          body: `${jobData.title} is now staged as an approved mock JD profile.`,
        });
        setJobData({ title: '', department: '', location: '', content: '' });
        setSelectedRequisitionId(null);
      } else {
        setFeedback({
          variant: 'warning',
          title: t('tools.jobIntake.messages.error', { error: response.error }),
          body: 'Review required fields before creating this mock job.',
        });
      }
    } catch (error: unknown) {
      setFeedback({
        variant: 'warning',
        title: t('tools.jobIntake.messages.unexpected'),
        body: 'The prototype kept your draft so you can retry without losing JD content.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('tools.jobIntake.title')}</h1>
        <p className={styles.description}>{t('tools.jobIntake.description')}</p>
      </header>

      <Notice variant="info" title={t('tools.jobIntake.notice.title')}>
        {t('tools.jobIntake.notice.description')}
      </Notice>

      {feedback && (
        <Notice variant={feedback.variant} title={feedback.title}>
          {feedback.body}
        </Notice>
      )}

      {selectedRequisitionId && (
        <Notice variant="success" title={t('tools.jobIntake.connector.importedTitle')}>
          {t('tools.jobIntake.connector.importedBody')}
        </Notice>
      )}

      <div className={styles.sourceSelection} role="tablist" aria-label={t('tools.jobIntake.sources.label')}>
        {sourceOptions.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={source === option}
            className={`${styles.tab} ${source === option ? styles.active : ''}`}
            onClick={() => handleSourceChange(option)}
          >
            {t(`tools.jobIntake.sources.${option}`)}
          </button>
        ))}
      </div>

      {source === 'sheet' && (
        <Card className={styles.connectorCard}>
          <h2 className={styles.sectionTitle}>{t('tools.jobIntake.sheet.title')}</h2>
          <p className={styles.sectionDescription}>{t('tools.jobIntake.sheet.description')}</p>
          <div className={styles.mockUploadBox}>
            <strong>{t('tools.jobIntake.sheet.dropzone')}</strong>
            <span>{t('tools.jobIntake.sheet.supportedFormats')}</span>
            <Button variant="secondary" onClick={handleImportSheet}>
              Import mock requisition sheet
            </Button>
          </div>
        </Card>
      )}

      {source === 'connector' && (
        <div className={styles.connectorStack}>
          <Notice variant="warning" title={t('tools.jobIntake.connector.noticeTitle')}>
            {t('tools.jobIntake.connector.noticeBody')}
          </Notice>

          <Card className={styles.connectorCard}>
            <h2 className={styles.sectionTitle}>{t('tools.jobIntake.connector.statusTitle')}</h2>
            <div className={styles.connectorGrid}>
              {connectorMocks.map((connector) => (
                <div key={connector.id} className={styles.connectorItem}>
                  <div>
                    <h3 className={styles.connectorName}>{t(`tools.jobIntake.connector.names.${connector.nameKey}`)}</h3>
                    <p className={styles.connectorMeta}>{t('tools.jobIntake.connector.lastSynced')}: {connector.lastSynced}</p>
                  </div>
                  <StatusBadge
                    variant={connector.status === 'needs_review' ? 'warning' : 'success'}
                    label={t(`tools.jobIntake.connector.status.${connector.status}`)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className={styles.connectorCard}>
            <h2 className={styles.sectionTitle}>{t('tools.jobIntake.connector.previewTitle')}</h2>
            <div className={styles.previewTable} role="table" aria-label={t('tools.jobIntake.connector.previewTitle')}>
              <div className={styles.previewHeader} role="row">
                <span role="columnheader">{t('tools.jobIntake.connector.columns.source')}</span>
                <span role="columnheader">{t('tools.jobIntake.connector.columns.title')}</span>
                <span role="columnheader">{t('tools.jobIntake.connector.columns.department')}</span>
                <span role="columnheader">{t('tools.jobIntake.connector.columns.status')}</span>
                <span role="columnheader">{t('tools.jobIntake.connector.columns.action')}</span>
              </div>
              {requisitionPreviews.map((requisition) => (
                <div key={requisition.id} className={styles.previewRow} role="row">
                  <span role="cell">{t(`tools.jobIntake.connector.names.${requisition.sourceKey}`)}</span>
                  <span role="cell">
                    <strong>{requisition.title}</strong>
                    <small>{requisition.location}</small>
                  </span>
                  <span role="cell">{requisition.department}</span>
                  <span role="cell">
                    <StatusBadge
                      variant={requisition.status === 'needs_review' ? 'warning' : 'success'}
                      label={t(`tools.jobIntake.connector.requisitionStatus.${requisition.status}`)}
                    />
                    <small>{requisition.lastSynced}</small>
                  </span>
                  <span role="cell">
                    <Button variant="secondary" onClick={() => handleImportRequisition(requisition)}>
                      {t('tools.jobIntake.connector.importAction')}
                    </Button>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {source !== 'connector' && source !== 'sheet' && (
        <Card className={styles.formCard}>
          <div className={styles.formGroup}>
            <label htmlFor="jobTitle">{t('tools.jobIntake.form.jobTitle')} *</label>
            <input
              id="jobTitle"
              type="text"
              value={jobData.title}
              onChange={(event) => setJobData({ ...jobData, title: event.target.value })}
              placeholder={t('tools.jobIntake.form.jobTitlePlaceholder')}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="dept">{t('tools.jobIntake.form.department')}</label>
              <input
                id="dept"
                type="text"
                value={jobData.department}
                onChange={(event) => setJobData({ ...jobData, department: event.target.value })}
                placeholder={t('tools.jobIntake.form.departmentPlaceholder')}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="loc">{t('tools.jobIntake.form.location')}</label>
              <input
                id="loc"
                type="text"
                value={jobData.location}
                onChange={(event) => setJobData({ ...jobData, location: event.target.value })}
                placeholder={t('tools.jobIntake.form.locationPlaceholder')}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jdContent">{t('tools.jobIntake.form.jdContent')} *</label>
            <textarea
              id="jdContent"
              rows={10}
              value={jobData.content}
              onChange={(event) => setJobData({ ...jobData, content: event.target.value })}
              placeholder={t('tools.jobIntake.form.jdContentPlaceholder')}
              className={styles.textarea}
            />
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!jobData.title || !jobData.content || loading}
            >
              {loading ? t('tools.jobIntake.actions.creating') : t('tools.jobIntake.actions.create')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
