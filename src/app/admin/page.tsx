'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { mockIntegrationHealth, bqBlockers } from '@/lib/mockData';
import styles from './admin.module.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'api' | 'monitoring'>('integrations');
  const [isLoading, setIsLoading] = useState(false);

  const bq002 = bqBlockers.find(b => b.code === 'BQ-002');
  const bq003 = bqBlockers.find(b => b.code === 'BQ-003');
  const bq005 = bqBlockers.find(b => b.code === 'BQ-005');

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Configuration & Monitoring</h1>
          <p className={styles.description}>
            System configuration, integration health, and operational monitoring
          </p>
        </div>
      </div>

      <div className={styles.blockersSection}>
        {bq002 && (
          <Notice variant="blocker" title={`${bq002.code}: ${bq002.title}`}>
            {bq002.description} Configure Google OAuth credentials to enable this feature.
          </Notice>
        )}
        {bq003 && (
          <Notice variant="blocker" title={`${bq003.code}: ${bq003.title}`}>
            {bq003.description} Implement AI matching service for this feature.
          </Notice>
        )}
        {bq005 && (
          <Notice variant="blocker" title={`${bq005.code}: ${bq005.title}`}>
            {bq005.description} Implement AI test grading service.
          </Notice>
        )}
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Admin configuration tabs">
        {(['integrations', 'api', 'monitoring'] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
            aria-selected={activeTab === tab}
            id={`tab-${tab}`}
            aria-controls={`panel-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'integrations' && (
        <div className={styles.content} role="tabpanel" id="panel-integrations" aria-labelledby="tab-integrations">
          {isLoading ? (
            <Card>
              <CardContent>
                <LoadingState text="Loading integrations..." />
              </CardContent>
            </Card>
          ) : (
            <>
          <Card>
            <CardHeader
              title="Google Workspace Integration"
              description="Configure OAuth and API connections"
            />
            <CardContent>
              <div className={styles.integrationConfig}>
                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📊</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>Google Sheets API</span>
                      <span className={styles.configDesc}>Candidate data import</span>
                    </div>
                    <StatusBadge variant="success" label="Connected" />
                  </div>
                  <div className={styles.configDetails}>
                    <span>Last sync: 2 hours ago</span>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📁</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>Google Drive</span>
                      <span className={styles.configDesc}>Auto-import from watch folder</span>
                    </div>
                    <StatusBadge variant="warning" label="Requires Setup" />
                  </div>
                  <div className={styles.configDetails}>
                    <span>Watch folder not configured</span>
                    <Button variant="secondary" size="sm">Configure</Button>
                  </div>
                  <Notice variant="warning" title="BQ-005: Drive Watch Blocked">
                    Automatic file monitoring requires folder path configuration.
                  </Notice>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📅</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>Google Calendar</span>
                      <span className={styles.configDesc}>Interview scheduling</span>
                    </div>
                    <StatusBadge variant="success" label="Connected" />
                  </div>
                  <div className={styles.configDetails}>
                    <span>Calendar ID: hr-recruitment@company.com</span>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📧</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>Gmail API</span>
                      <span className={styles.configDesc}>Candidate communication</span>
                    </div>
                    <StatusBadge variant="success" label="Connected" />
                  </div>
                  <div className={styles.configDetails}>
                    <span>Sending from: hr@company.com</span>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>🤖</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>Gemini AI API</span>
                      <span className={styles.configDesc}>CV screening and evaluation</span>
                    </div>
                    <StatusBadge variant="warning" label="Degraded" />
                  </div>
                  <div className={styles.configDetails}>
                    <span>3 errors in last hour</span>
                    <Button variant="ghost" size="sm">View Logs</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Integration Health Status"
              description="Real-time status of all connected services"
            />
            <CardContent>
              <div className={styles.healthGrid}>
                {mockIntegrationHealth.map(integration => (
                  <div key={integration.id} className={styles.healthItem}>
                    <div className={styles.healthHeader}>
                      <span className={`${styles.healthDot} ${styles[integration.status]}`} />
                      <span className={styles.healthName}>{integration.name}</span>
                    </div>
                    <div className={styles.healthMeta}>
                      <span className={styles.healthEndpoint}>{integration.endpoint}</span>
                      <span className={styles.healthSync}>
                        Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                      </span>
                      {integration.errorCount > 0 && (
                        <span className={styles.healthErrors}>
                          {integration.errorCount} errors
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'api' && (
        <div className={styles.content} role="tabpanel" id="panel-api" aria-labelledby="tab-api">
          <Card>
            <CardHeader
              title="API Configuration"
              description="LLM and external service API settings"
            />
            <CardContent>
              <div className={styles.apiSettings}>
                <div className={styles.apiItem}>
                  <div className={styles.apiHeader}>
                    <h3>Gemini API</h3>
                    <StatusBadge variant="success" label="Active" />
                  </div>
                  <div className={styles.apiForm}>
                    <div className={styles.formGroup}>
                      <label>API Key</label>
                      <input type="password" value="••••••••••••••••" readOnly className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Model Version</label>
                      <select className={styles.select}>
                        <option>gemini-pro-1.5</option>
                        <option>gemini-pro</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Max Tokens per Request</label>
                      <input type="number" value="8192" className={styles.input} />
                    </div>
                  </div>
                </div>

                <div className={styles.apiItem}>
                  <div className={styles.apiHeader}>
                    <h3>Usage Limits</h3>
                  </div>
                  <div className={styles.usageLimits}>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>Monthly Token Budget</span>
                      <ProgressBar value={45} variant="info" showValue label="1.8M / 4M tokens" />
                    </div>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>API Cost This Month</span>
                      <ProgressBar value={62} variant="warning" showValue label="$248 / $400 budget" />
                    </div>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>Daily Request Limit</span>
                      <ProgressBar value={28} variant="success" showValue label="840 / 3,000 requests" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Data Retention Policy"
              description="Configure data storage and deletion rules"
            />
            <CardContent>
              <div className={styles.retentionSettings}>
                <div className={styles.retentionItem}>
                  <div className={styles.retentionInfo}>
                    <span className={styles.retentionLabel}>CV Storage</span>
                    <span className={styles.retentionDesc}>Duration: 90 days after decision</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit Policy</Button>
                </div>
                <div className={styles.retentionItem}>
                  <div className={styles.retentionInfo}>
                    <span className={styles.retentionLabel}>Interview Transcripts</span>
                    <span className={styles.retentionDesc}>Duration: 1 year</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit Policy</Button>
                </div>
                <Notice variant="warning" title="BQ-003: Retention Policy Blocked">
                  Automatic data deletion requires retention policy confirmation from HR/IT Admin.
                </Notice>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className={styles.content} role="tabpanel" id="panel-monitoring" aria-labelledby="tab-monitoring">
          <div className={styles.statsRow}>
            <Card className={styles.statCard}>
              <CardContent>
                <div className={styles.statContent}>
                  <span className={styles.statIcon}>📊</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>99.2%</span>
                    <span className={styles.statLabel}>System Uptime</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={styles.statCard}>
              <CardContent>
                <div className={styles.statContent}>
                  <span className={styles.statIcon}>⚡</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>142ms</span>
                    <span className={styles.statLabel}>Avg API Response</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={styles.statCard}>
              <CardContent>
                <div className={styles.statContent}>
                  <span className={styles.statIcon}>🤖</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>1,247</span>
                    <span className={styles.statLabel}>AI Calls Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={styles.statCard}>
              <CardContent>
                <div className={styles.statContent}>
                  <span className={styles.statIcon}>💰</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>$248</span>
                    <span className={styles.statLabel}>API Cost MTD</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Queue & Processing Status"
              description="Background job queue monitoring"
            />
            <CardContent>
              <div className={styles.queueList}>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>CV Screening Queue</span>
                    <span className={styles.queueStatus}>Processing normally</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>12 pending</span>
                    <span>0 failed</span>
                  </div>
                </div>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>Email Queue</span>
                    <span className={styles.queueStatus}>Processing normally</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>3 pending</span>
                    <span>0 failed</span>
                  </div>
                </div>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>AI Interview Processing</span>
                    <span className={styles.queueStatus}>1 stalled job detected</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>5 pending</span>
                    <span className={styles.queueError}>1 stalled</span>
                  </div>
                </div>
                <Notice variant="warning" title="Queue Stall Detected">
                  One AI interview processing job has been stalled for over 2 hours. Manual intervention may be required.
                </Notice>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Recent System Events"
              description="Audit log for system actions"
            />
            <CardContent>
              <div className={styles.eventList}>
                <div className={styles.eventItem}>
                  <span className={styles.eventTime}>May 13, 2024 11:42 AM</span>
                  <span className={styles.eventIcon}>🔐</span>
                  <span className={styles.eventText}>User HR Manager approved 3 screening candidates</span>
                </div>
                <div className={styles.eventItem}>
                  <span className={styles.eventTime}>May 13, 2024 11:38 AM</span>
                  <span className={styles.eventIcon}>📧</span>
                  <span className={styles.eventText}>Interview reminder sent to Sarah Chen</span>
                </div>
                <div className={styles.eventItem}>
                  <span className={styles.eventTime}>May 13, 2024 11:30 AM</span>
                  <span className={styles.eventIcon}>✅</span>
                  <span className={styles.eventText}>CV screening completed for 5 candidates</span>
                </div>
                <div className={styles.eventItem}>
                  <span className={styles.eventTime}>May 13, 2024 11:15 AM</span>
                  <span className={styles.eventIcon}>⚠️</span>
                  <span className={styles.eventText}>Gemini API rate limit warning</span>
                </div>
                <div className={styles.eventItem}>
                  <span className={styles.eventTime}>May 13, 2024 10:45 AM</span>
                  <span className={styles.eventIcon}>📁</span>
                  <span className={styles.eventText}>Google Drive file imported: candidates_batch_5.xlsx</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}