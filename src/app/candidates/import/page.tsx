'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, Button, Notice, StatusBadge } from '@/components';
import cvService from '@/services/cvService';
import styles from './cv-import.module.css';

type ImportSource = 'manual' | 'drive' | 'batch';
type ValidationState = 'success' | 'warning' | 'danger' | 'info';

const importSources: ImportSource[] = ['manual', 'drive', 'batch'];

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

  const handleSourceKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, source: ImportSource): void => {
    const currentIndex = importSources.indexOf(source);
    const lastIndex = importSources.length - 1;
    const nextIndexByKey: Partial<Record<string, number>> = {
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextSource = importSources[nextIndex];
    handleSourceChange(nextSource);
    document.getElementById(`cv-import-tab-${nextSource}`)?.focus();
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
        <>
          <Notice variant="warning" title={t('cvImport.rescreen.title')}>
            {rescreenRequested ? t('cvImport.rescreen.requested') : t('cvImport.rescreen.body')}
          </Notice>

          <Card className={styles.timelineCard}>
            <h2 className={styles.sectionTitle}>{t('cvImport.timeline.title')}</h2>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineMarker}>
                  <StatusBadge variant="success" label="" />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.timelineStep}>{t('cvImport.timeline.importCompleted')}</h3>
                  <p className={styles.timelineDescription}>{t('cvImport.timeline.importCompletedBody')}</p>
                </div>
              </div>

              {rescreenRequested && (
                <div className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <StatusBadge variant="info" label="" />
                  </div>
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineStep}>{t('cvImport.timeline.rescreenQueued')}</h3>
                    <p className={styles.timelineDescription}>{t('cvImport.timeline.rescreenQueuedBody')}</p>
                  </div>
                </div>
              )}

              <div className={styles.timelineItem}>
                <div className={styles.timelineMarker}>
                  <StatusBadge variant={rescreenRequested ? 'warning' : 'info'} label="" />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.timelineStep}>{t('cvImport.timeline.screeningReview')}</h3>
                  <p className={styles.timelineDescription}>{t('cvImport.timeline.screeningReviewBody')}</p>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineMarker}>
                  <StatusBadge variant="info" label="" />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.timelineStep}>{t('cvImport.timeline.interviewScheduling')}</h3>
                  <p className={styles.timelineDescription}>{t('cvImport.timeline.interviewSchedulingBody')}</p>
                </div>
              </div>
            </div>

            <div className={styles.timelineActions}>
              <Link href="/screening/review">
                <Button variant="primary">
                  {t('cvImport.timeline.ctaToScreening')}
                </Button>
              </Link>
            </div>
          </Card>
        </>
      )}

      {importError && (
        <Notice variant="danger" title={t('cvImport.error.title')}>
          {t('cvImport.error.body')}
        </Notice>
      )}

      <Card className={styles.sourceCard}>
        <h2 className={styles.sectionTitle}>{t('cvImport.sources.title')}</h2>
        <div className={styles.sourceOptions} role="tablist" aria-label={t('cvImport.sources.title')}>
          {importSources.map((source) => (
            <button
              key={source}
              id={`cv-import-tab-${source}`}
              type="button"
              role="tab"
              aria-selected={importSource === source}
              aria-controls={`cv-import-panel-${source}`}
              tabIndex={importSource === source ? 0 : -1}
              className={`${styles.sourceButton} ${importSource === source ? styles.active : ''}`}
              onClick={() => handleSourceChange(source)}
              onKeyDown={(event) => handleSourceKeyDown(event, source)}
            >
              {t(`cvImport.sources.${source}`)}
            </button>
          ))}
        </div>
      </Card>

      <Card className={styles.validationCard}>
        <h2 className={styles.sectionTitle}>{t('cvImport.validation.title')}</h2>
        <p className={styles.validationIntro}>{t('cvImport.validation.guidance')}</p>
        <details className={styles.validationDetails}>
          <summary>{t('cvImport.validation.showDetails')}</summary>
          <div className={styles.validationGrid}>
            {validationScenarios.map((scenario) => (
              <div key={scenario.id} className={styles.validationItem}>
                <StatusBadge variant={scenario.state} label={t(`cvImport.validation.${scenario.titleKey}`)} />
                <p>{t(`cvImport.validation.${scenario.bodyKey}`)}</p>
              </div>
            ))}
          </div>
        </details>
      </Card>

      {importSource === 'manual' && (
        <div id="cv-import-panel-manual" role="tabpanel" aria-labelledby="cv-import-tab-manual">
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
        </div>
      )}

      {importSource === 'drive' && (
        <div id="cv-import-panel-drive" role="tabpanel" aria-labelledby="cv-import-tab-drive">
          <Card className={styles.driveCard}>
            <h2 className={styles.sectionTitle}>{t('cvImport.drive.title')}</h2>
          <div className={styles.formGroup}>
            <label htmlFor="driveFolder">{t('cvImport.drive.folderPath')}</label>
            <input
              type="text"
              id="driveFolder"
              value={driveFolder}
              onChange={(event) => handleDriveFolderChange(event.target.value)}
              placeholder={t('cvImport.drive.folderPathPlaceholder')}
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
        </div>
      )}

      {importSource === 'batch' && (
        <div id="cv-import-panel-batch" role="tabpanel" aria-labelledby="cv-import-tab-batch">
          <Card className={styles.batchCard}>
            <h2 className={styles.sectionTitle}>{t('cvImport.batch.title')}</h2>
          <Notice variant="warning" title={t('cvImport.batch.noticeTitle')}>
            {t('cvImport.batch.noticeBody')}
          </Notice>
          </Card>
        </div>
      )}
    </div>
  );
}
