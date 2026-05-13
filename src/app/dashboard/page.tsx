'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  mockCandidates,
  mockJobs,
  mockScreeningEvaluations,
  mockScheduleSlots,
  mockErrorRemediationItems,
  mockIntegrationHealth,
  dashboardMetrics,
  bqBlockers,
} from '@/lib/mockData';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { t } = useTranslation();
  const pendingApprovals = mockScreeningEvaluations.filter(e => e.status === 'pending');
  const pendingSchedules = mockScheduleSlots.filter(s => s.status === 'pending');
  const openErrors = mockErrorRemediationItems.filter(e => e.status !== 'resolved');

  const approvalColumns = [
    {
      key: 'candidate',
      header: t('dashboard.columns.candidate'),
      render: (row: typeof mockScreeningEvaluations[0]) => (
        <div className={styles.candidateCell}>
          <span className={styles.candidateName}>{row.candidateName}</span>
          <span className={styles.jobTitle}>{row.jobTitle}</span>
        </div>
      ),
    },
    {
      key: 'score',
      header: t('dashboard.columns.aiScore'),
      render: (row: typeof mockScreeningEvaluations[0]) => (
        <div className={styles.scoreCell}>
          <span className={styles.scoreValue}>{row.overallScore}</span>
          <ProgressBar value={row.overallScore} max={100} size="sm" variant={row.overallScore >= 80 ? 'success' : row.overallScore >= 60 ? 'warning' : 'danger'} />
        </div>
      ),
    },
    {
      key: 'decision',
      header: t('dashboard.columns.recommendation'),
      render: (row: typeof mockScreeningEvaluations[0]) => (
        <StatusBadge
          variant={row.decision === 'approve' ? 'success' : row.decision === 'reject' ? 'danger' : 'warning'}
          label={t(`common.decision.${row.decision}`)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <Link href="/screening/review" className={styles.actionLink}>{t('dashboard.approvals.review')}</Link>
      ),
    },
  ];

  const errorColumns = [
    {
      key: 'code',
      header: t('dashboard.columns.errorCode'),
      render: (row: typeof mockErrorRemediationItems[0]) => (
        <Link href={`/errors/${row.errorCode}`} className={styles.errorCodeLink}>
          {row.errorCode}
        </Link>
      ),
    },
    {
      key: 'title',
      header: t('dashboard.columns.title'),
      render: (row: typeof mockErrorRemediationItems[0]) => row.title,
    },
    {
      key: 'severity',
      header: t('dashboard.columns.severity'),
      render: (row: typeof mockErrorRemediationItems[0]) => (
        <StatusBadge
          variant={row.severity === 'critical' ? 'danger' : row.severity === 'high' ? 'warning' : 'info'}
          label={t(`common.severity.${row.severity}`)}
        />
      ),
    },
    {
      key: 'status',
      header: t('dashboard.columns.status'),
      render: (row: typeof mockErrorRemediationItems[0]) => (
        <StatusBadge
          variant={row.status === 'open' ? 'danger' : row.status === 'in_progress' ? 'warning' : 'success'}
          label={t(`common.status.${row.status}`)}
        />
      ),
    },
    {
      key: 'assignee',
      header: t('dashboard.columns.assignee'),
      render: (row: typeof mockErrorRemediationItems[0]) => row.assignee || t('common.unassigned'),
    },
  ];

  return (
    <div className={styles.dashboard}>
      <section className={styles.kpiSection}>
        <MetricCard
          label={t('dashboard.kpi.totalCandidates')}
          value={dashboardMetrics.totalCandidates}
          icon="👥"
          change={t('dashboard.kpi.plusThisWeek')}
          trend="up"
          variant="primary"
        />
        <MetricCard
          label={t('dashboard.kpi.activeJobs')}
          value={dashboardMetrics.activeJobs}
          icon="💼"
          variant="info"
        />
        <MetricCard
          label={t('dashboard.kpi.pendingScreening')}
          value={dashboardMetrics.pendingScreening}
          icon="📋"
          variant="warning"
        />
        <MetricCard
          label={t('dashboard.kpi.interviewsThisWeek')}
          value={dashboardMetrics.interviewsThisWeek}
          icon="📅"
          variant="purple"
        />
        <MetricCard
          label={t('dashboard.kpi.offersPending')}
          value={dashboardMetrics.offersPending}
          icon="🎯"
          variant="success"
        />
        <MetricCard
          label={t('dashboard.kpi.avgTimeToHire')}
          value={`${dashboardMetrics.avgTimeToHire}d`}
          icon="⏱️"
          change={t('dashboard.kpi.minusDays')}
          trend="up"
          variant="teal"
        />
      </section>

      <Notice
        variant="blocker"
        title={t('dashboard.notice.aiBlocked')}
        action={<Link href="/admin"><Button variant="secondary" size="sm">{t('common.configure')}</Button></Link>}
      >
        {t('dashboard.notice.aiBlockedDesc', { count: bqBlockers.filter(b => b.screenIds.includes('SCREEN-001')).length })}
      </Notice>

      <section className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <Card>
            <CardHeader
              title={t('dashboard.pipeline.title')}
              description={t('dashboard.pipeline.description')}
              action={<Link href="/candidates/import"><Button variant="ghost" size="sm">{t('common.viewAll')}</Button></Link>}
            />
            <CardContent>
              <div className={styles.pipelineJobs}>
                {mockJobs.map(job => (
                  <div key={job.id} className={styles.pipelineJob}>
                    <div className={styles.jobHeader}>
                      <span className={styles.jobTitle}>{job.title}</span>
                      <span className={styles.jobDept}>{job.department}</span>
                    </div>
                    <div className={styles.pipelineBars}>
                      {job.pipelineSummary.map(stage => (
                        <div
                          key={stage.stage}
                          className={styles.pipelineStage}
                          style={{ '--stage-color': stage.color } as React.CSSProperties}
                          title={`${stage.stage}: ${stage.count}`}
                        >
                          <div className={styles.stageBar} style={{ width: `${(stage.count / job.candidateCount) * 100}%` }} />
                          <span className={styles.stageCount}>{stage.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.stageLegend}>
                      {job.pipelineSummary.map(stage => (
                        <div key={stage.stage} className={styles.legendItem}>
                          <span className={styles.legendDot} style={{ background: stage.color }} />
                          <span>{stage.stage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('dashboard.approvals.title')}
              description={t('dashboard.approvals.description', { count: pendingApprovals.length })}
              action={<Link href="/screening/review"><Button variant="primary" size="sm">{t('common.reviewAll')}</Button></Link>}
            />
            <CardContent>
              <DataTable
                columns={approvalColumns}
                data={pendingApprovals}
                caption={t('dashboard.approvals.caption')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('dashboard.schedule.title')}
              description={t('dashboard.schedule.description', { count: pendingSchedules.length })}
              action={<Link href="/interviews/schedule-approval"><Button variant="ghost" size="sm">{t('common.viewAll')}</Button></Link>}
            />
            <CardContent>
              <div className={styles.scheduleList}>
                {pendingSchedules.map(slot => (
                  <div key={slot.id} className={styles.scheduleItem}>
                    <div className={styles.scheduleInfo}>
                      <span className={styles.scheduleCandidate}>{slot.candidateName}</span>
                      <span className={styles.scheduleType}>{slot.interviewType}</span>
                    </div>
                    <div className={styles.scheduleMeta}>
                      <span>{slot.interviewerName}</span>
                      <span>{new Date(slot.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <StatusBadge variant="warning" label={t('common.status.pending')} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          <Card>
            <CardHeader
              title={t('dashboard.errors.title')}
              description={t('dashboard.errors.description', { count: openErrors.length })}
              action={<Link href="/errors/ERR-2024-0892"><Button variant="ghost" size="sm">{t('dashboard.errors.viewDetails')}</Button></Link>}
            />
            <CardContent>
              <DataTable
                columns={errorColumns}
                data={openErrors}
                caption={t('dashboard.errors.caption')}
                compact
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('dashboard.integration.title')}
              description={t('dashboard.integration.description')}
              action={<Link href="/admin"><Button variant="ghost" size="sm">{t('common.adminPanel')}</Button></Link>}
            />
            <CardContent>
              <div className={styles.integrationList}>
                {mockIntegrationHealth.map(integration => (
                  <div key={integration.id} className={styles.integrationItem}>
                    <div className={styles.integrationStatus}>
                      <span className={`${styles.statusDot} ${styles[integration.status]}`} />
                      <span className={styles.integrationName}>{integration.name}</span>
                    </div>
                    <div className={styles.integrationMeta}>
                      {integration.status !== 'healthy' && (
                        <span className={styles.errorCount}>{integration.errorCount} {t('dashboard.integration.errors')}</span>
                      )}
                      <span className={styles.lastSync}>
                        {t('common.dateTime.lastSync')}: {new Date(integration.lastSync).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('dashboard.activity.title')}
              description={t('dashboard.activity.description')}
            />
            <CardContent>
              <div className={styles.activityFeed}>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>✅</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>{t('dashboard.activity.movedToStage', { name: 'Sarah Chen', stage: 'Interview' })}</span>
                    <span className={styles.activityTime}>{t('dashboard.activity.twoHoursAgo')}</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>📋</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>{t('dashboard.activity.awaitingScreening', { count: 3 })}</span>
                    <span className={styles.activityTime}>{t('dashboard.activity.fiveHoursAgo')}</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>📅</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>{t('dashboard.activity.scheduledInterview', { name: 'Emily Williams' })}</span>
                    <span className={styles.activityTime}>{t('common.dateTime.yesterday')}</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>⚠️</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>{t('dashboard.activity.videoError')}</span>
                    <span className={styles.activityTime}>{t('dashboard.activity.twoDaysAgo')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}