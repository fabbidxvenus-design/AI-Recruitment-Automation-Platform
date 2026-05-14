'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Notice } from '@/components';
import cvService from '@/services/cvService';
import styles from './cv-import.module.css';

type ImportSource = 'manual' | 'drive' | 'batch';

export default function CVImportPage() {
  const { t } = useTranslation();
  const [importSource, setImportSource] = useState<ImportSource>('manual');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [driveFolder, setDriveFolder] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      if (importSource === 'manual' && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await cvService.importCV({
            candidateId: `cand-${Date.now()}`,
            fileName: file.name,
            fileContent: 'mock-content',
          });
        }
        alert(`Successfully imported ${selectedFiles.length} CV(s)`);
        setSelectedFiles([]);
      } else if (importSource === 'drive' && driveFolder) {
        alert(`Scanning Drive folder: ${driveFolder}`);
      }
    } catch (error) {
      alert('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>CV Import</h1>
        <p className={styles.description}>Import candidate CVs from multiple sources</p>
      </header>

      <Notice variant="info" title="CV Versioning">
        Each new CV upload creates a new version. Previous versions are retained for traceability.
      </Notice>

      <Card className={styles.sourceCard}>
        <h2 className={styles.sectionTitle}>Select Import Source</h2>
        <div className={styles.sourceOptions}>
          <button
            className={`${styles.sourceButton} ${importSource === 'manual' ? styles.active : ''}`}
            onClick={() => setImportSource('manual')}
          >
            📄 Manual Upload
          </button>
          <button
            className={`${styles.sourceButton} ${importSource === 'drive' ? styles.active : ''}`}
            onClick={() => setImportSource('drive')}
          >
            ☁️ Google Drive
          </button>
          <button
            className={`${styles.sourceButton} ${importSource === 'batch' ? styles.active : ''}`}
            onClick={() => setImportSource('batch')}
          >
            📦 Batch Import
          </button>
        </div>
      </Card>

      {importSource === 'manual' && (
        <Card className={styles.uploadCard}>
          <h2 className={styles.sectionTitle}>Upload CV Files</h2>
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
                ? `${selectedFiles.length} file(s) selected`
                : 'Click to select PDF files'}
            </label>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={selectedFiles.length === 0 || importing}
            >
              {importing ? 'Importing...' : 'Import CVs'}
            </Button>
          </div>
        </Card>
      )}

      {importSource === 'drive' && (
        <Card className={styles.driveCard}>
          <h2 className={styles.sectionTitle}>Google Drive Import</h2>
          <div className={styles.formGroup}>
            <label htmlFor="driveFolder">Drive Folder Path</label>
            <input
              type="text"
              id="driveFolder"
              value={driveFolder}
              onChange={(e) => setDriveFolder(e.target.value)}
              placeholder="/Recruitment/CVs/2026"
              className={styles.input}
            />
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!driveFolder || importing}
            >
              {importing ? 'Scanning...' : 'Scan Folder'}
            </Button>
          </div>
        </Card>
      )}

      {importSource === 'batch' && (
        <Card className={styles.batchCard}>
          <h2 className={styles.sectionTitle}>Batch Import</h2>
          <Notice variant="warning" title="Feature Not Available">
            Batch import from Excel/Sheets is not yet implemented in this prototype.
          </Notice>
        </Card>
      )}
    </div>
  );
}
