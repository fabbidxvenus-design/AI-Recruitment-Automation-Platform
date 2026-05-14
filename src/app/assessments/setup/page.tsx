'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Notice, StatusBadge } from '@/components';
import { mockJobs, mockJDVersions, mockParsedJDProfiles } from '@/lib/jobIntakeMockData';
import {
  mockAssessmentPlans,
  mockAssessmentPlanVersions,
  mockInterviewQuestionSetVersions,
  mockRubricVersions,
  mockTestDefinitionVersions,
} from '@/lib/assessmentPlanMockData';
import type { AssessmentPlanStatus } from '@/types';
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

const statusVariantByPlanStatus: Record<AssessmentPlanStatus, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  approved: 'success',
  archived: 'default',
};

export default function AssessmentSetupPage() {
  const { t } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(mockAssessmentPlans[0]?.id ?? '');
  const [localStatus, setLocalStatus] = useState<AssessmentPlanStatus>(mockAssessmentPlans[0]?.status ?? 'draft');

  const selectedPlan = mockAssessmentPlans.find((plan) => plan.id === selectedPlanId) ?? mockAssessmentPlans[0];
  const selectedPlanVersion = mockAssessmentPlanVersions.find((version) => version.id === selectedPlan.currentVersionId) ?? mockAssessmentPlanVersions[0];
  const selectedJob = mockJobs.find((job) => job.id === selectedPlan.jobId);
  const selectedJdVersion = mockJDVersions.find((version) => version.id === selectedPlan.jdVersionId);
  const selectedParsedProfile = mockParsedJDProfiles.find((profile) => profile.jdVersionId === selectedPlan.jdVersionId);
  const selectedRubric = mockRubricVersions.find((rubric) => rubric.id === selectedPlanVersion.rubricVersionId) ?? mockRubricVersions[0];
  const selectedQuestionSet = mockInterviewQuestionSetVersions.find(
    (questionSet) => questionSet.id === selectedPlanVersion.interviewQuestionSetVersionId
  ) ?? mockInterviewQuestionSetVersions[0];
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

  const totalWeight = selectedRubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const handlePlanChange = (planId: string): void => {
    const nextPlan = mockAssessmentPlans.find((plan) => plan.id === planId);
    setSelectedPlanId(planId);
    setLocalStatus(nextPlan?.status ?? 'draft');
  };

  const handleSaveDraft = (): void => {
    setLocalStatus('draft');
  };

  const handleApprove = (): void => {
    setLocalStatus('approved');
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
              <dd>{selectedJdVersion?.status ?? t('common.notAvailable')}</dd>
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
            <ul className={styles.questionList}>
              {selectedQuestionSet.questions.map((question) => (
                <li key={question.id}>
                  <span>{question.category}</span>
                  {question.text}
                </li>
              ))}
            </ul>
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
          <StatusBadge variant="info" label={t('assessments.setup.trace.prototypeOnly')} />
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
        <Button onClick={handleApprove}>{t('assessments.setup.actions.approve')}</Button>
      </div>
    </div>
  );
}
