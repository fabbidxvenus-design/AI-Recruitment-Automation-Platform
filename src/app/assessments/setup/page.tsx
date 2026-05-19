'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Notice, StatusBadge } from '@/components';
import {
  approveAssessmentPlan,
  getActiveAssessmentWorkflowState,
  saveAssessmentPlanDraft,
} from '@/lib/assessmentWorkflowState';
import { mockJobs, mockJDVersions, mockParsedJDProfiles } from '@/lib/jobIntakeMockData';
import {
  mockAssessmentPlans,
  mockAssessmentPlanVersions,
  mockInterviewQuestionSetVersions,
  mockRubricVersions,
  mockTestDefinitionVersions,
} from '@/lib/assessmentPlanMockData';
import type { AssessmentPlanStatus, InterviewQuestionSetVersion } from '@/types';
import styles from './assessment-setup.module.css';

interface TraceabilityPreview {
  jobId: string;
  jdVersionId: string;
  parsedCriteriaVersion: number;
  assessmentPlanId: string;
  assessmentPlanVersionId: string;
  rubricVersionId: string;
  interviewQuestionSetVersionId: string;
  testDefinitionVersionId: string;
}

interface WorkflowEvent {
  timestamp: string;
  label: string;
  actor: string;
}

const statusVariantByPlanStatus: Record<AssessmentPlanStatus, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  approved: 'success',
  archived: 'default',
};

