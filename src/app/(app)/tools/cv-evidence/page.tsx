'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
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
  const [loadError, setLoadError] = useState<string>('');
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
        if (!cancelled) {
          setCVEvidence(null);
          setLoadError('');
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
        setLoadError('');
      }
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (cancelled) return;

        // Find matching mock evidence
        const evidence = mockCVEvidence.find((e) => e.candidateId === selectedCandidateId);
        setCVEvidence(evidence || null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[cv-evidence] Failed to load CV evidence:', errorMessage);
        if (!cancelled) {
          setCVEvidence(null);
          setLoadError(t('tools.cvEvidence.loadFailed'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadCVEvidence();
    return () => { cancelled = true; };
  }, [selectedCandidateId, t]);

  const handleViewOriginal = () => {
    if (cvEvidence?.originalCvUrl) {
      window.open(cvEvidence.originalCvUrl, '_blank');
    }
  };

  const handleSectionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const lastIndex = sections.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowRight: index === lastIndex ? 0 : index + 1,
      ArrowLeft: index === 0 ? lastIndex : index - 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();
    setSelectedSection(sections[nextIndex].key);
  };

  const renderEducation = () => {
    if (!cvEvidence?.structuredData.education.length) {
      return <p className={styles.itemMeta}>{t('tools.cvEvidence.noData')}</p>;
    }

    return (
      <div className={styles.evidenceList}>
        {cvEvidence.structuredData.education.map((edu, idx) => (
          <div key={`education-${edu.institution}-${edu.degree}-${idx}`} className={styles.evidenceItem}>
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
        {cvEvidence.structuredData.experience.map((exp, idx) => (
          <div key={`experience-${exp.company}-${exp.title}-${idx}`} className={styles.evidenceItem}>
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
                  <li key={`achievement-${exp.company}-${exp.title}-${achievement}-${i}`}>{achievement}</li>
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
        {cvEvidence.structuredData.skills.map((skill, idx) => (
          <span key={`skill-${skill}-${idx}`} className={styles.skillBadge}>
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
        {cvEvidence.structuredData.certifications.map((cert, idx) => (
          <div key={`certification-${cert}-${idx}`} className={styles.evidenceItem}>
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
    <main id="main-content" className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/tools" className={styles.backLink}>
            ← {t('tools.hub.title')}
          </Link>
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
            <Button variant="secondary" aria-label={t('common.viewOriginalAria')} onClick={handleViewOriginal}>
              {t('tools.cvEvidence.viewOriginal')}
            </Button>
          </div>
        )}
      </div>

      <Notice variant="info" title={t('tools.cvEvidence.sourceOfTruthTitle')}>
        {t('tools.cvEvidence.sourceOfTruthDesc')}
      </Notice>

      {loadError && (
        <Notice variant="danger" title={t('common.error.title')}>
          {loadError}
        </Notice>
      )}

      {isLoading ? (
        <LoadingState />
      ) : cvEvidence ? (
        <>
          <div className={styles.viewerLayout}>
            <nav className={styles.sidebar} role="tablist" aria-label={t('tools.cvEvidence.sectionsAria', { defaultValue: 'CV sections' })}>
              {sections.map((section, idx) => (
                <button
                  key={section.key}
                  id={`${section.key}-tab`}
                  className={`${styles.tabButton} ${
                    selectedSection === section.key ? styles.tabButtonActive : ''
                  }`}
                  role="tab"
                  onClick={() => setSelectedSection(section.key)}
                  onKeyDown={(e) => handleSectionKeyDown(e, idx)}
                  aria-selected={selectedSection === section.key}
                  aria-controls={`${section.key}-panel`}
                  tabIndex={selectedSection === section.key ? 0 : -1}
                >
                  {t(section.labelKey)}
                </button>
              ))}
            </nav>

            <div className={styles.contentArea}>
              <div
                id="education-panel"
                role="tabpanel"
                aria-labelledby="education-tab"
                hidden={selectedSection !== 'education'}
              >
                <Card className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>
                    {t(`tools.cvEvidence.sections.education`)}
                  </h2>
                  {renderEducation()}
                </Card>
              </div>
              <div
                id="experience-panel"
                role="tabpanel"
                aria-labelledby="experience-tab"
                hidden={selectedSection !== 'experience'}
              >
                <Card className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>
                    {t(`tools.cvEvidence.sections.experience`)}
                  </h2>
                  {renderExperience()}
                </Card>
              </div>
              <div
                id="skills-panel"
                role="tabpanel"
                aria-labelledby="skills-tab"
                hidden={selectedSection !== 'skills'}
              >
                <Card className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>
                    {t(`tools.cvEvidence.sections.skills`)}
                  </h2>
                  {renderSkills()}
                </Card>
              </div>
              <div
                id="certifications-panel"
                role="tabpanel"
                aria-labelledby="certifications-tab"
                hidden={selectedSection !== 'certifications'}
              >
                <Card className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>
                    {t(`tools.cvEvidence.sections.certifications`)}
                  </h2>
                  {renderCertifications()}
                </Card>
              </div>

              <Card className={styles.provenanceCard}>
                <h3 className={styles.provenanceTitle}>
                  {t('tools.cvEvidence.provenance')}
                </h3>
                <dl className={styles.provenanceGrid}>
                  <div className={styles.provenanceItem}>
                    <dt>{t('tools.cvEvidence.extractionModel')}</dt>
                    <dd className={styles.provenanceValue}>{t('tools.cvEvidence.aiReviewEngine')}</dd>
                  </div>
                  <div className={styles.provenanceItem}>
                    <dt>{t('tools.cvEvidence.confidence')}</dt>
                    <dd className={styles.provenanceValue}>{t('tools.cvEvidence.confidenceValue')}</dd>
                  </div>
                  <div className={styles.provenanceItem}>
                    <dt>{t('tools.cvEvidence.extractedAt')}</dt>
                    <dd className={styles.provenanceValue}>
                      {formatDateTime(cvEvidence.extractedAt, locale)}
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        </>
      ) : selectedCandidateId ? (
        <div className={styles.emptyState}>
          <p>{t('tools.cvEvidence.noData')}</p>
        </div>
      ) : null}
    </main>
  );
}