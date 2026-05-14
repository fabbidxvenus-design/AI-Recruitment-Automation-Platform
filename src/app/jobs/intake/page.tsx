'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Notice } from '@/components';
import jobService from '@/services/jobService';
import styles from './job-intake.module.css';

type IntakeSource = 'manual' | 'text' | 'file' | 'drive';

export default function JobIntakePage() {
  const { t } = useTranslation();
  const [source, setSource] = useState<IntakeSource>('manual');
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    location: '',
    content: '',
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await jobService.createJob({
        ...jobData,
        sourceType: source === 'file' ? 'pdf' : (source === 'drive' ? 'drive' : 'text'),
      });

      if (response.success) {
        alert('Job created successfully');
        // Reset form
        setJobData({ title: '', department: '', location: '', content: '' });
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      alert('An unexpected error occurred');
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

      <div className={styles.sourceSelection}>
        <button
          className={`${styles.tab} ${source === 'manual' ? styles.active : ''}`}
          onClick={() => setSource('manual')}
        >
          {t('tools.jobIntake.sources.manual')}
        </button>
        <button
          className={`${styles.tab} ${source === 'text' ? styles.active : ''}`}
          onClick={() => setSource('text')}
        >
          {t('tools.jobIntake.sources.text')}
        </button>
        <button
          className={`${styles.tab} ${source === 'file' ? styles.active : ''}`}
          onClick={() => setSource('file')}
        >
          {t('tools.jobIntake.sources.file')}
        </button>
        <button
          className={`${styles.tab} ${source === 'drive' ? styles.active : ''}`}
          onClick={() => setSource('drive')}
        >
          {t('tools.jobIntake.sources.drive')}
        </button>
      </div>

      <Card className={styles.formCard}>
        <div className={styles.formGroup}>
          <label htmlFor="jobTitle">{t('tools.jobIntake.form.jobTitle')} *</label>
          <input
            id="jobTitle"
            type="text"
            value={jobData.title}
            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
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
              onChange={(e) => setJobData({ ...jobData, department: e.target.value })}
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
              onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
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
            onChange={(e) => setJobData({ ...jobData, content: e.target.value })}
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
    </div>
  );
}
