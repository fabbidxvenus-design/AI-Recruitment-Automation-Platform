'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { bqBlockers, mockCandidates } from '@/lib/mockData';
import styles from './import.module.css';

type ImportStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface ValidationError {
  field: string;
  message: string;
  row?: number;
}

export default function ImportPage() {
  const { t, i18n } = useTranslation();
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [duplicates, setDuplicates] = useState<typeof mockCandidates>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const bq002 = bqBlockers.find(b => b.code === 'BQ-002');
  const bq003 = bqBlockers.find(b => b.code === 'BQ-003');

  // Form field error state
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateField = (field: string, value: string): string => {
    if (!value.trim() && field !== 'phone') {
      return t('candidates.import.validation.fieldRequired', { field });
    }
    if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t('candidates.import.validation.validEmail');
    }
    return '';
  };

  const handleFieldBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    if (field === 'firstName') setFirstNameError(error);
    if (field === 'lastName') setLastNameError(error);
    if (field === 'email') setEmailError(error);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setValidationErrors([{ field: 'file', message: t('candidates.import.validation.excelRequired') }]);
        return;
      }
      setValidationErrors([]);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!fileName) return;

    setImportStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setImportStatus('processing');

      // Simulate processing
      setTimeout(() => {
        setImportStatus('success');
        // Mock some duplicates
        setDuplicates([mockCandidates[0], mockCandidates[1]]);
        if (duplicates.length > 0) {
          setShowDuplicateModal(true);
        }
      }, 1500);
    }, 1000);
  };

  const handleDismissDuplicates = () => {
    setShowDuplicateModal(false);
    setDuplicates([]);
    setImportStatus('idle');
    setFileName('');
  };

  return (
    <div className={styles.importPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('candidates.import.title')}</h1>
          <p className={styles.description}>
            {t('candidates.import.description')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary">{t('candidates.import.downloadTemplate')}</Button>
        </div>
      </div>

      {(bq002 || bq003) && (
        <div className={styles.blockersSection}>
          {bq002 && (
            <Notice variant="blocker" title={`${bq002.code}: ${bq002.title}`}>
              {bq002.description} <strong>{t('candidates.import.actionRequired')}</strong> {bq002.requiresAction}
            </Notice>
          )}
          {bq003 && (
            <Notice variant="blocker" title={`${bq003.code}: ${bq003.title}`}>
              {bq003.description} <strong>{t('candidates.import.actionRequired')}</strong> {bq003.requiresAction}
            </Notice>
          )}
        </div>
      )}

      <div className={styles.mainContent}>
        <div className={styles.importMethods}>
          <Card>
            <CardHeader title={t('candidates.import.excel.title')} description={t('candidates.import.excel.description')} />
            <CardContent>
              <div className={styles.uploadArea}>
                <div className={styles.uploadIcon}>📁</div>
                <p className={styles.uploadText}>{t('candidates.import.excel.dragDrop')}</p>
                <p className={styles.uploadFormats}>{t('candidates.import.excel.formats')}</p>
                <label className={styles.fileInputLabel}>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    aria-label={t('candidates.import.excel.uploadAria')}
                  />
                  <Button variant="secondary">{t('candidates.import.excel.browseFiles')}</Button>
                </label>
                {fileName && (
                  <div className={styles.selectedFile}>
                    <span className={styles.fileName}>{fileName}</span>
                    <button
                      className={styles.removeFile}
                      onClick={() => setFileName('')}
                      aria-label={t('candidates.import.excel.removeFile')}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {importStatus === 'uploading' && (
                <div className={styles.progressSection}>
                  <div className={styles.progressLabel}>
                    <span>{t('candidates.import.excel.uploading')}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {importStatus === 'processing' && (
                <div className={styles.processingState}>
                  <div className={styles.spinner}>◐</div>
                  <span>{t('candidates.import.excel.processing')}</span>
                </div>
              )}

              {importStatus === 'success' && (
                <div className={styles.successState}>
                  <StatusBadge variant="success" label={t('candidates.import.excel.importSuccess')} />
                  <p>{t('candidates.import.excel.importedCount', { count: 12 })}</p>
                  <p className={styles.warning}>{t('candidates.import.excel.duplicatesDetected', { count: 2 })}</p>
                  <Link href="/screening/review">
                    <Button variant="primary" size="sm">{t('candidates.import.excel.reviewImported')}</Button>
                  </Link>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!fileName || importStatus !== 'idle'}
                loading={importStatus === 'uploading' || importStatus === 'processing'}
              >
                {t('candidates.import.excel.importButton')}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title={t('candidates.import.googleDrive.title')} description={t('candidates.import.googleDrive.description')} />
            <CardContent>
              <div className={styles.driveSection}>
                <div className={styles.driveIcon}>📄</div>
                <Notice variant="warning" title={t('candidates.import.googleDrive.required')}>
                  {t('candidates.import.googleDrive.connectRequired')}
                </Notice>
                <div className={styles.driveStatus}>
                  <span className={styles.driveLabel}>{t('candidates.import.googleDrive.watchFolder')}</span>
                  <code className={styles.drivePath}>hr-recruitment/candidates/</code>
                </div>
                <div className={styles.driveStats}>
                  <div className={styles.driveStat}>
                    <span className={styles.driveStatValue}>0</span>
                    <span className={styles.driveStatLabel}>{t('candidates.import.googleDrive.pendingFiles')}</span>
                  </div>
                  <div className={styles.driveStat}>
                    <span className={styles.driveStatValue}>0</span>
                    <span className={styles.driveStatLabel}>{t('candidates.import.googleDrive.lastImport')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">{t('candidates.import.googleDrive.connect')}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title={t('candidates.import.manual.title')} description={t('candidates.import.manual.description')} />
            <CardContent>
              <form className={styles.manualForm} onSubmit={(e) => e.preventDefault()} aria-label={t('candidates.import.manual.formAria')}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.formLabel}>{t('candidates.import.manual.firstName')}</label>
                    <input
                      type="text"
                      id="firstName"
                      className={`${styles.formInput} ${firstNameError ? styles.inputError : ''}`}
                      aria-required="true"
                      aria-invalid={!!firstNameError}
                      aria-describedby={firstNameError ? 'firstName-error' : undefined}
                      onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                      required
                    />
                    {firstNameError && (
                      <span id="firstName-error" className={styles.fieldError} role="alert">
                        {firstNameError}
                      </span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.formLabel}>{t('candidates.import.manual.lastName')}</label>
                    <input
                      type="text"
                      id="lastName"
                      className={`${styles.formInput} ${lastNameError ? styles.inputError : ''}`}
                      aria-required="true"
                      aria-invalid={!!lastNameError}
                      aria-describedby={lastNameError ? 'lastName-error' : undefined}
                      onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                      required
                    />
                    {lastNameError && (
                      <span id="lastName-error" className={styles.fieldError} role="alert">
                        {lastNameError}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>{t('candidates.import.manual.email')}</label>
                    <input
                      type="email"
                      id="email"
                      className={`${styles.formInput} ${emailError ? styles.inputError : ''}`}
                      aria-required="true"
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? 'email-error' : undefined}
                      onBlur={(e) => handleFieldBlur('email', e.target.value)}
                      required
                    />
                    {emailError && (
                      <span id="email-error" className={styles.fieldError} role="alert">
                        {emailError}
                      </span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.formLabel}>{t('candidates.import.manual.phone')}</label>
                    <input type="tel" id="phone" className={styles.formInput} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="jobId" className={styles.formLabel}>{t('candidates.import.manual.position')}</label>
                  <select id="jobId" className={styles.formSelect} required>
                    <option value="">{t('candidates.import.manual.selectJob')}</option>
                    <option value="job-001">Senior Frontend Engineer</option>
                    <option value="job-002">Product Manager</option>
                    <option value="job-003">Backend Engineer</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="source" className={styles.formLabel}>{t('candidates.import.manual.source')}</label>
                  <select id="source" className={styles.formSelect}>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Referral">{t('candidates.import.manual.sourceReferral')}</option>
                    <option value="Career Fair">{t('candidates.import.manual.sourceCareerFair')}</option>
                    <option value="Other">{t('candidates.import.manual.sourceOther')}</option>
                  </select>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button variant="primary">{t('candidates.import.manual.addButton')}</Button>
            </CardFooter>
          </Card>
        </div>

        <div className={styles.sidebar}>
          <Card>
            <CardHeader title={t('candidates.import.recent.title')} description={t('candidates.import.recent.description')} />
            <CardContent>
              <div className={styles.recentImports}>
                <div className={styles.importItem}>
                  <div className={styles.importIcon}>✓</div>
                  <div className={styles.importDetails}>
                    <span className={styles.importName}>import_batch_2024_04_20.xlsx</span>
                    <span className={styles.importMeta}>12 {t('candidates.import.recent.candidates')} • Apr 20, 2024</span>
                  </div>
                  <StatusBadge variant="success" label={t('common.status.complete')} />
                </div>
                <div className={styles.importItem}>
                  <div className={styles.importIcon}>✓</div>
                  <div className={styles.importDetails}>
                    <span className={styles.importName}>linkedin_candidates.xlsx</span>
                    <span className={styles.importMeta}>8 {t('candidates.import.recent.candidates')} • Apr 18, 2024</span>
                  </div>
                  <StatusBadge variant="success" label={t('common.status.complete')} />
                </div>
                <div className={styles.importItem}>
                  <div className={styles.importIcon}>⚠</div>
                  <div className={styles.importDetails}>
                    <span className={styles.importName}>resume_batch_03.xlsx</span>
                    <span className={styles.importMeta}>{t('candidates.import.recent.importedFailed', { imported: 5, failed: 2 })} • Apr 15, 2024</span>
                  </div>
                  <StatusBadge variant="warning" label={t('common.status.partial')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={t('candidates.import.stats.title')} description={t('candidates.import.stats.description')} />
            <CardContent>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>47</span>
                  <span className={styles.statLabel}>{t('candidates.import.stats.totalImported')}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>3</span>
                  <span className={styles.statLabel}>{t('candidates.import.stats.duplicatesFound')}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>{t('candidates.import.stats.failed')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showDuplicateModal && (
        <div className={styles.modal} onClick={() => {}}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('candidates.import.duplicate.title')}</h2>
              <button
                className={styles.modalClose}
                onClick={handleDismissDuplicates}
                aria-label={t('common.dismiss')}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.duplicateInfo}>
                {t('candidates.import.duplicate.description')}
              </p>
              <div className={styles.duplicateList}>
                {duplicates.map(candidate => (
                  <div key={candidate.id} className={styles.duplicateItem}>
                    <div className={styles.candidateInfo}>
                      <span className={styles.candidateName}>{candidate.firstName} {candidate.lastName}</span>
                      <span className={styles.candidateEmail}>{candidate.email}</span>
                    </div>
                    <div className={styles.duplicateActions}>
                      <Button variant="ghost" size="sm">{t('common.skip')}</Button>
                      <Button variant="secondary" size="sm">{t('common.merge')}</Button>
                      <Button variant="primary" size="sm">{t('common.createNew')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={handleDismissDuplicates}>{t('candidates.import.duplicate.cancelImport')}</Button>
              <Button variant="primary" onClick={handleDismissDuplicates}>{t('candidates.import.duplicate.continueWithSelection')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}