'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatTime } from '@/lib/formatDate';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { mockIntegrationHealth, bqBlockers } from '@/lib/mockData';
import styles from './admin.module.css';

export default function AdminPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'integrations' | 'api' | 'monitoring'>('integrations');
  const [isLoading, setIsLoading] = useState(false);

  const bq002 = bqBlockers.find(b => b.code === 'BQ-002');
  const bq003 = bqBlockers.find(b => b.code === 'BQ-003');
  const bq005 = bqBlockers.find(b => b.code === 'BQ-005');

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.title')}</h1>
          <p className={styles.description}>
            {t('admin.description')}
          </p>
        </div>
      </div>

      <div className={styles.blockersSection}>
        {bq002 && (
          <Notice variant="blocker" title={`${bq002.code}: ${bq002.title}`}>
            {bq002.description} {t('admin.integrations.notices.bq002.body')}
          </Notice>
        )}
        {bq003 && (
          <Notice variant="blocker" title={`${bq003.code}: ${bq003.title}`}>
            {bq003.description} {t('admin.integrations.notices.bq003.body')}
          </Notice>
        )}
        {bq005 && (
          <Notice variant="blocker" title={`${bq005.code}: ${bq005.title}`}>
            {bq005.description} {t('admin.integrations.notices.bq005.body')}
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
            {t(`admin.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'integrations' && (
        <div className={styles.content} role="tabpanel" id="panel-integrations" aria-labelledby="tab-integrations">
          {isLoading ? (
            <Card>
              <CardContent>
                <LoadingState text={t('common.loading')} />
              </CardContent>
            </Card>
          ) : (
            <>
          <Card>
            <CardHeader
              title={t('admin.integrations.googleWorkspace.title')}
              description={t('admin.integrations.googleWorkspace.description')}
            />
            <CardContent>
              <div className={styles.integrationConfig}>
                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📊</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>{t('admin.integrations.googleSheets.name')}</span>
                      <span className={styles.configDesc}>{t('admin.integrations.googleSheets.desc')}</span>
                    </div>
                    <StatusBadge variant="success" label={t('admin.integrations.googleSheets.connected')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.googleSheets.lastSync', { time: '2 hours ago' })}</span>
                    <Button variant="ghost" size="sm">{t('admin.integrations.googleSheets.configure')}</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📁</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>{t('admin.integrations.googleDrive.name')}</span>
                      <span className={styles.configDesc}>{t('admin.integrations.googleDrive.desc')}</span>
                    </div>
                    <StatusBadge variant="warning" label={t('admin.integrations.googleSheets.requiresSetup')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.googleDrive.watchNotConfigured')}</span>
                    <Button variant="secondary" size="sm">{t('admin.integrations.googleSheets.configure')}</Button>
                  </div>
                  <div className={styles.configDetails}>
                    <span>CV Folder: <code>/Recruitment/CVs/</code></span>
                    <span>JD Folder: <code>/Recruitment/JDs/</code></span>
                  </div>
                  <Notice variant="warning" title={t('admin.integrations.notices.bq005.title')}>
                    {t('admin.integrations.notices.bq005.body')}
                  </Notice>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📅</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>{t('admin.integrations.googleCalendar.name')}</span>
                      <span className={styles.configDesc}>{t('admin.integrations.googleCalendar.desc')}</span>
                    </div>
                    <StatusBadge variant="success" label={t('admin.integrations.googleSheets.connected')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.googleCalendar.calendarId', { id: 'hr-recruitment@company.com' })}</span>
                    <Button variant="ghost" size="sm">{t('admin.integrations.googleSheets.configure')}</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>📧</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>{t('admin.integrations.gmailApi.name')}</span>
                      <span className={styles.configDesc}>{t('admin.integrations.gmailApi.desc')}</span>
                    </div>
                    <StatusBadge variant="success" label={t('admin.integrations.googleSheets.connected')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.gmailApi.sendingFrom', { email: 'hr@company.com' })}</span>
                    <Button variant="ghost" size="sm">{t('admin.integrations.googleSheets.configure')}</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon}>🤖</span>
                    <div className={styles.configInfo}>
                      <span className={styles.configName}>{t('admin.integrations.geminiApi.name')}</span>
                      <span className={styles.configDesc}>{t('admin.integrations.geminiApi.desc')}</span>
                    </div>
                    <StatusBadge variant="warning" label={t('admin.integrations.geminiApi.degraded')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.geminiApi.errors', { count: 3 })}</span>
                    <Button variant="ghost" size="sm">{t('admin.integrations.geminiApi.viewLogs')}</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('admin.integrations.healthStatus.title')}
              description={t('admin.integrations.healthStatus.description')}
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
                        {t('admin.integrations.healthStatus.lastSync', { time: formatTime(integration.lastSync, locale) })}
                      </span>
                      {integration.errorCount > 0 && (
                        <span className={styles.healthErrors}>
                          {t('admin.integrations.healthStatus.errors', { count: integration.errorCount })}
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
              title={t('admin.api.title')}
              description={t('admin.api.description')}
            />
            <CardContent>
              <div className={styles.apiSettings}>
                <div className={styles.apiItem}>
                  <div className={styles.apiHeader}>
                    <h3>{t('admin.api.geminiApi')}</h3>
                    <StatusBadge variant="success" label={t('admin.api.active')} />
                  </div>
                  <div className={styles.apiForm}>
                    <div className={styles.formGroup}>
                      <label>{t('admin.api.apiKey')}</label>
                      <input type="password" value="••••••••••••••••" readOnly className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('admin.api.modelVersion')}</label>
                      <select className={styles.select}>
                        <option>gemini-pro-1.5</option>
                        <option>gemini-pro</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('admin.api.maxTokens')}</label>
                      <input type="number" value="8192" className={styles.input} />
                    </div>
                  </div>
                </div>

                <div className={styles.apiItem}>
                  <div className={styles.apiHeader}>
                    <h3>{t('admin.api.usageLimits.title')}</h3>
                  </div>
                  <div className={styles.usageLimits}>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>{t('admin.api.usageLimits.monthlyBudget')}</span>
                      <ProgressBar value={45} variant="info" showValue label="1.8M / 4M tokens" />
                    </div>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>{t('admin.api.usageLimits.monthlyCost')}</span>
                      <ProgressBar value={62} variant="warning" showValue label="$248 / $400 budget" />
                    </div>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>{t('admin.api.usageLimits.dailyLimit')}</span>
                      <ProgressBar value={28} variant="success" showValue label="840 / 3,000 requests" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('admin.api.dataRetention.title')}
              description={t('admin.api.dataRetention.description')}
            />
            <CardContent>
              <div className={styles.retentionSettings}>
                <div className={styles.retentionItem}>
                  <div className={styles.retentionInfo}>
                    <span className={styles.retentionLabel}>{t('admin.api.dataRetention.cvStorage')}</span>
                    <span className={styles.retentionDesc}>{t('admin.api.dataRetention.cvStorageDuration', { days: 90 })}</span>
                  </div>
                  <Button variant="ghost" size="sm">{t('admin.api.dataRetention.editPolicy')}</Button>
                </div>
                <div className={styles.retentionItem}>
                  <div className={styles.retentionInfo}>
                    <span className={styles.retentionLabel}>{t('admin.api.dataRetention.interviewTranscripts')}</span>
                    <span className={styles.retentionDesc}>{t('admin.api.dataRetention.interviewDuration', { years: 1 })}</span>
                  </div>
                  <Button variant="ghost" size="sm">{t('admin.api.dataRetention.editPolicy')}</Button>
                </div>
                <Notice variant="warning" title={t('admin.api.dataRetention.notice.title')}>
                  {t('admin.api.dataRetention.notice.body')}
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
                    <span className={styles.statLabel}>{t('admin.monitoring.stats.uptime')}</span>
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
                    <span className={styles.statLabel}>{t('admin.monitoring.stats.avgResponse')}</span>
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
                    <span className={styles.statLabel}>{t('admin.monitoring.stats.aiCalls')}</span>
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
                    <span className={styles.statLabel}>{t('admin.monitoring.stats.apiCostMtd')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader
              title={t('admin.monitoring.queue.title')}
              description={t('admin.monitoring.queue.description')}
            />
            <CardContent>
              <div className={styles.queueList}>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>{t('admin.monitoring.queue.cvScreening')}</span>
                    <span className={styles.queueStatus}>{t('admin.monitoring.queue.processingNormally')}</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>{t('admin.monitoring.queue.pending', { count: 12 })}</span>
                    <span>{t('admin.monitoring.queue.failed', { count: 0 })}</span>
                  </div>
                </div>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>{t('admin.monitoring.queue.emailQueue')}</span>
                    <span className={styles.queueStatus}>{t('admin.monitoring.queue.processingNormally')}</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>{t('admin.monitoring.queue.pending', { count: 3 })}</span>
                    <span>{t('admin.monitoring.queue.failed', { count: 0 })}</span>
                  </div>
                </div>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>{t('admin.monitoring.queue.aiProcessing')}</span>
                    <span className={styles.queueStatus}>1 stalled job detected</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>{t('admin.monitoring.queue.pending', { count: 5 })}</span>
                    <span className={styles.queueError}>1 {t('admin.monitoring.queue.stalled')}</span>
                  </div>
                </div>
                <Notice variant="warning" title={t('admin.monitoring.queueStall.title')}>
                  {t('admin.monitoring.queueStall.body')}
                </Notice>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('admin.monitoring.events.title')}
              description={t('admin.monitoring.events.description')}
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
                  <span className={styles.eventText}>{t('admin.monitoring.events.interviewReminderSent', { name: 'Sarah Chen' })}</span>
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