'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Notice } from '@/components/ui/Notice';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { mockCandidateApplications } from '@/lib/applicationMockData';
import { mockScreeningEvaluations } from '@/lib/mockData';
import styles from './review.module.css';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const filterStatuses: FilterStatus[] = ['pending', 'approved', 'rejected', 'all'];

export default function ScreeningReviewPage() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(
    mockScreeningEvaluations[0]?.id ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [evaluations, setEvaluations] = useState(mockScreeningEvaluations);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'info' | 'warning'; title: string; body: string } | null>(null);

  const filteredEvaluations = evaluations.filter(
    e => filter === 'all' || e.status === filter
  );

  const selected = evaluations.find(e => e.id === selectedEvaluation);
  const selectedApplication = selected?.applicationId
    ? mockCandidateApplications.find(application => application.id === selected.applicationId)
    : undefined;
  const confidencePercent = selected?.aiProvenance
    ? Math.round(selected.aiProvenance.confidence * 100)
    : undefined;

  const toggleSelect = (id: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleFilterKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, status: FilterStatus): void => {
    const currentIndex = filterStatuses.indexOf(status);
    const lastIndex = filterStatuses.length - 1;
    const nextIndexByKey: Partial<Record<string, number>> = {
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextStatus = filterStatuses[nextIndex];
    setFilter(nextStatus);
    document.getElementById(`screening-filter-tab-${nextStatus}`)?.focus();
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    const selectedIds = Array.from(selectedCandidates);
    setEvaluations(prev => prev.map(evaluation => (
      selectedIds.includes(evaluation.id)
        ? { ...evaluation, status: action === 'approve' ? 'approved' : 'rejected', decision: action }
        : evaluation
    )));
    setFeedback({
      variant: action === 'approve' ? 'success' : 'warning',
      title: t(`screening.review.feedback.bulk.${action}.title`),
      body: t('screening.review.feedback.bulk.body', { count: selectedCandidates.size }),
    });
    setSelectedCandidates(new Set());
  };

  const handleRejectSelected = () => {
    if (!selected) return;

    setEvaluations(prev => prev.map(evaluation => (
      evaluation.id === selected.id
        ? { ...evaluation, status: 'rejected', decision: 'reject' }
        : evaluation
    )));
    setFeedback({
      variant: 'warning',
      title: t('screening.review.feedback.rejected.title'),
      body: t('screening.review.feedback.rejected.body', { name: selected.candidateName }),
    });
  };

  const handleReevaluation = () => {
    if (!selected) return;

    setEvaluations(prev => prev.map(evaluation => (
      evaluation.id === selected.id
        ? { ...evaluation, status: 'pending', decision: 'needs_review' }
        : evaluation
    )));
    setFeedback({
      variant: 'info',
      title: t('screening.review.feedback.rescreening.title'),
      body: t('screening.review.feedback.rescreening.body', { name: selected.candidateName }),
    });
    setSelectedEvaluation(null);
  };

  const handleStageAdvance = () => {
    if (!selected) return;

    setEvaluations(prev => prev.map(evaluation => (
      evaluation.id === selected.id
        ? { ...evaluation, status: 'approved', decision: 'approve' }
        : evaluation
    )));
    setFeedback({
      variant: 'success',
      title: t('screening.review.feedback.stageAdvance.title'),
      body: t('screening.review.feedback.stageAdvance.body', { name: selected.candidateName }),
    });
  };

  const selectionAnnouncement = selectedCandidates.size > 0
    ? t('screening.review.selection.announcement', { selected: selectedCandidates.size, total: filteredEvaluations.length })
    : '';

  return (
    <div className={styles.reviewPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('screening.review.title')}</h1>
          <p className={styles.description}>
            {t('screening.review.description')}
          </p>
        </div>
      </div>

      {/* Live region for selection announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {selectionAnnouncement}
      </div>

      {feedback && (
        <Notice variant={feedback.variant} title={feedback.title}>
          {feedback.body}
        </Notice>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filterTabs} role="tablist" aria-label={t('screening.review.aria.filterTabs')}>
          {filterStatuses.map(status => (
            <button
              key={status}
              id={`screening-filter-tab-${status}`}
              role="tab"
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
              onKeyDown={(event) => handleFilterKeyDown(event, status)}
              aria-selected={filter === status}
              aria-controls="screening-candidate-results"
              tabIndex={filter === status ? 0 : -1}
            >
              {t(`screening.review.filter.${status}`)}
              <span className={styles.filterCount}>
                {status === 'all'
                  ? evaluations.length
                  : evaluations.filter(e => e.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {selectedCandidates.size > 0 && (
          <div className={styles.bulkActions} role="toolbar" aria-label={t('screening.review.bulk.label')}>
            <span className={styles.selectedCount} aria-live="polite">
              {t('screening.review.selection.selected', { count: selectedCandidates.size })}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction('approve')}
            >
              {t('screening.review.bulk.approveSelected')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleBulkAction('reject')}
            >
              {t('screening.review.bulk.rejectSelected')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCandidates(new Set())}
              aria-label={t('screening.review.selection.clearAll')}
            >
              {t('screening.review.bulk.clear')}
            </Button>
          </div>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.candidateList}>
          <Card>
            <CardHeader
              title={t('screening.review.candidates')}
              description={t('screening.review.count', { count: filteredEvaluations.length })}
            />
            <CardContent>
              <div
                id="screening-candidate-results"
                role="tabpanel"
                aria-labelledby={`screening-filter-tab-${filter}`}
              >
              {isLoading ? (
                <div className={styles.loadingState}>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </div>
              ) : filteredEvaluations.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon} aria-hidden="true">📋</span>
                  <p>{t('screening.review.empty.noMatch')}</p>
                </div>
              ) : (
                <div className={styles.candidateItems}>
                  {filteredEvaluations.map(evaluation => (
                    <div
                      key={evaluation.id}
                      className={`${styles.candidateItem} ${selectedEvaluation === evaluation.id ? styles.selected : ''}`}
                    >
                      <label className={styles.checkbox} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(evaluation.id)}
                          onChange={() => toggleSelect(evaluation.id)}
                          aria-label={t('screening.review.aria.selectCandidate', { name: evaluation.candidateName })}
                        />
                      </label>
                      <button
                        type="button"
                        className={styles.candidateInfoButton}
                        onClick={() => setSelectedEvaluation(evaluation.id)}
                        aria-pressed={selectedEvaluation === evaluation.id}
                        aria-label={`${evaluation.candidateName}, ${evaluation.jobTitle}, ${t('screening.review.aria.scoreLabel', { score: evaluation.overallScore })}`}
                      >
                        <span className={styles.candidateName}>{evaluation.candidateName}</span>
                        <span className={styles.candidateJob}>{evaluation.jobTitle}</span>
                      </button>
                      <div className={styles.candidateScore}>
                        <span className={styles.score}>{evaluation.overallScore}</span>
                        <ProgressBar
                          value={evaluation.overallScore}
                          max={100}
                          size="sm"
                          variant={evaluation.overallScore >= 80 ? 'success' : evaluation.overallScore >= 60 ? 'warning' : 'danger'}
                          label={t('screening.review.aria.scoreLabel', { score: evaluation.overallScore })}
                        />
                      </div>
                      <StatusBadge
                        variant={
                          evaluation.decision === 'approve' ? 'success' :
                          evaluation.decision === 'reject' ? 'danger' : 'warning'
                        }
                        label={evaluation.decision === 'approve' ? t('screening.review.decision.recommend') : evaluation.decision === 'reject' ? t('screening.review.decision.notRec') : t('screening.review.decision.review')}
                      />
                    </div>
                  ))}
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.detailPanel}>
          {isLoading ? (
            <Card>
              <CardContent>
                <LoadingState text={t('screening.review.aria.loading')} />
              </CardContent>
            </Card>
          ) : selected ? (
            <Card>
              <CardHeader
                title={selected.candidateName}
                description={selected.jobTitle}
                action={
                  <StatusBadge
                    variant={selected.overallScore >= 80 ? 'success' : selected.overallScore >= 60 ? 'warning' : 'danger'}
                    label={t('screening.review.detail.score', { score: selected.overallScore })}
                  />
                }
              />
              <CardContent>
                <div className={styles.evaluationSections}>
                  <section className={styles.evaluationSection}>
                    <h3 className={styles.sectionTitle}>{t('screening.review.detail.aiSummary')}</h3>
                    <p className={styles.aiSummary}>{selected.aiSummary}</p>
                    <div className={styles.aiMeta}>
                      <span>
                        {t('screening.review.detail.model')}: {selected.aiProvenance?.model || t('common.notAvailable')}
                      </span>
                      <span>
                        {t('screening.review.detail.prompt')}: {selected.aiProvenance?.promptVersion || t('common.notAvailable')}
                      </span>
                      <span>
                        <span className="sr-only">{t('screening.review.detail.confidence')}: </span>
                        {confidencePercent ? `${confidencePercent}%` : t('common.notAvailable')}
                      </span>
                    </div>
                  </section>

                  <section className={styles.evaluationSection}>
                    <h3 className={styles.sectionTitle}>{t('screening.review.detail.traceability')}</h3>
                    <div className={styles.traceabilityGrid}>
                      <div className={styles.traceItem}>
                        <span className={styles.traceLabel}>{t('screening.review.detail.applicationId')}</span>
                        <span className={styles.traceValue}>{selected.applicationId || t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.traceItem}>
                        <span className={styles.traceLabel}>{t('screening.review.detail.candidateId')}</span>
                        <span className={styles.traceValue}>{selected.candidateId}</span>
                      </div>
                      <div className={styles.traceItem}>
                        <span className={styles.traceLabel}>{t('screening.review.detail.jobId')}</span>
                        <span className={styles.traceValue}>{selectedApplication?.jobId || t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.traceItem}>
                        <span className={styles.traceLabel}>{t('screening.review.detail.cvVersion')}</span>
                        <span className={styles.traceValue}>{selected.cvVersionId || t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.traceItem}>
                        <span className={styles.traceLabel}>{t('screening.review.detail.jdVersion')}</span>
                        <span className={styles.traceValue}>{selected.jdVersionId || t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.traceItem}>
                        <span className={styles.traceLabel}>{t('screening.review.detail.parsedCriteriaVersion')}</span>
                        <span className={styles.traceValue}>{selected.parsedCriteriaVersion || t('common.notAvailable')}</span>
                      </div>
                    </div>
                  </section>

                  <section className={styles.evaluationSection}>
                    <h3 className={styles.sectionTitle}>{t('screening.review.detail.keyStrengths')}</h3>
                    <ul className={styles.strengthsList}>
                      {selected.keyStrengths.map((strength, i) => (
                        <li key={i} className={styles.strengthItem}>
                          <span className={styles.strengthIcon} aria-hidden="true">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className={styles.evaluationSection}>
                    <h3 className={styles.sectionTitle}>{t('screening.review.detail.concerns')}</h3>
                    <ul className={styles.concernsList}>
                      {selected.concerns.map((concern, i) => (
                        <li key={i} className={styles.concernItem}>
                          <span className={styles.concernIcon} aria-hidden="true">⚠</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className={styles.evaluationSection}>
                    <h3 className={styles.sectionTitle}>{t('screening.review.detail.evidence')}</h3>
                    <div className={styles.evidenceList}>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>{t('screening.review.detail.cvVersion')}</span>
                        <span className={styles.evidenceValue}>{selected.cvVersionId || t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>{t('screening.review.detail.jdVersion')}</span>
                        <span className={styles.evidenceValue}>{selected.jdVersionId || t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>{t('screening.review.detail.parsedCriteriaVersion')}</span>
                        <span className={styles.evidenceValue}>{selected.parsedCriteriaVersion || t('common.notAvailable')}</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>{t('screening.review.detail.cvMatch')}</span>
                        <span className={styles.evidenceValue}>{t('screening.review.detail.cvMatchValue', { matched: 12, total: 15 })}</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>{t('screening.review.detail.experienceRelevance')}</span>
                        <span className={styles.evidenceValue}>{t('screening.review.detail.yearsRelevant', { years: 6 })}</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>{t('screening.review.detail.skillsMatch')}</span>
                        <span className={styles.evidenceValue}>{t('screening.review.detail.skillsMatchValue', { matched: 4, total: 6 })}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Workflow Timeline */}
                <section className={styles.timelineSection}>
                  <h3 className={styles.sectionTitle}>{t('screening.review.timeline.title')}</h3>
                  <div className={styles.timeline}>
                    <div className={`${styles.timelineStep} ${selected.status === 'approved' ? styles.completed : selected.status === 'pending' && selected.decision === 'needs_review' ? styles.completed : ''}`}>
                      <span className={styles.timelineIcon} aria-hidden="true">1</span>
                      <span className={styles.timelineLabel}>{t('screening.review.timeline.screening')}</span>
                    </div>
                    <div className={styles.timelineConnector} aria-hidden="true" />
                    <div className={`${styles.timelineStep} ${selected.status === 'pending' && selected.decision === 'needs_review' ? styles.active : ''}`}>
                      <span className={styles.timelineIcon} aria-hidden="true">2</span>
                      <span className={styles.timelineLabel}>{t('screening.review.timeline.reevaluation')}</span>
                    </div>
                    <div className={styles.timelineConnector} aria-hidden="true" />
                    <div className={`${styles.timelineStep} ${selected.status === 'approved' ? styles.active : ''}`}>
                      <span className={styles.timelineIcon} aria-hidden="true">3</span>
                      <span className={styles.timelineLabel}>{t('screening.review.timeline.interviewPrep')}</span>
                    </div>
                  </div>
                  {selected.status === 'approved' && (
                    <Link href="/interviews/schedule-approval" className={styles.nextActionCta}>
                      {t('screening.review.timeline.nextActionCta')}
                    </Link>
                  )}
                </section>
              </CardContent>
              <div className={styles.actionButtons}>
                <Button variant="danger" onClick={handleRejectSelected}>
                  {t('screening.review.actions.reject')}
                </Button>
                <Button variant="secondary" onClick={handleReevaluation}>
                  {t('screening.review.actions.rescreening')}
                </Button>
                <Button variant="primary" onClick={handleStageAdvance}>
                  {t('screening.review.actions.approveProceed')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon} aria-hidden="true">👆</span>
                  <p>{t('screening.review.empty.selectToView')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}