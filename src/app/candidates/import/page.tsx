'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Notice, StatusBadge } from '@/components';
import cvService from '@/services/cvService';
import styles from './cv-import.module.css';

type ImportSource = 'manual' | 'drive' | 'batch';
type ValidationState = 'success' | 'warning' | 'danger' | 'info';

interface ValidationScenario {
  id: string;
  titleKey: string;
  bodyKey: string;
  state: ValidationState;
}

const validationScenarios: ValidationScenario[] = [
  { id: 'invalid-file', titleKey: 'invalidFile', bodyKey: 'invalidFileBody', state: 'danger' },
  { id: 'non-pdf', titleKey: 'nonPdf', bodyKey: 'nonPdfBody', state: 'danger' },
  { id: 'nested-folder', titleKey: 'nestedFolder', bodyKey: 'nestedFolderBody', state: 'warning' },
  { id: 'drive-scan-error', titleKey: 'driveScanError', bodyKey: 'driveScanErrorBody', state: 'danger' },
  { id: 'duplicate', titleKey: 'duplicate', bodyKey: 'duplicateBody', state: 'warning' },
  { id: 'version-created', titleKey: 'versionCreated', bodyKey: 'versionCreatedBody', state: 'success' },
];

export default function CVImportPage() {
  const { t } = useTranslation();
  const [importSource, setImportSource] = useState<ImportSource>('manual');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [driveFolder, setDriveFolder] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [versionCreated, setVersionCreated] = useState(false);
  const [rescreenRequested, setRescreenRequested] = useState(false);
  const [importError, setImportError] = useState(false);

  const resetImportState = (): void => {
    setVersionCreated(false);
    setRescreenRequested(false);
    setImportError(false);
  };

  const handleSourceChange = (source: ImportSource): void => {
    setImportSource(source);
    resetImportState();
  };

  const handleDriveFolderChange = (value: string): void => {
    setDriveFolder(value);
    resetImportState();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
      resetImportState();
    }
  };

  const handleImport = async (): Promise<void> => {
    setImporting(true);
    setImportError(false);
    try {
      if (importSource === 'manual' && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await cvService.importCV({
            candidateId: `cand-${Date.now()}`,
            fileName: file.name,
            fileContent: 'mock-content',
          });
        }
        setVersionCreated(true);
        setSelectedFiles([]);
      } else if (importSource === 'drive' && driveFolder) {
        setVersionCreated(true);
      }
    } catch {
      setImportError(true);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('cvImport.title')}</h1>
        <p className={styles.description}>{t('cvImport.description')}</p>
      </header>

      <Notice variant="info" title={t('cvImport.versioning.title')}>
        {t('cvImport.versioning.body')}
      </Notice>

      {versionCreated && (
        <Notice variant="warning" title={t('cvImport.rescreen.title')}>
          {rescreenRequested ? t('cvImport.rescreen.requested') : t('cvImport.rescreen.body')}
        </Notice>
      )}

      {importError && (
        <Notice variant="danger" title={t('cvImport.error.title')}>
          {t('cvImport.error.body')}
        </Notice>
      )}

      <Card className={styles.sourceCard}>
        <h2 className={styles.sectionTitle}>{t('cvImport.sources.title')}</h2>
        <div className={styles.sourceOptions}>
          {(['manual', 'drive', 'batch'] as ImportSource[]).map((source) => (
            <button
              key={source}
              type="button"
              aria-pressed={importSource === source}
              className={`${styles.sourceButton} ${importSource === source ? styles.active : ''}`}
              onClick={() => handleSourceChange(source)}
            >
              {t(`cvImport.sources.${source}`)}
            </button>
          ))}
        </div>
      </Card>

      <Card className={styles.validationCard}>
        <h2 className={styles.sectionTitle}>{t('cvImport.validation.title')}</h2>
        <div className={styles.validationGrid}>
          {validationScenarios.map((scenario) => (
            <div key={scenario.id} className={styles.validationItem}>
              <StatusBadge variant={scenario.state} label={t(`cvImport.validation.${scenario.titleKey}`)} />
              <p>{t(`cvImport.validation.${scenario.bodyKey}`)}</p>
            </div>
          ))}
        </div>
      </Card>

      {importSource === 'manual' && (
        <Card className={styles.uploadCard}>
          <h2 className={styles.sectionTitle}>{t('cvImport.manual.title')}</h2>
          <div className={styles.uploadZone}>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className={styles.uploadLabel}>
              {selectedFiles.length > 0
                ? t('cvImport.manual.filesSelected', { count: selectedFiles.length })
                : t('cvImport.manual.selectFiles')}
            </label>
          </div>
          <div className={styles.actions}>
            {versionCreated && !rescreenRequested && (
              <Button variant="secondary" onClick={() => setRescreenRequested(true)}>
                {t('cvImport.rescreen.action')}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={selectedFiles.length === 0 || importing}
            >
              {importing ? t('cvImport.manual.importing') : t('cvImport.manual.import')}
            </Button>
          </div>
        </Card>
      )}

      {importSource === 'drive' && (
        <Card className={styles.driveCard}>
          <h2 className={styles.sectionTitle}>{t('cvImport.drive.title')}</h2>
          <div className={styles.formGroup}>
            <label htmlFor="driveFolder">{t('cvImport.drive.folderPath')}</label>
            <input
              type="text"
              id="driveFolder"
              value={driveFolder}
              onChange={(event) => handleDriveFolderChange(event.target.value)}
              placeholder="/Recruitment/CVs/2026"
              className={styles.input}
            />
          </div>
          <div className={styles.actions}>
            {versionCreated && !rescreenRequested && (
              <Button variant="secondary" onClick={() => setRescreenRequested(true)}>
                {t('cvImport.rescreen.action')}
              </Button>
            )}
            <Button variant="primary" onClick={handleImport} disabled={!driveFolder || importing}>
              {importing ? t('cvImport.drive.scanning') : t('cvImport.drive.scan')}
            </Button>
          </div>
        </Card>
      )}

      {importSource === 'batch' && (
        <Card className={styles.batchCard}>
          <h2 className={styles.sectionTitle}>{t('cvImport.batch.title')}</h2>
          <Notice variant="warning" title={t('cvImport.batch.noticeTitle')}>
            {t('cvImport.batch.noticeBody')}
          </Notice>
        </Card>
      )}
    </div>
  );
}
