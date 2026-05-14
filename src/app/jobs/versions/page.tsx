'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { Card, Button, Notice, StatusBadge } from '@/components';
import { mockJobs, mockJDVersions, mockOriginalJDDocuments, mockParsedJDProfiles } from '@/lib/jobIntakeMockData';
import type { JDVersion, ParsedJDProfile, OriginalJDDocument } from '@/types';
import styles from './jd-versions.module.css';

interface VersionWithDetails {
  version: JDVersion;
  parsedProfile: ParsedJDProfile | undefined;
  document: OriginalJDDocument | undefined;
  jobTitle: string;
}

export default function JDVersionHistoryPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [selectedJobId, setSelectedJobId] = useState<string>('job-001');
  const [compareVersions, setCompareVersions] = useState<[string, string] | null>(null);

  const selectedJob = mockJobs.find((job) => job.id === selectedJobId);
  const versionsForJob = mockJDVersions
    .filter((version) => version.jobId === selectedJobId)
    .sort((firstVersion, secondVersion) => secondVersion.versionNumber - firstVersion.versionNumber);

  const versionsWithDetails: VersionWithDetails[] = versionsForJob.map((version) => {
    const parsedProfile = mockParsedJDProfiles.find((profile) => profile.jdVersionId === version.id);
    const document = mockOriginalJDDocuments.find((jdDocument) => jdDocument.id === version.jdDocumentId);

    return {
      version,
      parsedProfile,
      document,
      jobTitle: selectedJob?.title ?? t('jobs.versions.unknownJob'),
    };
  });

  const currentVersion = versionsWithDetails.find((item) => item.version.status === 'approved');

  const handleJobChange = (jobId: string): void => {
    setSelectedJobId(jobId);
    setCompareVersions(null);
  };

  const handleCompare = (firstVersionId: string, secondVersionId: string): void => {
    setCompareVersions([firstVersionId, secondVersionId]);
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'default' => {
    if (status === 'approved') return 'success';
    if (status === 'pending') return 'warning';
    return 'default';
  };

  const renderComparison = () => {
    if (!compareVersions) return null;

    const firstVersion = versionsWithDetails.find((item) => item.version.id === compareVersions[0]);
    const secondVersion = versionsWithDetails.find((item) => item.version.id === compareVersions[1]);

    if (!firstVersion?.parsedProfile || !secondVersion?.parsedProfile) return null;

    const skillsAdded = secondVersion.parsedProfile.skills.filter((skill) => !firstVersion.parsedProfile?.skills.includes(skill));
    const skillsRemoved = firstVersion.parsedProfile.skills.filter((skill) => !secondVersion.parsedProfile?.skills.includes(skill));
    const responsibilitiesAdded = secondVersion.parsedProfile.responsibilities.filter(
      (responsibility) => !firstVersion.parsedProfile?.responsibilities.includes(responsibility)
    );
    const responsibilitiesRemoved = firstVersion.parsedProfile.responsibilities.filter(
      (responsibility) => !secondVersion.parsedProfile?.responsibilities.includes(responsibility)
    );
    const requirementsAdded = secondVersion.parsedProfile.requirements.filter(
      (requirement) => !firstVersion.parsedProfile?.requirements.includes(requirement)
    );
    const requirementsRemoved = firstVersion.parsedProfile.requirements.filter(
      (requirement) => !secondVersion.parsedProfile?.requirements.includes(requirement)
    );

    return (
      <Card className={styles.comparisonCard}>
        <div className={styles.comparisonHeader}>
          <h2 className={styles.comparisonTitle}>{t('jobs.versions.comparison')}</h2>
          <Button variant="secondary" onClick={() => setCompareVersions(null)}>
            {t('common.dismiss')}
          </Button>
        </div>

        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonColumn}>
            <h3 className={styles.comparisonColumnTitle}>
              {t('jobs.versions.version')} {firstVersion.version.versionNumber}
            </h3>
            <p className={styles.comparisonMeta}>
              {t('jobs.versions.created')}: {formatDateTime(firstVersion.version.createdAt, locale)}
            </p>
          </div>
          <div className={styles.comparisonColumn}>
            <h3 className={styles.comparisonColumnTitle}>
              {t('jobs.versions.version')} {secondVersion.version.versionNumber}
            </h3>
            <p className={styles.comparisonMeta}>
              {t('jobs.versions.created')}: {formatDateTime(secondVersion.version.createdAt, locale)}
            </p>
          </div>
        </div>

        <div className={styles.deltaSection}>
          <h4 className={styles.deltaSectionTitle}>{t('jobs.versions.skillsChanges')}</h4>
          {skillsAdded.length > 0 && (
            <div className={styles.deltaItem}>
              <span className={styles.deltaLabel}>{t('jobs.versions.added')}:</span>
              <div className={styles.skillsGrid}>
                {skillsAdded.map((skill) => (
                  <span key={skill} className={`${styles.skillBadge} ${styles.skillAdded}`}>
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skillsRemoved.length > 0 && (
            <div className={styles.deltaItem}>
              <span className={styles.deltaLabel}>{t('jobs.versions.removed')}:</span>
              <div className={styles.skillsGrid}>
                {skillsRemoved.map((skill) => (
                  <span key={skill} className={`${styles.skillBadge} ${styles.skillRemoved}`}>
                    - {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skillsAdded.length === 0 && skillsRemoved.length === 0 && (
            <p className={styles.noChanges}>{t('jobs.versions.noChanges')}</p>
          )}
        </div>

        <div className={styles.deltaSection}>
          <h4 className={styles.deltaSectionTitle}>{t('jobs.versions.responsibilitiesChanges')}</h4>
          {responsibilitiesAdded.length > 0 && (
            <div className={styles.deltaItem}>
              <span className={styles.deltaLabel}>{t('jobs.versions.added')}:</span>
              <ul className={styles.deltaList}>
                {responsibilitiesAdded.map((responsibility) => (
                  <li key={responsibility} className={styles.deltaAdded}>
                    + {responsibility}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {responsibilitiesRemoved.length > 0 && (
            <div className={styles.deltaItem}>
              <span className={styles.deltaLabel}>{t('jobs.versions.removed')}:</span>
              <ul className={styles.deltaList}>
                {responsibilitiesRemoved.map((responsibility) => (
                  <li key={responsibility} className={styles.deltaRemoved}>
                    - {responsibility}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {responsibilitiesAdded.length === 0 && responsibilitiesRemoved.length === 0 && (
            <p className={styles.noChanges}>{t('jobs.versions.noChanges')}</p>
          )}
        </div>

        <div className={styles.deltaSection}>
          <h4 className={styles.deltaSectionTitle}>{t('jobs.versions.requirementsChanges')}</h4>
          {requirementsAdded.length > 0 && (
            <div className={styles.deltaItem}>
              <span className={styles.deltaLabel}>{t('jobs.versions.added')}:</span>
              <ul className={styles.deltaList}>
                {requirementsAdded.map((requirement) => (
                  <li key={requirement} className={styles.deltaAdded}>
                    + {requirement}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {requirementsRemoved.length > 0 && (
            <div className={styles.deltaItem}>
              <span className={styles.deltaLabel}>{t('jobs.versions.removed')}:</span>
              <ul className={styles.deltaList}>
                {requirementsRemoved.map((requirement) => (
                  <li key={requirement} className={styles.deltaRemoved}>
                    - {requirement}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {requirementsAdded.length === 0 && requirementsRemoved.length === 0 && (
            <p className={styles.noChanges}>{t('jobs.versions.noChanges')}</p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('jobs.versions.title')}</h1>
        <p className={styles.description}>{t('jobs.versions.description')}</p>
      </header>

      <Notice variant="info" title={t('jobs.versions.noticeTitle')}>
        {t('jobs.versions.noticeBody')}
      </Notice>

      <div className={styles.jobSelector}>
        <label htmlFor="jobSelect" className={styles.jobSelectorLabel}>
          {t('jobs.versions.selectJob')}:
        </label>
        <select
          id="jobSelect"
          value={selectedJobId}
          onChange={(event) => handleJobChange(event.target.value)}
          className={styles.jobSelectorInput}
        >
          {mockJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {compareVersions && renderComparison()}

      <Card className={styles.versionsCard}>
        <h2 className={styles.sectionTitle}>
          {t('jobs.versions.versionHistory')} ({versionsWithDetails.length})
        </h2>

        {versionsWithDetails.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('jobs.versions.noVersions')}</p>
          </div>
        ) : (
          <div className={styles.versionList}>
            {versionsWithDetails.map((item, index) => {
              const previousVersion = versionsWithDetails[index + 1];

              return (
                <div key={item.version.id} className={styles.versionItem}>
                <div className={styles.versionHeader}>
                  <div>
                    <h3 className={styles.versionTitle}>
                      {item.jobTitle} · {t('jobs.versions.version')} {item.version.versionNumber}
                      {currentVersion?.version.id === item.version.id && (
                        <span className={styles.currentBadge}>{t('jobs.versions.current')}</span>
                      )}
                    </h3>
                    <p className={styles.versionMeta}>
                      {t('jobs.versions.created')}: {formatDateTime(item.version.createdAt, locale)}
                      {item.version.approvedAt && (
                        <>
                          {' • '}
                          {t('jobs.versions.approved')}: {formatDateTime(item.version.approvedAt, locale)}
                        </>
                      )}
                    </p>
                  </div>
                  <StatusBadge
                    variant={getStatusVariant(item.version.status)}
                    label={t(`common.status.${item.version.status}`)}
                  />
                </div>

                <div className={styles.versionDetails}>
                  <div className={styles.versionDetailItem}>
                    <span className={styles.versionDetailLabel}>{t('jobs.versions.sourceDocument')}:</span>
                    <span className={styles.versionDetailValue}>
                      {item.document?.fileName ?? item.document?.sourceType ?? t('common.notAvailable')}
                    </span>
                  </div>
                  <div className={styles.versionDetailItem}>
                    <span className={styles.versionDetailLabel}>{t('jobs.versions.sourceType')}:</span>
                    <span className={styles.versionDetailValue}>{item.document?.sourceType ?? t('common.notAvailable')}</span>
                  </div>
                  {item.parsedProfile && (
                    <>
                      <div className={styles.versionDetailItem}>
                        <span className={styles.versionDetailLabel}>{t('jobs.versions.parsedCriteria')}:</span>
                        <span className={styles.versionDetailValue}>
                          v{item.parsedProfile.parsedCriteriaVersion}
                        </span>
                      </div>
                      <div className={styles.versionDetailItem}>
                        <span className={styles.versionDetailLabel}>{t('jobs.versions.skillsCount')}:</span>
                        <span className={styles.versionDetailValue}>{item.parsedProfile.skills.length}</span>
                      </div>
                    </>
                  )}
                </div>

                {previousVersion && (
                  <div className={styles.versionActions}>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleCompare(previousVersion.version.id, item.version.id)
                      }
                    >
                      {t('jobs.versions.compareWithPrevious')}
                    </Button>
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
