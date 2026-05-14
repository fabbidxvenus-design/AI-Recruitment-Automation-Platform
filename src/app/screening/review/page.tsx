'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { mockScreeningEvaluations, mockCandidates } from '@/lib/mockData';
import styles from './review.module.css';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function ScreeningReviewPage() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredEvaluations = mockScreeningEvaluations.filter(
    e => filter === 'all' || e.status === filter
  );

  const selected = mockScreeningEvaluations.find(e => e.id === selectedEvaluation);

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

  const handleBulkAction = (action: 'approve' | 'reject') => {
    alert(`${action}: ${selectedCandidates.size}`);
    setSelectedCandidates(new Set());
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

      <div className={styles.toolbar}>
        <div className={styles.filterTabs} role="tablist" aria-label={t('screening.review.aria.filterTabs')}>
          {(['pending', 'approved', 'rejected', 'all'] as FilterStatus[]).map(status => (
            <button
              key={status}
              role="tab"
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
              aria-selected={filter === status}
            >
              {t(`screening.review.filter.${status}`)}
              <span className={styles.filterCount}>
                {status === 'all'
                  ? mockScreeningEvaluations.length
                  : mockScreeningEvaluations.filter(e => e.status === status).length}
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
              aria-keyshortcuts="Enter"
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
              {isLoading ? (
                <div className={styles.loadingState}>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </div>
              ) : filteredEvaluations.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📋</span>
                  <p>{t('screening.review.empty.noMatch')}</p>
                </div>
              ) : (
                <div className={styles.candidateItems}>
                  {filteredEvaluations.map(evaluation => (
                    <div
                      key={evaluation.id}
                      className={`${styles.candidateItem} ${selectedEvaluation === evaluation.id ? styles.selected : ''}`}
                      onClick={() => setSelectedEvaluation(evaluation.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedEvaluation(evaluation.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedEvaluation === evaluation.id}
                      aria-label={`${evaluation.candidateName}, ${evaluation.jobTitle}, ${t('screening.review.aria.scoreLabel', { score: evaluation.overallScore })}`}
                    >
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(evaluation.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelect(evaluation.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={t('screening.review.aria.selectCandidate', { name: evaluation.candidateName })}
                        />
                      </label>
                      <div className={styles.candidateInfo}>
                        <span className={styles.candidateName}>{evaluation.candidateName}</span>
                        <span className={styles.candidateJob}>{evaluation.jobTitle}</span>
                      </div>
                      <div className={styles.candidateScore}>
                        <span className={styles.score}>{evaluation.overallScore}</span>
                        <ProgressBar
                          value={evaluation.overallScore}
                          max={100}
                          size="sm"
                          variant={evaluation.overallScore >= 80 ? 'success' : evaluation.overallScore >= 60 ? 'warning' : 'danger'}
                          aria-label={`${t('screening.review.aria.scoreLabel', { score: evaluation.overallScore })} out of 100`}
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
                      <span>{t('screening.review.detail.model')}: Gemini Pro</span>
                      <span>{t('screening.review.detail.prompt')}: v2.1</span>
                      <span>
                        <span className="sr-only">{t('screening.review.detail.confidence')}: </span>
                        {t('screening.review.detail.high')}
                      </span>
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
                        <span className={styles.evidenceLabel}>CV Version</span>
                        <span className={styles.evidenceValue}>{selected.cvVersionId || 'N/A'}</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>JD Version</span>
                        <span className={styles.evidenceValue}>{selected.jdVersionId || 'N/A'}</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>Parsed Criteria Version</span>
                        <span className={styles.evidenceValue}>{selected.parsedCriteriaVersion || 'N/A'}</span>
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
              </CardContent>
              <div className={styles.actionButtons}>
                <Button variant="danger" onClick={() => alert(t('screening.review.actions.reject'))} aria-keyshortcuts="Enter">
                  {t('screening.review.actions.reject')}
                </Button>
                <Button variant="secondary">
                  {t('screening.review.actions.rescreening')}
                </Button>
                <Link href="/interviews/schedule-approval">
                  <Button variant="primary" aria-keyshortcuts="Enter">
                    {t('screening.review.actions.approveProceed')}
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>👆</span>
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