function buildWorkflowEvents(
  status: AssessmentPlanStatus,
  planVersion: { createdAt: string; createdBy: string }
): WorkflowEvent[] {
  const events: WorkflowEvent[] = [
    { timestamp: planVersion.createdAt, label: 'assessments.setup.workflow.event.created', actor: planVersion.createdBy },
  ];
  if (status === 'approved') {
    events.push({ timestamp: new Date().toISOString(), label: 'assessments.setup.workflow.event.planApproved', actor: 'Hiring Manager' });
  }
  return events;
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date('2026-05-15T10:00:00Z');
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AssessmentSetupPage() {
  const { t } = useTranslation();
  const workflowState = getActiveAssessmentWorkflowState();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => workflowState.activeAssessmentPlanId);
  const [localStatus, setLocalStatus] = useState<AssessmentPlanStatus>(() => {
    return workflowState.stages.planApproved ? 'approved' : 'draft';
  });

  // Interview Workspace State
  const [interviewTab, setInterviewTab] = useState<'current' | 'upload' | 'drive' | 'ai'>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<InterviewQuestionSetVersion | null>(null);
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<boolean>(false);
  const [formatMismatch, setFormatMismatch] = useState<boolean>(false);

  const selectedPlan = mockAssessmentPlans.find((plan) => plan.id === selectedPlanId) ?? mockAssessmentPlans[0];
  const selectedPlanVersion = mockAssessmentPlanVersions.find((version) => version.id === selectedPlan.currentVersionId) ?? mockAssessmentPlanVersions[0];
  const selectedJob = mockJobs.find((job) => job.id === selectedPlan.jobId);
  const selectedJdVersion = mockJDVersions.find((version) => version.id === selectedPlan.jdVersionId);
  const selectedParsedProfile = mockParsedJDProfiles.find((profile) => profile.jdVersionId === selectedPlan.jdVersionId);
  const selectedRubric = mockRubricVersions.find((rubric) => rubric.id === selectedPlanVersion.rubricVersionId) ?? mockRubricVersions[0];
  const selectedQuestionSet = aiGeneratedQuestions ?? (mockInterviewQuestionSetVersions.find(
    (questionSet) => questionSet.id === selectedPlanVersion.interviewQuestionSetVersionId
  ) ?? mockInterviewQuestionSetVersions[0]);
  const selectedTestDefinition = mockTestDefinitionVersions.find(
    (testDefinition) => testDefinition.id === selectedPlanVersion.testDefinitionVersionId
  ) ?? mockTestDefinitionVersions[0];

  const traceabilityPreview = useMemo<TraceabilityPreview>(
    () => ({
      jobId: selectedPlan.jobId,
      jdVersionId: selectedPlan.jdVersionId,
      parsedCriteriaVersion: selectedPlan.parsedCriteriaVersion,
      assessmentPlanId: selectedPlan.id,
      assessmentPlanVersionId: selectedPlanVersion.id,
      rubricVersionId: selectedPlanVersion.rubricVersionId,
      interviewQuestionSetVersionId: selectedPlanVersion.interviewQuestionSetVersionId,
      testDefinitionVersionId: selectedPlanVersion.testDefinitionVersionId,
    }),
    [selectedPlan, selectedPlanVersion]
  );

  const workflowEvents = useMemo(() => buildWorkflowEvents(localStatus, selectedPlanVersion), [localStatus, selectedPlanVersion]);
  const totalWeight = selectedRubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const handlePlanChange = (planId: string): void => {
    const nextPlan = mockAssessmentPlans.find((plan) => plan.id === planId);
    setSelectedPlanId(planId);
    setLocalStatus(nextPlan?.status ?? 'draft');
  };

  const handleSaveDraft = (): void => {
    saveAssessmentPlanDraft(selectedPlan, selectedPlanVersion);
    setLocalStatus('draft');
  };

  const handleApprove = (): void => {
    approveAssessmentPlan(selectedPlan, selectedPlanVersion);
    setLocalStatus('approved');
  };

  const nextActionLabel = localStatus === 'approved' ? 'assessments.setup.workflow.action.viewResults' : 'assessments.setup.workflow.action.approve';
  const nextActionDisabled = localStatus === 'approved';

  // Interview Workspace Handlers
  const handleFileUpload = (): void => {
    // Mock: 70% success, 30% format mismatch
    const success = Math.random() > 0.3;
    setFormatMismatch(!success);
    setUploadPreview(true);
  };

  const handleDriveSync = (): void => {
    setDriveSyncing(true);
    setTimeout(() => setDriveSyncing(false), 1500);
  };

  const handleAIGenerate = (): void => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setAiGeneratedQuestions({
        id: `iqs-ver-${Date.now()}`,
        versionNumber: 2,
        title: 'AI-Generated Question Set',
        language: 'en',
        followUpPolicy: '2 guided follow-ups available.',
        questions: [
          { id: 'q1', text: 'Describe your experience with React and state management libraries.', category: 'technical', difficulty: 'medium' },
          { id: 'q2', text: 'Walk me through debugging a memory leak in a production application.', category: 'problem_solving', difficulty: 'hard' },
          { id: 'q3', text: 'How would you explain a complex technical decision to a non-technical stakeholder?', category: 'communication', difficulty: 'medium' },
          { id: 'q4', text: 'Share an example of delivering under tight constraints.', category: 'delivery', difficulty: 'easy' },
        ],
      });
    }, 2500);
  };

  const handleUseQuestionSet = (questionSet: InterviewQuestionSetVersion): void => {
    setAiGeneratedQuestions(questionSet);
    setInterviewTab('current');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('assessments.setup.title')}</h1>
          <p className={styles.description}>{t('assessments.setup.description')}</p>
        </div>
        <StatusBadge variant={statusVariantByPlanStatus[localStatus]} label={t(`assessments.setup.status.${localStatus}`)} dot />
      </header>

      <Notice variant="info" title={t('assessments.setup.notice.title')}>
        {t('assessments.setup.notice.body')}
      </Notice>

      <section className={styles.selectorBar} aria-label={t('assessments.setup.selector.aria')}>
        <label htmlFor="assessmentPlanSelect" className={styles.selectorLabel}>
          {t('assessments.setup.selector.label')}
        </label>
        <select
          id="assessmentPlanSelect"
          className={styles.selectorInput}
          value={selectedPlan.id}
          onChange={(event) => handlePlanChange(event.target.value)}
        >
          {mockAssessmentPlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </select>
      </section>

      <div className={styles.workflowGrid}>
        <Card className={styles.workflowCard}>
          <span className={styles.cardEyebrow}>{t('assessments.setup.workflow.state.label')}</span>
          <h2 className={styles.sectionTitle}>{t(`assessments.setup.workflow.state.${localStatus}`)}</h2>
          <p className={styles.mutedText}>{t(`assessments.setup.workflow.state.description.${localStatus}`)}</p>
        </Card>

        <Card className={styles.workflowCard}>
          <span className={styles.cardEyebrow}>{t('assessments.setup.workflow.approval.label')}</span>
          <h2 className={styles.sectionTitle}>{localStatus === 'approved' ? 'Hiring Manager' : t('common.pending')}</h2>
          <p className={styles.mutedText}>
            {localStatus === 'approved' ? t('assessments.setup.workflow.approval.approved') : t('assessments.setup.workflow.approval.pending')}
          </p>
        </Card>

        <Card className={styles.workflowCard}>
          <span className={styles.cardEyebrow}>{t('assessments.setup.workflow.evidence.label')}</span>
          <dl className={styles.compactDetails}>
            <div>
              <dt>{t('assessments.setup.workflow.evidence.planVersion')}</dt>
              <dd>{selectedPlanVersion.id}</dd>
            </div>
            <div>
              <dt>{t('assessments.setup.workflow.evidence.rubricVersion')}</dt>
              <dd>{selectedPlanVersion.rubricVersionId}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className={styles.timelineCard}>
        <span className={styles.cardEyebrow}>{t('assessments.setup.workflow.timeline.label')}</span>
        <h2 className={styles.sectionTitle}>{t('assessments.setup.workflow.timeline.title')}</h2>
        <div className={styles.timeline}>
          {workflowEvents.map((event, idx) => (
            <div key={idx} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>{t(event.label)}</span>
                  <span className={styles.timelineTime}>{formatRelativeTime(event.timestamp)}</span>
                </div>
                <p className={styles.timelineActor}>{event.actor}</p>
                <p className={styles.timelineTimestamp}>{formatTimestamp(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <span className={styles.cardEyebrow}>{t('assessments.setup.jobContext.eyebrow')}</span>
          <h2 className={styles.cardTitle}>{selectedJob?.title ?? t('common.notAvailable')}</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>{t('assessments.setup.trace.jobId')}</dt>
              <dd>{selectedPlan.jobId}</dd>
            </div>
            <div>
              <dt>{t('assessments.setup.trace.jdVersionId')}</dt>
              <dd>{selectedPlan.jdVersionId}</dd>
            </div>
            <div>
              <dt>{t('assessments.setup.trace.parsedCriteriaVersion')}</dt>
              <dd>{selectedParsedProfile?.parsedCriteriaVersion ?? selectedPlan.parsedCriteriaVersion}</dd>
            </div>
            <div>
              <dt>{t('assessments.setup.jobContext.jdStatus')}</dt>
              <dd>{selectedJdVersion ? t(`assessments.setup.status.${selectedJdVersion.status}`) : t('common.notAvailable')}</dd>
            </div>
          </dl>
        </Card>

        <Card className={styles.summaryCard}>
          <span className={styles.cardEyebrow}>{t('assessments.setup.version.eyebrow')}</span>
          <h2 className={styles.cardTitle}>{selectedPlan.title}</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>{t('assessments.setup.trace.assessmentPlanId')}</dt>
              <dd>{selectedPlan.id}</dd>
            </div>
            <div>
              <dt>{t('assessments.setup.trace.assessmentPlanVersionId')}</dt>
              <dd>{selectedPlanVersion.id}</dd>
            </div>
            <div>
              <dt>{t('assessments.setup.version.versionNumber')}</dt>
              <dd>{selectedPlanVersion.versionNumber}</dd>
            </div>
            <div>
              <dt>{t('assessments.setup.version.createdBy')}</dt>
              <dd>{selectedPlanVersion.createdBy}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className={styles.setupGrid}>
        <Card className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.cardEyebrow}>{t('assessments.setup.rubric.eyebrow')}</span>
              <h2 className={styles.sectionTitle}>{t('assessments.setup.rubric.title')}</h2>
            </div>
            <StatusBadge variant={totalWeight === 100 ? 'success' : 'warning'} label={t('assessments.setup.rubric.totalWeight', { weight: totalWeight })} />
          </div>
          <div className={styles.criteriaList}>
            {selectedRubric.criteria.map((criterion) => (
              <article key={criterion.id} className={styles.criterionItem}>
                <div className={styles.criterionHeader}>
                  <h3>{criterion.label}</h3>
                  <span>{criterion.weight}%</span>
                </div>
                <div className={styles.weightTrack} aria-label={t('assessments.setup.rubric.weightLabel', { label: criterion.label, weight: criterion.weight })}>
                  <span style={{ width: `${criterion.weight}%` }} />
                </div>
                <p>{criterion.description}</p>
              </article>
            ))}
          </div>
        </Card>

        <div className={styles.sideStack}>
          <Card className={styles.panelCard}>
            <span className={styles.cardEyebrow}>{t('assessments.setup.interview.eyebrow')}</span>
            <h2 className={styles.sectionTitle}>{selectedQuestionSet.title}</h2>
            <p className={styles.mutedText}>{selectedQuestionSet.followUpPolicy}</p>
            <dl className={styles.compactDetails}>
              <div>
                <dt>{t('assessments.setup.trace.interviewQuestionSetVersionId')}</dt>
                <dd>{selectedQuestionSet.id}</dd>
              </div>
              <div>
                <dt>{t('assessments.setup.interview.language')}</dt>
                <dd>{selectedQuestionSet.language}</dd>
              </div>
            </dl>

            {/* Tab Navigation */}
            <div className={styles.tabs} role="tablist">
              {(['current', 'upload', 'drive', 'ai'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  type="button"
                  aria-selected={interviewTab === tab}
                  className={`${styles.tabButton} ${interviewTab === tab ? styles.tabButtonActive : ''}`}
                  onClick={() => setInterviewTab(tab)}
                >
                  {t(`assessments.setup.interview.tabs.${tab}`)}
                </button>
              ))}
            </div>

            {/* Current Set Tab */}
            {interviewTab === 'current' && (
              <div className={styles.tabContent} role="tabpanel">
                <ul className={styles.questionList}>
                  {selectedQuestionSet.questions.map((question) => (
                    <li key={question.id}>
                      <span>{question.category}</span>
                      {question.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload Tab */}
            {interviewTab === 'upload' && (
              <div className={styles.tabContent} role="tabpanel">
                <h3 className={styles.panelTitle}>{t('assessments.setup.interview.upload.title')}</h3>
                <div className={styles.uploadZone} onClick={handleFileUpload}>
                  <p>{t('assessments.setup.interview.upload.dropzone')}</p>
                  <p>{t('assessments.setup.interview.upload.supported')}</p>
                  <p>{t('assessments.setup.interview.upload.templateInfo')}</p>
                  <input type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileUpload} />
                </div>
                {uploadPreview && !formatMismatch && (
                  <Notice variant="success" title="Questions parsed successfully">
                    {t('assessments.setup.interview.upload.preview')}: 4 questions found.
                  </Notice>
                )}
                {uploadPreview && formatMismatch && (
                  <Notice variant="danger" title={t('assessments.setup.interview.upload.mismatch')}>
                    <Button variant="secondary" size="sm" onClick={() => setInterviewTab('ai')}>
                      {t('assessments.setup.interview.upload.suggestAi')}
                    </Button>
                  </Notice>
                )}
                {uploadPreview && !formatMismatch && (
                  <div className={styles.panelActions}>
                    <Button variant="primary" onClick={() => setInterviewTab('current')}>
                      {t('assessments.setup.interview.upload.import')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Google Drive Tab */}
            {interviewTab === 'drive' && (
              <div className={styles.tabContent} role="tabpanel">
                <h3 className={styles.panelTitle}>{t('assessments.setup.interview.drive.title')}</h3>
                <div className={styles.inputGroup}>
                  <label htmlFor="driveFolder">{t('assessments.setup.interview.drive.folderPath')}</label>
                  <input
                    id="driveFolder"
                    type="text"
                    className={styles.textInput}
                    placeholder={t('assessments.setup.interview.drive.folderPlaceholder')}
                  />
                </div>
                <Button variant="secondary" onClick={handleDriveSync} disabled={driveSyncing}>
                  {driveSyncing ? '...' : t('assessments.setup.interview.drive.sync')}
                </Button>
                <div className={styles.driveFiles}>
                  <p><strong>{t('assessments.setup.interview.drive.files')}</strong></p>
                  {[
                    { name: 'Frontend_Questions_2026.xlsx', status: 'ready' },
                    { name: 'Behavioral_Interview_Guide.docx', status: 'mismatch' },
                    { name: 'Engineering_Rubric.xlsx', status: 'review' },
                  ].map((file) => (
                    <div key={file.name} className={styles.driveFileItem}>
                      <span className={styles.fileName}>{file.name}</span>
                      <StatusBadge
                        variant={file.status === 'ready' ? 'success' : file.status === 'mismatch' ? 'danger' : 'warning'}
                        label={t(`assessments.setup.interview.drive.status.${file.status}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Generate Tab */}
            {interviewTab === 'ai' && (
              <div className={styles.tabContent} role="tabpanel">
                <h3 className={styles.panelTitle}>{t('assessments.setup.interview.ai.title')}</h3>
                <div className={styles.inputGroup}>
                  <label htmlFor="aiPrompt">{t('assessments.setup.interview.ai.prompt')}</label>
                  <textarea
                    id="aiPrompt"
                    className={styles.aiPromptArea}
                    rows={6}
                    placeholder={t('assessments.setup.interview.ai.promptPlaceholder')}
                  />
                </div>
                <Button variant="primary" onClick={handleAIGenerate} disabled={isGenerating}>
                  {isGenerating ? t('assessments.setup.interview.ai.generating') : t('assessments.setup.interview.ai.generate')}
                </Button>
                {isGenerating && (
                  <Notice variant="info">{t('assessments.setup.interview.ai.generating')}</Notice>
                )}
                {aiGeneratedQuestions && (
                  <div className={styles.previewScroll}>
                    <p><strong>{t('assessments.setup.interview.upload.preview')}</strong></p>
                    <ul className={styles.questionList}>
                      {aiGeneratedQuestions.questions.map((q) => (
                        <li key={q.id}>
                          <span>{q.category}</span>
                          {q.text}
                        </li>
                      ))}
                    </ul>
                    <div className={styles.panelActions}>
                      <Button variant="primary" onClick={() => handleUseQuestionSet(aiGeneratedQuestions)}>
                        {t('assessments.setup.interview.ai.useGenerated')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className={styles.panelCard}>
            <span className={styles.cardEyebrow}>{t('assessments.setup.test.eyebrow')}</span>
            <h2 className={styles.sectionTitle}>{selectedTestDefinition.title}</h2>
            <dl className={styles.compactDetails}>
              <div>
                <dt>{t('assessments.setup.trace.testDefinitionVersionId')}</dt>
                <dd>{selectedTestDefinition.id}</dd>
              </div>
              <div>
                <dt>{t('assessments.setup.test.type')}</dt>
                <dd>{selectedTestDefinition.testType}</dd>
              </div>
            </dl>
            <div className={styles.sectionList}>
              {selectedTestDefinition.sections.map((section) => (
                <div key={section.id} className={styles.sectionItem}>
                  <span>{section.title}</span>
                  <strong>{t('assessments.setup.test.sectionMeta', { weight: section.weight, duration: section.durationMinutes })}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className={styles.traceCard}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.cardEyebrow}>{t('assessments.setup.trace.eyebrow')}</span>
            <h2 className={styles.sectionTitle}>{t('assessments.setup.trace.title')}</h2>
          </div>
          <StatusBadge variant="info" label={t('assessments.setup.trace.previewMode')} />
        </div>
        <dl className={styles.traceGrid}>
          {Object.entries(traceabilityPreview).map(([key, value]) => (
            <div key={key}>
              <dt>{t(`assessments.setup.trace.${key}`)}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className={styles.actionBar}>
        <Button variant="secondary" onClick={handleSaveDraft}>
          {t('assessments.setup.actions.saveDraft')}
        </Button>
        <Button onClick={handleApprove} disabled={nextActionDisabled}>
          {t(nextActionLabel)}
        </Button>
      </div>
    </div>
  );
}
