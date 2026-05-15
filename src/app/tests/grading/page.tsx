'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const PASS_THRESHOLD_PERCENT = 60;

export default function TestGradingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const activeWorkflowTest = resolveTestResultForActivePlan();
  const [workflowTestResults, setWorkflowTestResults] = useState(() => [
    activeWorkflowTest,
    ...mockTestResults.filter((test) => test.id !== activeWorkflowTest.id),
  ]);
  const [selectedTest, setSelectedTest] = useState<string | null>(activeWorkflowTest.id);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideScore, setOverrideScore] = useState('');
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'info' | 'warning'; title: string; body: string } | null>(null);

  const selected = workflowTestResults.find(test => test.id === selectedTest);

  const getTestStatusLabel = (status: string): string => t(`common.status.${status}`);

  const matchesTab = (test: typeof workflowTestResults[number], tab: TabType): boolean => {
    if (tab === 'all') return true;
    if (tab === 'mcq') return test.testName.includes('JavaScript') || test.testName.includes('MCQ');
    if (tab === 'essay') return test.testName.includes('Design') || test.testName.includes('Essay');
    if (tab === 'coding') return test.testName.includes('Coding') || test.testName.includes('Challenge');
    return true;
  };

  const filteredTests = workflowTestResults.filter(test => matchesTab(test, activeTab));

  const handleOverrideSubmit = () => {
    if (!selected || !overrideReason.trim()) return;

    const parsedScore = Number(overrideScore);
    const nextScore = Number.isFinite(parsedScore) ? Math.max(0, Math.min(selected.maxScore, parsedScore)) : selected.score;

    setWorkflowTestResults(prev => prev.map(test => (
      test.id === selected.id
        ? {
            ...test,
            score: nextScore,
            status: nextScore >= 60 ? 'approved' : 'flagged',
            gradedBy: 'override',
            overrideReason,
            humanGrade: `${nextScore}/${test.maxScore}`,
          }
        : test
    )));
    setFeedback({
      variant: 'success',
      title: t('tests.grading.feedback.override.title'),
      body: t('tests.grading.feedback.override.body', {
        name: selected.candidateName,
        score: nextScore,
        maxScore: selected.maxScore,
      }),
    });
    setOverrideModalOpen(false);
    setOverrideReason('');
    setOverrideScore('');
  };

  const handleApproveProceed = () => {
    if (!selected) return;

    markTestGraded(selected.id);
    router.push('/final-review');
  };

  const handleFlagForReview = () => {
    if (!selected) return;

    setWorkflowTestResults(prev => prev.map(test => (
      test.id === selected.id ? { ...test, status: 'flagged' } : test
    )));
    setFeedback({
      variant: 'warning',
      title: t('tests.grading.feedback.flagged.title'),
      body: t('tests.grading.feedback.flagged.body', { name: selected.candidateName }),
    });
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

      {feedback && (
        <Notice variant={feedback.variant} title={feedback.title}>
          {feedback.body}
        </Notice>
      )}

      <div className={styles.tabs} role="tablist" aria-label={t('tests.grading.tabs.label')}>
        {(['all', 'mcq', 'essay', 'coding'] as TabType[]).map(tab => (
          <button
            key={tab}
            id={`test-grading-tab-${tab}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="test-grading-results"
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`tests.grading.tabs.${tab}`)}
            <span className={styles.tabCount}>
              {workflowTestResults.filter(test => matchesTab(test, tab)).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div
          id="test-grading-results"
          className={styles.testList}
          role="tabpanel"
          aria-labelledby={`test-grading-tab-${activeTab}`}
        >
          <Card>
            <CardHeader title={t('tests.grading.results.title')} description={t('tests.grading.results.count', { count: filteredTests.length })} />
            <CardContent>
              <div className={styles.testItems}>
                {filteredTests.map(test => (
                  <button
                    key={test.id}
                    type="button"
                    className={`${styles.testItem} ${selectedTest === test.id ? styles.selected : ''}`}
                    onClick={() => setSelectedTest(test.id)}
                    aria-pressed={selectedTest === test.id}
                  >
                    <div className={styles.testHeader}>
                      <span className={styles.testName}>{test.testName}</span>
                      <StatusBadge
                        variant={test.status === 'approved' ? 'success' : test.status === 'flagged' ? 'warning' : 'danger'}
                        label={getTestStatusLabel(test.status)}
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
                  </button>
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
                          label={getTestStatusLabel(selected.status)}
                        />
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t('tests.grading.gradingInfo.passThreshold')}</span>
                        <span className={styles.infoValue}>{PASS_THRESHOLD_PERCENT}%</span>
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
                <Button variant="ghost" onClick={handleFlagForReview}>{t('tests.grading.actions.flagReview')}</Button>
                <Button variant="secondary" onClick={() => setOverrideModalOpen(true)}>
                  {t('tests.grading.actions.overrideScore')}
                </Button>
                <Button variant="primary" onClick={handleApproveProceed}>{t('tests.grading.actions.approveProceed')}</Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon} aria-hidden="true">📝</span>
                  <p>{t('tests.grading.empty')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {overrideModalOpen && (
        <div className={styles.modal} role="presentation">
          <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="override-score-title" aria-describedby="override-score-description">
            <div className={styles.modalHeader}>
              <h2 id="override-score-title">{t('tests.grading.modal.title')}</h2>
              <button className={styles.closeButton} onClick={() => setOverrideModalOpen(false)} aria-label={t('common.closeModal')}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p id="override-score-description" className={styles.modalDescription}>
                {t('tests.grading.modal.description')}
              </p>
              <div className={styles.formGroup}>
                <label htmlFor="overrideScore">{t('tests.grading.modal.newScore')}</label>
                <input
                  type="number"
                  id="overrideScore"
                  min="0"
                  max={selected?.maxScore ?? 100}
                  className={styles.input}
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                />
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
                <span className={styles.mfaIcon} aria-hidden="true">🔐</span>
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