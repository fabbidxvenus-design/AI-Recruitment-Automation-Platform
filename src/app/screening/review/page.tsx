'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Notice } from '@/components/ui/Notice';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { mockCandidateApplications } from '@/lib/applicationMockData';
import { mockScreeningEvaluations, mockJobs } from '@/lib/mockData';
import styles from './review.module.css';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';
type ViewMode = 'candidates' | 'jobs';

const filterStatuses: FilterStatus[] = ['pending', 'approved', 'rejected', 'all'];

export default function ScreeningReviewPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('jobs'); // Default to job-centric view
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(mockScreeningEvaluations[0]?.id ?? null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(mockJobs[0]?.id ?? null);
  const [evaluations, setEvaluations] = useState(mockScreeningEvaluations);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'info' | 'warning'; title: string; body: string } | null>(null);

  // Pagination for large datasets
  const [jobPage, setJobPage] = useState(1);
  const [candidatePage, setCandidatePage] = useState(1);
  const PAGE_SIZE = 20;

  const filteredEvaluations = useMemo(() => {
    let result = evaluations;
    if (viewMode === 'jobs' && selectedJobId) {
      result = result.filter(e => mockCandidateApplications.find(a => a.id === e.applicationId)?.jobId === selectedJobId);
    }
    return result.filter(e => filter === 'all' || e.status === filter);
  }, [evaluations, filter, viewMode, selectedJobId]);

  const paginatedEvaluations = useMemo(() => {
    const start = (candidatePage - 1) * PAGE_SIZE;
    return filteredEvaluations.slice(start, start + PAGE_SIZE);
  }, [filteredEvaluations, candidatePage]);

  const paginatedJobs = useMemo(() => {
    const start = (jobPage - 1) * PAGE_SIZE;
    return mockJobs.slice(start, start + PAGE_SIZE);
  }, [jobPage]);

  const totalJobPages = Math.ceil(mockJobs.length / PAGE_SIZE);
  const totalCandidatePages = Math.ceil(filteredEvaluations.length / PAGE_SIZE);

  const selected = evaluations.find(e => e.id === selectedEvaluation);
  const selectedApplication = selected?.applicationId ? mockCandidateApplications.find(a => a.id === selected.applicationId) : undefined;
  const confidencePercent = selected?.aiProvenance ? Math.round(selected.aiProvenance.confidence * 100) : undefined;

  const toggleSelect = (id: string) => setSelectedCandidates(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleBulkAction = (action: 'approve' | 'reject') => {
    setEvaluations(prev => prev.map(e => selectedCandidates.has(e.id) ? { ...e, status: action === 'approve' ? 'approved' : 'rejected', decision: action } : e));
    setFeedback({ variant: action === 'approve' ? 'success' : 'warning', title: t(`screening.review.feedback.bulk.${action}.title`), body: t('screening.review.feedback.bulk.body', { count: selectedCandidates.size }) });
    setSelectedCandidates(new Set());
  };
  const handleRejectSelected = () => { if (selected) { setEvaluations(prev => prev.map(e => e.id === selected.id ? { ...e, status: 'rejected', decision: 'reject' } : e)); setFeedback({ variant: 'warning', title: t('screening.review.feedback.rejected.title'), body: t('screening.review.feedback.rejected.body', { name: selected.candidateName }) }); }};
  const handleReevaluation = () => { if (selected) { setEvaluations(prev => prev.map(e => e.id === selected.id ? { ...e, status: 'pending', decision: 'needs_review' } : e)); setFeedback({ variant: 'info', title: t('screening.review.feedback.rescreening.title'), body: t('screening.review.feedback.rescreening.body', { name: selected.candidateName }) }); setSelectedEvaluation(null); }};
  const handleStageAdvance = () => { if (selected) { setEvaluations(prev => prev.map(e => e.id === selected.id ? { ...e, status: 'approved', decision: 'approve' } : e)); setFeedback({ variant: 'success', title: t('screening.review.feedback.stageAdvance.title'), body: t('screening.review.feedback.stageAdvance.body', { name: selected.candidateName }) }); }};

  return (
    <div className={styles.reviewPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('screening.review.title')}</h1>
          <p className={styles.description}>{t('screening.review.description')}</p>
        </div>
        <div className={styles.viewSwitcher}>
          <button className={`${styles.viewSwitchBtn} ${viewMode === 'candidates' ? styles.active : ''}`} onClick={() => setViewMode('candidates')}>{t('screening.review.viewBy.candidates')}</button>
          <button className={`${styles.viewSwitchBtn} ${viewMode === 'jobs' ? styles.active : ''}`} onClick={() => setViewMode('jobs')}>{t('screening.review.viewBy.jobs')}</button>
        </div>
      </div>

      {feedback && <Notice variant={feedback.variant} title={feedback.title}>{feedback.body}</Notice>}

      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {filterStatuses.map(s => <button key={s} className={`${styles.filterTab} ${filter === s ? styles.active : ''}`} onClick={() => setFilter(s)}>{t(`screening.review.filter.${s}`)}<span className={styles.filterCount}>{s === 'all' ? evaluations.length : evaluations.filter(e => e.status === s).length}</span></button>)}
        </div>
        {selectedCandidates.size > 0 && <div className={styles.bulkActions}><span>{t('screening.review.selection.selected', { count: selectedCandidates.size })}</span><Button variant="primary" size="sm" onClick={() => handleBulkAction('approve')}>{t('screening.review.bulk.approveSelected')}</Button><Button variant="danger" size="sm" onClick={() => handleBulkAction('reject')}>{t('screening.review.bulk.rejectSelected')}</Button></div>}
      </div>

      {viewMode === 'jobs' ? (
        <div className={styles.jobCentricLayout}>
          <div className={styles.jobListPanel}>
            <Card><CardHeader title={t('screening.review.jobs.title')} description={t('screening.review.jobs.count', { count: mockJobs.length })} /><CardContent>
              <div className={styles.jobListItems}>{mockJobs.map(job => <button key={job.id} className={`${styles.jobListItem} ${selectedJobId === job.id ? styles.selected : ''}`} onClick={() => setSelectedJobId(job.id)}><div className={styles.jobListItemHeader}><span className={styles.jobListItemTitle}>{job.title}</span><span className={styles.jobListItemBadge}>{job.candidateCount}</span></div><div className={styles.jobListItemMeta}><span>{job.department}</span></div></button>)}</div>
            </CardContent></Card>
          </div>
          <div className={styles.candidatesByJobList}>
            <Card><CardHeader title={mockJobs.find(j => j.id === selectedJobId)?.title || ''} description={t('screening.review.count', { count: filteredEvaluations.length })} /><CardContent>
              <div className={styles.candidateItems}>{filteredEvaluations.map(e => <div key={e.id} className={`${styles.candidateItem} ${selectedEvaluation === e.id ? styles.selected : ''}`} onClick={() => setSelectedEvaluation(e.id)}><span className={styles.candidateName}>{e.candidateName}</span><span className={styles.score}>{e.overallScore}</span></div>)}</div>
            </CardContent></Card>
          </div>
          <div className={styles.detailPanel}>
            {selected ? (
              <Card><CardHeader title={selected.candidateName} description={selected.jobTitle} action={<StatusBadge variant={selected.overallScore >= 80 ? 'success' : selected.overallScore >= 60 ? 'warning' : 'danger'} label={t('screening.review.detail.score', { score: selected.overallScore })} />} /><CardContent>
                <div className={styles.matchingSection}>
                  <h3 className={styles.matchingSectionTitle}>{t('screening.review.matching.title')}</h3>
                  <div className={styles.matchingCriteria}>
                    <div className={styles.matchingCriterion}><div className={`${styles.matchingCriterionScore} ${selected.overallScore >= 80 ? styles.high : selected.overallScore >= 60 ? styles.medium : styles.low}`}>{selected.overallScore}</div><span className={styles.matchingCriterionLabel}>{t('screening.review.matching.score')}</span></div>
                  </div>
                </div>
              </CardContent><div className={styles.actionButtons}><Button variant="danger" onClick={handleRejectSelected}>{t('screening.review.actions.reject')}</Button><Button variant="secondary" onClick={handleReevaluation}>{t('screening.review.actions.rescreening')}</Button><Button variant="primary" onClick={handleStageAdvance}>{t('screening.review.actions.approveProceed')}</Button></div></Card>
            ) : <Card><CardContent><div className={styles.jobViewEmptyState}><span className={styles.jobViewEmptyIcon}>👆</span><p>{t('screening.review.empty.selectToView')}</p></div></CardContent></Card>}
          </div>
        </div>
      ) : (
        <div className={styles.mainContent}>
          <div className={styles.candidateList}><Card><CardHeader title={t('screening.review.candidates')} description={t('screening.review.count', { count: filteredEvaluations.length })} /><CardContent><div className={styles.candidateItems}>{filteredEvaluations.map(e => <div key={e.id} className={`${styles.candidateItem} ${selectedEvaluation === e.id ? styles.selected : ''}`}><label className={styles.checkbox}><input type="checkbox" checked={selectedCandidates.has(e.id)} onChange={() => toggleSelect(e.id)} /></label><button className={styles.candidateInfoButton} onClick={() => setSelectedEvaluation(e.id)}><span className={styles.candidateName}>{e.candidateName}</span><span className={styles.candidateJob}>{e.jobTitle}</span></button><div className={styles.candidateScore}><span className={styles.score}>{e.overallScore}</span><ProgressBar value={e.overallScore} max={100} size="sm" variant={e.overallScore >= 80 ? 'success' : e.overallScore >= 60 ? 'warning' : 'danger'} /></div><StatusBadge variant={e.decision === 'approve' ? 'success' : e.decision === 'reject' ? 'danger' : 'warning'} label={e.decision === 'approve' ? t('screening.review.decision.recommend') : e.decision === 'reject' ? t('screening.review.decision.notRec') : t('screening.review.decision.review')} /></div>)}</div></CardContent></Card></div>
          <div className={styles.detailPanel}>
            {selected ? (
              <Card><CardHeader title={selected.candidateName} description={selected.jobTitle} action={<StatusBadge variant={selected.overallScore >= 80 ? 'success' : selected.overallScore >= 60 ? 'warning' : 'danger'} label={t('screening.review.detail.score', { score: selected.overallScore })} />} /><CardContent><div className={styles.evaluationSections}><section><h3 className={styles.sectionTitle}>{t('screening.review.detail.aiSummary')}</h3><p className={styles.aiSummary}>{selected.aiSummary}</p></section><section><h3 className={styles.sectionTitle}>{t('screening.review.detail.keyStrengths')}</h3><ul className={styles.strengthsList}>{selected.keyStrengths.map((s, i) => <li key={i} className={styles.strengthItem}><span>✓</span>{s}</li>)}</ul></section><section><h3 className={styles.sectionTitle}>{t('screening.review.detail.concerns')}</h3><ul className={styles.concernsList}>{selected.concerns.map((c, i) => <li key={i} className={styles.concernItem}><span>⚠</span>{c}</li>)}</ul></section></div></CardContent><div className={styles.actionButtons}><Button variant="danger" onClick={handleRejectSelected}>{t('screening.review.actions.reject')}</Button><Button variant="secondary" onClick={handleReevaluation}>{t('screening.review.actions.rescreening')}</Button><Button variant="primary" onClick={handleStageAdvance}>{t('screening.review.actions.approveProceed')}</Button></div></Card>
            ) : <Card><CardContent><div className={styles.emptyState}><span>👆</span><p>{t('screening.review.empty.selectToView')}</p></div></CardContent></Card>}
          </div>
        </div>
      )}
    </div>
  );
}