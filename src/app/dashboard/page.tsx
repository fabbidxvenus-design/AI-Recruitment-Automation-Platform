'use client';

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
  const pendingApprovals = mockScreeningEvaluations.filter(e => e.status === 'pending');
  const pendingSchedules = mockScheduleSlots.filter(s => s.status === 'pending');
  const openErrors = mockErrorRemediationItems.filter(e => e.status !== 'resolved');

  const approvalColumns = [
    {
      key: 'candidate',
      header: 'Candidate',
      render: (row: typeof mockScreeningEvaluations[0]) => (
        <div className={styles.candidateCell}>
          <span className={styles.candidateName}>{row.candidateName}</span>
          <span className={styles.jobTitle}>{row.jobTitle}</span>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'AI Score',
      render: (row: typeof mockScreeningEvaluations[0]) => (
        <div className={styles.scoreCell}>
          <span className={styles.scoreValue}>{row.overallScore}</span>
          <ProgressBar value={row.overallScore} max={100} size="sm" variant={row.overallScore >= 80 ? 'success' : row.overallScore >= 60 ? 'warning' : 'danger'} />
        </div>
      ),
    },
    {
      key: 'decision',
      header: 'Recommendation',
      render: (row: typeof mockScreeningEvaluations[0]) => (
        <StatusBadge
          variant={row.decision === 'approve' ? 'success' : row.decision === 'reject' ? 'danger' : 'warning'}
          label={row.decision === 'approve' ? 'Approve' : row.decision === 'reject' ? 'Reject' : 'Review'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <Link href="/screening/review" className={styles.actionLink}>Review</Link>
      ),
    },
  ];

  const errorColumns = [
    {
      key: 'code',
      header: 'Error Code',
      render: (row: typeof mockErrorRemediationItems[0]) => (
        <Link href={`/errors/${row.errorCode}`} className={styles.errorCodeLink}>
          {row.errorCode}
        </Link>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (row: typeof mockErrorRemediationItems[0]) => row.title,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row: typeof mockErrorRemediationItems[0]) => (
        <StatusBadge
          variant={row.severity === 'critical' ? 'danger' : row.severity === 'high' ? 'warning' : 'info'}
          label={row.severity.charAt(0).toUpperCase() + row.severity.slice(1)}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: typeof mockErrorRemediationItems[0]) => (
        <StatusBadge
          variant={row.status === 'open' ? 'danger' : row.status === 'in_progress' ? 'warning' : 'success'}
          label={row.status.replace('_', ' ')}
        />
      ),
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (row: typeof mockErrorRemediationItems[0]) => row.assignee || 'Unassigned',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <section className={styles.kpiSection}>
        <MetricCard
          label="Total Candidates"
          value={dashboardMetrics.totalCandidates}
          icon="👥"
          change="+12 this week"
          trend="up"
          variant="primary"
        />
        <MetricCard
          label="Active Jobs"
          value={dashboardMetrics.activeJobs}
          icon="💼"
          variant="info"
        />
        <MetricCard
          label="Pending Screening"
          value={dashboardMetrics.pendingScreening}
          icon="📋"
          variant="warning"
        />
        <MetricCard
          label="Interviews This Week"
          value={dashboardMetrics.interviewsThisWeek}
          icon="📅"
          variant="purple"
        />
        <MetricCard
          label="Offers Pending"
          value={dashboardMetrics.offersPending}
          icon="🎯"
          variant="success"
        />
        <MetricCard
          label="Avg. Time to Hire"
          value={`${dashboardMetrics.avgTimeToHire}d`}
          icon="⏱️"
          change="-2 days"
          trend="up"
          variant="teal"
        />
      </section>

      <Notice
        variant="blocker"
        title="AI-Enabled Features Blocked"
        action={<Link href="/admin"><Button variant="secondary" size="sm">Configure</Button></Link>}
      >
        Several AI-powered features require Google API setup. {bqBlockers.filter(b => b.screenIds.includes('SCREEN-001')).length} blockers affect this dashboard.
      </Notice>

      <section className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <Card>
            <CardHeader
              title="Pipeline Overview"
              description="Active candidates by stage"
              action={<Link href="/candidates/import"><Button variant="ghost" size="sm">View All</Button></Link>}
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
              title="Pending Approvals"
              description={`${pendingApprovals.length} items require HR Manager action`}
              action={<Link href="/screening/review"><Button variant="primary" size="sm">Review All</Button></Link>}
            />
            <CardContent>
              <DataTable
                columns={approvalColumns}
                data={pendingApprovals}
                caption="Pending approval items"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Interview Schedule Pending"
              description={`${pendingSchedules.length} interviews awaiting approval`}
              action={<Link href="/interviews/schedule-approval"><Button variant="ghost" size="sm">View All</Button></Link>}
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
                    <StatusBadge variant="warning" label="Pending Approval" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          <Card>
            <CardHeader
              title="Error Remediation Queue"
              description={`${openErrors.length} open errors`}
              action={<Link href="/errors/ERR-2024-0892"><Button variant="ghost" size="sm">View Details</Button></Link>}
            />
            <CardContent>
              <DataTable
                columns={errorColumns}
                data={openErrors}
                caption="Error remediation items"
                compact
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Integration Health"
              description="Google Workspace status"
              action={<Link href="/admin"><Button variant="ghost" size="sm">Admin Panel</Button></Link>}
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
                        <span className={styles.errorCount}>{integration.errorCount} errors</span>
                      )}
                      <span className={styles.lastSync}>
                        Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Recent Activity"
              description="Latest pipeline events"
            />
            <CardContent>
              <div className={styles.activityFeed}>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>✅</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>Sarah Chen moved to Interview stage</span>
                    <span className={styles.activityTime}>2 hours ago</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>📋</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>3 candidates awaiting screening review</span>
                    <span className={styles.activityTime}>5 hours ago</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>📅</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>Interview scheduled with Emily Williams</span>
                    <span className={styles.activityTime}>Yesterday</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}>⚠️</span>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>Video processing error requires attention</span>
                    <span className={styles.activityTime}>2 days ago</span>
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