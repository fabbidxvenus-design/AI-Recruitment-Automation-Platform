'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { Card, Button, Notice, LoadingState } from '@/components';
import { mockCVEvidence } from '@/lib/phase2MockData';
import type { Candidate, CVEvidenceExtraction } from '@/types';
import { mockCandidates } from '@/lib/mockData';
import styles from './cv-evidence.module.css';

type SectionKey = 'education' | 'experience' | 'skills' | 'certifications';

export default function CVEvidencePage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<SectionKey>('education');
  const [isLoading, setIsLoading] = useState(false);
  const [cvEvidence, setCVEvidence] = useState<CVEvidenceExtraction | null>(null);

  // Candidate options for dropdown
  const candidates: Candidate[] = mockCandidates;
  const candidateOptions = candidates.map((c) => ({
    value: c.id,
    label: `${c.firstName} ${c.lastName}`,
  }));

  // Load CV evidence when candidate is selected
  useEffect(() => {
    let cancelled = false;

    const loadCVEvidence = async () => {
      if (!selectedCandidateId) {
        await Promise.resolve();
        if (!cancelled) setCVEvidence(null);
        return;
      }

      if (!cancelled) setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (cancelled) return;

        // Find matching mock evidence
        const evidence = mockCVEvidence.find((e) => e.candidateId === selectedCandidateId);
        setCVEvidence(evidence || null);
      } catch {
        if (!cancelled) setCVEvidence(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadCVEvidence();
    return () => { cancelled = true; };
  }, [selectedCandidateId]);

  const handleViewOriginal = () => {
    if (cvEvidence?.originalCvUrl) {
      window.open(cvEvidence.originalCvUrl, '_blank');
    }
  };

  const renderEducation = () => {
    if (!cvEvidence?.structuredData.education.length) {
      return <p className={styles.itemMeta}>{t('tools.cvEvidence.noData')}</p>;
    }

    return (
      <div className={styles.evidenceList}>
        {cvEvidence.structuredData.education.map((edu, index) => (
          <div key={index} className={styles.evidenceItem}>
            <h3 className={styles.itemTitle}>{edu.institution}</h3>
            <p className={styles.itemSubtitle}>{edu.degree}</p>
            {edu.fieldOfStudy && (
              <p className={styles.itemMeta}>{edu.fieldOfStudy}</p>
            )}
            {(edu.startDate || edu.endDate) && (
              <p className={styles.itemMeta}>
                {edu.startDate} - {edu.endDate}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExperience = () => {
    if (!cvEvidence?.structuredData.experience.length) {
      return <p className={styles.itemMeta}>{t('tools.cvEvidence.noData')}</p>;
    }

    return (
      <div className={styles.evidenceList}>
        {cvEvidence.structuredData.experience.map((exp, index) => (
          <div key={index} className={styles.evidenceItem}>
            <div className={styles.itemHeader}>
              <h3 className={styles.itemTitle}>{exp.title}</h3>
            </div>
            <p className={styles.itemSubtitle}>{exp.company}</p>
            {(exp.startDate || exp.endDate) && (
              <p className={styles.itemMeta}>
                {exp.startDate} - {exp.endDate}
              </p>
            )}
            {exp.description && (
              <p className={styles.itemDescription}>{exp.description}</p>
            )}
            {exp.achievements.length > 0 && (
              <ul className={styles.achievementList}>
                {exp.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (!cvEvidence?.structuredData.skills.length) {
      return <p className={styles.itemMeta}>{t('tools.cvEvidence.noData')}</p>;
    }

    return (
      <div className={styles.skillsGrid}>
        {cvEvidence.structuredData.skills.map((skill, index) => (
          <span key={index} className={styles.skillBadge}>
            {skill}
          </span>
        ))}
      </div>
    );
  };

  const renderCertifications = () => {
    if (!cvEvidence?.structuredData.certifications.length) {
      return <p className={styles.itemMeta}>{t('tools.cvEvidence.noData')}</p>;
    }

    return (
      <div className={styles.evidenceList}>
        {cvEvidence.structuredData.certifications.map((cert, index) => (
          <div key={index} className={styles.evidenceItem}>
            <h3 className={styles.itemTitle}>{cert}</h3>
          </div>
        ))}
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'education':
        return renderEducation();
      case 'experience':
        return renderExperience();
      case 'skills':
        return renderSkills();
      case 'certifications':
        return renderCertifications();
      default:
        return null;
    }
  };

  const sections: { key: SectionKey; labelKey: string }[] = [
    { key: 'education', labelKey: 'tools.cvEvidence.sections.education' },
    { key: 'experience', labelKey: 'tools.cvEvidence.sections.experience' },
    { key: 'skills', labelKey: 'tools.cvEvidence.sections.skills' },
    { key: 'certifications', labelKey: 'tools.cvEvidence.sections.certifications' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/tools" className={styles.backLink}>
            ← {t('tools.hub.title')}
          </a>
        </div>
        <h1 className={styles.title}>{t('tools.cvEvidence.title')}</h1>
        <p className={styles.description}>{t('tools.cvEvidence.description')}</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.selectGroup}>
          <label htmlFor="candidate-select">{t('tools.cvEvidence.selectCandidate')}</label>
          <select
            id="candidate-select"
            className={styles.select}
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
          >
            <option value="">-- {t('tools.cvEvidence.selectCandidate')} --</option>
            {candidateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {cvEvidence && (
          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleViewOriginal}>
              {t('tools.cvEvidence.viewOriginal')}
            </Button>
          </div>
        )}
      </div>

      <Notice variant="info" title={t('tools.cvEvidence.sourceOfTruthTitle')}>
        {t('tools.cvEvidence.sourceOfTruthDesc')}
      </Notice>

      {isLoading ? (
        <LoadingState />
      ) : cvEvidence ? (
        <>
          <div className={styles.viewerLayout}>
            <nav className={styles.sidebar} aria-label="CV sections">
              {sections.map((section) => (
                <button
                  key={section.key}
                  className={`${styles.tabButton} ${
                    selectedSection === section.key ? styles.tabButtonActive : ''
                  }`}
                  onClick={() => setSelectedSection(section.key)}
                  aria-current={selectedSection === section.key ? 'page' : undefined}
                >
                  {t(section.labelKey)}
                </button>
              ))}
            </nav>

            <div className={styles.contentArea}>
              <Card className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>
                  {t(`tools.cvEvidence.sections.${selectedSection}`)}
                </h2>
                {renderSectionContent()}
              </Card>

              <Card className={styles.provenanceCard}>
                <h3 className={styles.provenanceTitle}>
                  {t('tools.cvEvidence.provenance')}
                </h3>
                <div className={styles.provenanceGrid}>
                  <div className={styles.provenanceItem}>
                    <label>{t('tools.cvEvidence.extractionModel')}</label>
                    <span className={styles.provenanceValue}>{t('tools.cvEvidence.aiReviewEngine')}</span>
                  </div>
                  <div className={styles.provenanceItem}>
                    <label>{t('tools.cvEvidence.confidence')}</label>
                    <span className={styles.provenanceValue}>92%</span>
                  </div>
                  <div className={styles.provenanceItem}>
                    <label>{t('tools.cvEvidence.extractedAt')}</label>
                    <span className={styles.provenanceValue}>
                      {formatDateTime(cvEvidence.extractedAt, locale)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : selectedCandidateId ? (
        <div className={styles.emptyState}>
          <p>{t('tools.cvEvidence.noData')}</p>
        </div>
      ) : null}
    </div>
  );
}