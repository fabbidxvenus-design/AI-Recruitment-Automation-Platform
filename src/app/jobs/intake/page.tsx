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
        <h1 className={styles.title}>Job / JD Intake</h1>
        <p className={styles.description}>Create or import new job openings and job descriptions</p>
      </header>

      <Notice variant="info" title="JD Parsing">
        AI will automatically extract skills and requirements from your Job Description after submission.
      </Notice>

      <div className={styles.sourceSelection}>
        <button
          className={`${styles.tab} ${source === 'manual' ? styles.active : ''}`}
          onClick={() => setSource('manual')}
        >
          Manual Form
        </button>
        <button
          className={`${styles.tab} ${source === 'text' ? styles.active : ''}`}
          onClick={() => setSource('text')}
        >
          Paste Text
        </button>
        <button
          className={`${styles.tab} ${source === 'file' ? styles.active : ''}`}
          onClick={() => setSource('file')}
        >
          Upload File
        </button>
        <button
          className={`${styles.tab} ${source === 'drive' ? styles.active : ''}`}
          onClick={() => setSource('drive')}
        >
          Google Drive
        </button>
      </div>

      <Card className={styles.formCard}>
        <div className={styles.formGroup}>
          <label htmlFor="jobTitle">Job Title *</label>
          <input
            id="jobTitle"
            type="text"
            value={jobData.title}
            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
            placeholder="e.g. Senior Frontend Engineer"
            className={styles.input}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="dept">Department</label>
            <input
              id="dept"
              type="text"
              value={jobData.department}
              onChange={(e) => setJobData({ ...jobData, department: e.target.value })}
              placeholder="e.g. Engineering"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="loc">Location</label>
            <input
              id="loc"
              type="text"
              value={jobData.location}
              onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
              placeholder="e.g. Remote"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="jdContent">Job Description Content *</label>
          <textarea
            id="jdContent"
            rows={10}
            value={jobData.content}
            onChange={(e) => setJobData({ ...jobData, content: e.target.value })}
            placeholder="Paste the job description text here..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!jobData.title || !jobData.content || loading}
          >
            {loading ? 'Creating...' : 'Create Job Requisition'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
