'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDate, formatDateTime } from '@/lib/formatDate';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockTestResults } from '@/lib/mockData';
import { markTestGraded, resolveTestResultForActivePlan } from '@/lib/assessmentWorkflowState';
import styles from './grading.module.css';

type TabType = 'all' | 'mcq' | 'essay' | 'coding';

export default function TestGradingPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const activeWorkflowTest = resolveTestResultForActivePlan();
  const workflowTestResults = [activeWorkflowTest, ...mockTestResults.filter((test) => test.id !== activeWorkflowTest.id)];
  const [selectedTest, setSelectedTest] = useState<string | null>(activeWorkflowTest.id);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const selected = workflowTestResults.find(test => test.id === selectedTest);

  const filteredTests = workflowTestResults.filter(test => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mcq') return test.testName.includes('JavaScript') || test.testName.includes('MCQ');
    if (activeTab === 'essay') return test.testName.includes('Design') || test.testName.includes('Essay');
    if (activeTab === 'coding') return test.testName.includes('Coding') || test.testName.includes('Challenge');
    return true;
  });

  const handleOverrideSubmit = () => {
    if (overrideReason.trim()) {
      alert(`Override submitted with reason: ${overrideReason}`);
      setOverrideModalOpen(false);
      setOverrideReason('');
    }
  };

  return (
    <div className={styles.gradingPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('tests.grading.title')}</h1>
          <p className={styles.description}>
            {t('tests.grading.description')}
          </p>
        </div>
      </div>

      <Notice variant="blocker" title={t('tests.grading.notice.title')}>
        {t('tests.grading.notice.body')}
      </Notice>

      <div className={styles.tabs}>
        {(['all', 'mcq', 'essay', 'coding'] as TabType[]).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`tests.grading.tabs.${tab}`)}
            <span className={styles.tabCount}>
              {tab === 'all' ? workflowTestResults.length : workflowTestResults.filter(t => {
                if (tab === 'mcq') return t.testName.includes('JavaScript');
                if (tab === 'essay') return t.testName.includes('Design');
                if (tab === 'coding') return t.testName.includes('Coding');
                return true;
              }).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.testList}>
          <Card>
            <CardHeader title={t('tests.grading.results.title')} description={t('tests.grading.results.count', { count: filteredTests.length })} />
            <CardContent>
              <div className={styles.testItems}>
                {filteredTests.map(test => (
                  <div
                    key={test.id}
                    className={`${styles.testItem} ${selectedTest === test.id ? styles.selected : ''}`}
                    onClick={() => setSelectedTest(test.id)}
                  >
                    <div className={styles.testHeader}>
                      <span className={styles.testName}>{test.testName}</span>
                      <StatusBadge
                        variant={test.status === 'approved' ? 'success' : test.status === 'flagged' ? 'warning' : 'danger'}
                        label={test.status}
                      />
                    </div>
                    <div className={styles.testMeta}>
                      <span>{test.candidateName}</span>
                      <span>{formatDate(test.gradedAt, locale)}</span>
                    </div>
                    <div className={styles.testScore}>
                      <span className={styles.scoreValue}>{test.score}</span>
                      <span className={styles.scoreMax}>/{test.maxScore}</span>
                      <span className={styles.gradingMethod}>
                        {test.gradedBy === 'ai' ? t('tests.grading.gradedBy.ai') : test.gradedBy === 'override' ? t('tests.grading.gradedBy.humanOverride') : t('tests.grading.gradedBy.human')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.detailPanel}>
          {selected ? (
            <Card>
              <CardHeader
                title={selected.testName}
                description={selected.candidateName}
                action={
                  <div className={styles.scoreDisplay}>
                    <span className={styles.scoreLarge}>{selected.score}</span>
                    <span className={styles.scoreDivider}>/</span>
                    <span className={styles.scoreMaxLarge}>{selected.maxScore}</span>
                  </div>
                }
              />
              <CardContent>
                <div className={styles.gradingDetails}>
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>{t('tests.grading.gradingInfo.title')}</h3>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t('tests.grading.gradingInfo.gradedBy')}</span>
                        <span className={styles.infoValue}>
                          {selected.gradedBy === 'ai' ? t('tests.grading.gradedBy.ai') : selected.gradedBy === 'override' ? t('tests.grading.gradedBy.humanOverride') : t('tests.grading.gradedBy.human')}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t('tests.grading.gradingInfo.gradedAt')}</span>
                        <span className={styles.infoValue}>
                          {formatDateTime(selected.gradedAt, locale)}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t('tests.grading.gradingInfo.status')}</span>
                        <StatusBadge
                          variant={selected.status === 'approved' ? 'success' : selected.status === 'flagged' ? 'warning' : 'info'}
                          label={selected.status}
                        />
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t('tests.grading.gradingInfo.passThreshold')}</span>
                        <span className={styles.infoValue}>60%</span>
                      </div>
                    </div>
                  </div>

                  {selected.assessmentTraceability && (
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>{t('tests.grading.traceability.title')}</h3>
                      <dl className={styles.traceabilityGrid}>
                        <div>
                          <dt>{t('tests.grading.traceability.jobId')}</dt>
                          <dd>{selected.assessmentTraceability.jobId}</dd>
                        </div>
                        <div>
                          <dt>{t('tests.grading.traceability.jdVersionId')}</dt>
                          <dd>{selected.assessmentTraceability.jdVersionId}</dd>
                        </div>
                        <div>
                          <dt>{t('tests.grading.traceability.parsedCriteriaVersion')}</dt>
                          <dd>{selected.assessmentTraceability.parsedCriteriaVersion}</dd>
                        </div>
                        <div>
                          <dt>{t('tests.grading.traceability.assessmentPlanId')}</dt>
                          <dd>{selected.assessmentTraceability.assessmentPlanId}</dd>
                        </div>
                        <div>
                          <dt>{t('tests.grading.traceability.assessmentPlanVersionId')}</dt>
                          <dd>{selected.assessmentTraceability.assessmentPlanVersionId}</dd>
                        </div>
                        <div>
                          <dt>{t('tests.grading.traceability.rubricVersionId')}</dt>
                          <dd>{selected.assessmentTraceability.rubricVersionId}</dd>
                        </div>
                        <div>
                          <dt>{t('tests.grading.traceability.testDefinitionVersionId')}</dt>
                          <dd>{selected.assessmentTraceability.testDefinitionVersionId ?? t('common.notAvailable')}</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>{t('tests.grading.scoreBreakdown.title')}</h3>
                    <div className={styles.scoreBreakdown}>
                      <ProgressBar
                        value={selected.score}
                        max={selected.maxScore}
                        showValue
                        variant={selected.score >= 80 ? 'success' : selected.score >= 60 ? 'warning' : 'danger'}
                        label={t('tests.grading.scoreBreakdown.overallScore')}
                      />
                      <div className={styles.sectionScores}>
                        <div className={styles.sectionScore}>
                          <span className={styles.sectionLabel}>{t('tests.grading.scoreBreakdown.accuracy')}</span>
                          <ProgressBar value={Math.min(selected.score + 5, 100)} variant="info" size="sm" />
                        </div>
                        <div className={styles.sectionScore}>
                          <span className={styles.sectionLabel}>{t('tests.grading.scoreBreakdown.completeness')}</span>
                          <ProgressBar value={Math.max(selected.score - 10, 0)} variant="info" size="sm" />
                        </div>
                        <div className={styles.sectionScore}>
                          <span className={styles.sectionLabel}>{t('tests.grading.scoreBreakdown.quality')}</span>
                          <ProgressBar value={selected.score - 5} variant="info" size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>{t('tests.grading.aiEvaluation')}</h3>
                    <div className={styles.aiEvaluation}>
                      <p>{selected.aiGrade}</p>
                    </div>
                  </div>

                  {selected.overrideReason && (
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>{t('tests.grading.overrideReason')}</h3>
                      <div className={styles.overrideInfo}>
                        <p>{selected.overrideReason}</p>
                        {selected.humanGrade && (
                          <div className={styles.humanGrade}>
                            <span className={styles.gradeLabel}>{t('tests.grading.humanGrade')}</span>
                            <span>{selected.humanGrade}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className={styles.actionButtons}>
                <Button variant="ghost">{t('tests.grading.actions.flagReview')}</Button>
                <Button variant="secondary" onClick={() => setOverrideModalOpen(true)}>
                  {t('tests.grading.actions.overrideScore')}
                </Button>
                <Link href="/final-review" onClick={() => markTestGraded(selected.id)}>
                  <Button variant="primary">{t('tests.grading.actions.approveProceed')}</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📝</span>
                  <p>{t('tests.grading.empty')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {overrideModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{t('tests.grading.modal.title')}</h2>
              <button className={styles.closeButton} onClick={() => setOverrideModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                {t('tests.grading.modal.description')}
              </p>
              <div className={styles.formGroup}>
                <label htmlFor="overrideScore">{t('tests.grading.modal.newScore')}</label>
                <input type="number" id="overrideScore" min="0" max="100" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="overrideReason">{t('tests.grading.modal.reasonRequired')}</label>
                <textarea
                  id="overrideReason"
                  className={styles.textarea}
                  rows={4}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder={t('tests.grading.modal.reasonPlaceholder')}
                  required
                />
              </div>
              <div className={styles.mfaNotice}>
                <span className={styles.mfaIcon}>🔐</span>
                <span>{t('tests.grading.modal.mfaRequired')}</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setOverrideModalOpen(false)}>{t('tests.grading.modal.cancel')}</Button>
              <Button variant="primary" onClick={handleOverrideSubmit} disabled={!overrideReason.trim()}>
                {t('tests.grading.modal.submit')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}