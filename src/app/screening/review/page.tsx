'use client';

import { useState } from 'react';
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
    alert(`Bulk ${action} action triggered for ${selectedCandidates.size} candidates`);
    setSelectedCandidates(new Set());
  };

  const selectionAnnouncement = selectedCandidates.size > 0
    ? `${selectedCandidates.size} of ${filteredEvaluations.length} candidates selected. Use Enter or Space to activate bulk actions.`
    : '';

  return (
    <div className={styles.reviewPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Screening Review & Approval</h1>
          <p className={styles.description}>
            Review AI screening results and approve or reject candidates
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
        <div className={styles.filterTabs} role="tablist" aria-label="Filter candidates by status">
          {(['pending', 'approved', 'rejected', 'all'] as FilterStatus[]).map(status => (
            <button
              key={status}
              role="tab"
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
              aria-selected={filter === status}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={styles.filterCount}>
                {status === 'all'
                  ? mockScreeningEvaluations.length
                  : mockScreeningEvaluations.filter(e => e.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {selectedCandidates.size > 0 && (
          <div className={styles.bulkActions} role="toolbar" aria-label="Bulk actions">
            <span className={styles.selectedCount} aria-live="polite">
              {selectedCandidates.size} selected
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction('approve')}
              aria-keyshortcuts="Enter"
            >
              Approve Selected
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleBulkAction('reject')}
            >
              Reject Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCandidates(new Set())}
              aria-label="Clear all selections"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.candidateList}>
          <Card>
            <CardHeader
              title="Candidates"
              description={`${filteredEvaluations.length} candidates`}
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
                  <p>No candidates match the current filter</p>
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
                      aria-label={`${evaluation.candidateName}, ${evaluation.jobTitle}, Score ${evaluation.overallScore}`}
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
                          aria-label={`Select ${evaluation.candidateName} for bulk action`}
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
                          aria-label={`Score ${evaluation.overallScore} out of 100`}
                        />
                      </div>
                      <StatusBadge
                        variant={
                          evaluation.decision === 'approve' ? 'success' :
                          evaluation.decision === 'reject' ? 'danger' : 'warning'
                        }
                        label={evaluation.decision === 'approve' ? 'Recommend' : evaluation.decision === 'reject' ? 'Not Rec.' : 'Review'}
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
                <LoadingState text="Loading candidate details..." />
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
                    label={`Score: ${selected.overallScore}/100`}
                  />
                }
              />
              <CardContent>
                <div className={styles.evaluationSections}>
                  <section className={styles.evaluationSection}>
                    <h3 className={styles.sectionTitle}>AI Summary</h3>
                    <p className={styles.aiSummary}>{selected.aiSummary}</p>
                    <div className={styles.aiMeta}>
                      <span>Model: Gemini Pro</span>
                      <span>Prompt: v2.1</span>
                      <span>
                        <span className="sr-only">Confidence level: </span>
                        High
                      </span>
                    </div>
                  </section>

                  <section className={styles.evaluationSection}>
                    <h3 className={styles.sectionTitle}>Key Strengths</h3>
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
                    <h3 className={styles.sectionTitle}>Concerns</h3>
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
                    <h3 className={styles.sectionTitle}>Evidence</h3>
                    <div className={styles.evidenceList}>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>CV Keywords Match</span>
                        <span className={styles.evidenceValue}>12/15 required</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>Experience Relevance</span>
                        <span className={styles.evidenceValue}>6 years relevant</span>
                      </div>
                      <div className={styles.evidenceItem}>
                        <span className={styles.evidenceLabel}>Skills Match</span>
                        <span className={styles.evidenceValue}>4/6 core skills</span>
                      </div>
                    </div>
                  </section>
                </div>
              </CardContent>
              <div className={styles.actionButtons}>
                <Button variant="danger" onClick={() => alert('Rejected')} aria-keyshortcuts="Enter">
                  Reject
                </Button>
                <Button variant="secondary">
                  Request Re-screening
                </Button>
                <Link href="/interviews/schedule-approval">
                  <Button variant="primary" aria-keyshortcuts="Enter">
                    Approve & Proceed to Scheduling
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>👆</span>
                  <p>Select a candidate to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}