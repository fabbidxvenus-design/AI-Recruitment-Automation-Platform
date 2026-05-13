'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockTestResults } from '@/lib/mockData';
import styles from './grading.module.css';

type TabType = 'all' | 'mcq' | 'essay' | 'coding';

export default function TestGradingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const selected = mockTestResults.find(t => t.id === selectedTest);

  const filteredTests = mockTestResults.filter(test => {
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
          <h1 className={styles.title}>Test Grading Review & Override</h1>
          <p className={styles.description}>
            Review AI-graded test results and override scores when necessary
          </p>
        </div>
      </div>

      <Notice variant="blocker" title="BQ-004: Coding Sandbox Unavailable">
        Coding challenge execution is blocked pending IT approval of sandbox runtime environment.
      </Notice>

      <div className={styles.tabs}>
        {(['all', 'mcq', 'essay', 'coding'] as TabType[]).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? 'All Tests' : tab.toUpperCase()}
            <span className={styles.tabCount}>
              {tab === 'all' ? mockTestResults.length : mockTestResults.filter(t => {
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
            <CardHeader title="Test Results" description={`${filteredTests.length} results`} />
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
                      <span>{new Date(test.gradedAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.testScore}>
                      <span className={styles.scoreValue}>{test.score}</span>
                      <span className={styles.scoreMax}>/{test.maxScore}</span>
                      <span className={styles.gradingMethod}>
                        Graded by: {test.gradedBy === 'ai' ? 'AI' : test.gradedBy === 'override' ? 'Human Override' : 'Human'}
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
                    <h3 className={styles.sectionTitle}>Grading Information</h3>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Graded By</span>
                        <span className={styles.infoValue}>
                          {selected.gradedBy === 'ai' ? 'AI (Gemini Pro)' : selected.gradedBy === 'override' ? 'Human Override' : 'Human Review'}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Graded At</span>
                        <span className={styles.infoValue}>
                          {new Date(selected.gradedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Status</span>
                        <StatusBadge
                          variant={selected.status === 'approved' ? 'success' : selected.status === 'flagged' ? 'warning' : 'info'}
                          label={selected.status}
                        />
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Pass Threshold</span>
                        <span className={styles.infoValue}>60%</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Score Breakdown</h3>
                    <div className={styles.scoreBreakdown}>
                      <ProgressBar
                        value={selected.score}
                        max={selected.maxScore}
                        showValue
                        variant={selected.score >= 80 ? 'success' : selected.score >= 60 ? 'warning' : 'danger'}
                        label="Overall Score"
                      />
                      <div className={styles.sectionScores}>
                        <div className={styles.sectionScore}>
                          <span className={styles.sectionLabel}>Accuracy</span>
                          <ProgressBar value={Math.min(selected.score + 5, 100)} variant="info" size="sm" />
                        </div>
                        <div className={styles.sectionScore}>
                          <span className={styles.sectionLabel}>Completeness</span>
                          <ProgressBar value={Math.max(selected.score - 10, 0)} variant="info" size="sm" />
                        </div>
                        <div className={styles.sectionScore}>
                          <span className={styles.sectionLabel}>Quality</span>
                          <ProgressBar value={selected.score - 5} variant="info" size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>AI Evaluation</h3>
                    <div className={styles.aiEvaluation}>
                      <p>{selected.aiGrade}</p>
                    </div>
                  </div>

                  {selected.overrideReason && (
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>Override Reason</h3>
                      <div className={styles.overrideInfo}>
                        <p>{selected.overrideReason}</p>
                        {selected.humanGrade && (
                          <div className={styles.humanGrade}>
                            <span className={styles.gradeLabel}>Human Grade:</span>
                            <span>{selected.humanGrade}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className={styles.actionButtons}>
                <Button variant="ghost">Flag for Review</Button>
                <Button variant="secondary" onClick={() => setOverrideModalOpen(true)}>
                  Override Score
                </Button>
                <Link href="/final-review">
                  <Button variant="primary">Approve & Proceed to Final Review</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📝</span>
                  <p>Select a test result to view details</p>
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
              <h2>Override Test Score</h2>
              <button className={styles.closeButton} onClick={() => setOverrideModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                Override scores require a reason and will be logged for audit purposes.
              </p>
              <div className={styles.formGroup}>
                <label htmlFor="overrideScore">New Score (0-100)</label>
                <input type="number" id="overrideScore" min="0" max="100" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="overrideReason">Reason for Override *</label>
                <textarea
                  id="overrideReason"
                  className={styles.textarea}
                  rows={4}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why this override is necessary..."
                  required
                />
              </div>
              <div className={styles.mfaNotice}>
                <span className={styles.mfaIcon}>🔐</span>
                <span>HR Manager MFA verification required to submit override</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setOverrideModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleOverrideSubmit} disabled={!overrideReason.trim()}>
                Verify & Submit Override
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}