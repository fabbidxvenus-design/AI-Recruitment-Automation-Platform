'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDateTime, formatTime } from '@/lib/formatDate';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { mockIntegrationHealth, bqBlockers } from '@/lib/mockData';
import styles from './admin.module.css';

type AdminTab = 'integrations' | 'api' | 'monitoring';

const adminTabs: AdminTab[] = ['integrations', 'api', 'monitoring'];

export default function AdminPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('integrations');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'info' | 'warning'; title: string; body: string } | null>(null);
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);

  const bq002 = bqBlockers.find(b => b.code === 'BQ-002');
  const bq003 = bqBlockers.find(b => b.code === 'BQ-003');
  const bq005 = bqBlockers.find(b => b.code === 'BQ-005');

  const todayBase = new Date().toISOString().slice(0, 10);
  const mockEventLog = [
    { time: `${todayBase}T11:42:00`, icon: '🔐', eventKey: 'admin.monitoring.events.screeningApproved', eventParams: { count: 3 } },
    { time: `${todayBase}T11:38:00`, icon: '📧', eventKey: 'admin.monitoring.events.interviewReminderSent', eventParams: { name: t('common.role.hiringManager') } },
    { time: `${todayBase}T11:30:00`, icon: '✅', eventKey: 'admin.monitoring.events.cvScreeningCompleted', eventParams: { count: 5 } },
    { time: `${todayBase}T11:15:00`, icon: '⚠️', eventKey: 'admin.monitoring.events.aiRateLimitWarning', eventParams: {} },
    { time: `${todayBase}T10:45:00`, icon: '📁', eventKey: 'admin.monitoring.events.driveFileImported', eventParams: { file: 'candidates_batch_5.xlsx' } },
  ];

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, tab: AdminTab): void => {
    const currentIndex = adminTabs.indexOf(tab);
    const lastIndex = adminTabs.length - 1;
    const nextIndexByKey: Partial<Record<string, number>> = {
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextTab = adminTabs[nextIndex];
    setActiveTab(nextTab);
    document.getElementById(`tab-${nextTab}`)?.focus();
  };

  return (
    <main id="main-content" className={styles.adminPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.title')}</h1>
          <p className={styles.description}>
            {t('admin.description')}
          </p>
        </div>
      </div>

      {feedback && (
        <Notice variant={feedback.variant} title={feedback.title}>
          {feedback.body}
        </Notice>
      )}

      <div className={styles.blockersSection}>
        {bq002 && (
          <Notice variant="blocker" title={t('admin.integrations.notices.bq002.title')}>
            {t('admin.integrations.notices.bq002.body')}
          </Notice>
        )}
        {bq003 && (
          <Notice variant="blocker" title={t('admin.integrations.notices.bq003.title')}>
            {t('admin.integrations.notices.bq003.body')}
          </Notice>
        )}
        {bq005 && (
          <Notice variant="blocker" title={t('admin.integrations.notices.bq005.title')}>
            {t('admin.integrations.notices.bq005.body')}
          </Notice>
        )}
      </div>

      <div className={styles.tabs} role="tablist" aria-label={t('admin.tabs.ariaLabel')}>
        {adminTabs.map(tab => (
          <button
            key={tab}
            role="tab"
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => handleTabKeyDown(event, tab)}
            aria-selected={activeTab === tab}
            id={`tab-${tab}`}
            aria-controls={`panel-${tab}`}
            tabIndex={activeTab === tab ? 0 : -1}
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
                    <span className={styles.configIcon} role="img" aria-label={t('admin.monitoring.integrations.iconLabel', { name: t('admin.integrations.googleSheets.name') })}>📊</span>
                    <div className={styles.configInfo}>
                      <h3 className={styles.configName}>{t('admin.integrations.googleSheets.name')}</h3>
                      <span className={styles.configDesc}>{t('admin.integrations.googleSheets.desc')}</span>
                    </div>
                    <StatusBadge variant="success" label={t('admin.integrations.googleSheets.connected')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.googleSheets.lastSync', { time: t('dashboard.activity.twoHoursAgo') })}</span>
                    <Button variant="ghost" size="sm" aria-label={t('common.configureAria', { name: t('admin.integrations.googleSheets.name') })} onClick={() => setModal({ title: t('admin.integrations.actions.googleSheets.title'), body: t('admin.integrations.actions.googleSheets.body') })}>{t('common.configure')}</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon} role="img" aria-label={t('admin.monitoring.integrations.iconLabel', { name: t('admin.integrations.googleDrive.name') })}>📁</span>
                    <div className={styles.configInfo}>
                      <h3 className={styles.configName}>{t('admin.integrations.googleDrive.name')}</h3>
                      <span className={styles.configDesc}>{t('admin.integrations.googleDrive.desc')}</span>
                    </div>
                    <StatusBadge variant="warning" label={t('admin.integrations.googleSheets.requiresSetup')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.googleDrive.watchNotConfigured')}</span>
                    <Button variant="secondary" size="sm" aria-label={t('common.configureAria', { name: t('admin.integrations.googleDrive.name') })} onClick={() => setModal({ title: t('admin.integrations.actions.googleDrive.title'), body: t('admin.integrations.actions.googleDrive.body') })}>{t('common.configure')}</Button>
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.googleDrive.cvFolder')} {t('admin.integrations.googleDrive.cvFolderStatus')}</span>
                    <span>{t('admin.integrations.googleDrive.jdFolder')} {t('admin.integrations.googleDrive.jdFolderStatus')}</span>
                  </div>
                  <Notice variant="warning" title={t('admin.integrations.notices.bq005.title')}>
                    {t('admin.integrations.notices.bq005.body')}
                  </Notice>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon} role="img" aria-label={t('admin.monitoring.integrations.iconLabel', { name: t('admin.integrations.googleCalendar.name') })}>📅</span>
                    <div className={styles.configInfo}>
                      <h3 className={styles.configName}>{t('admin.integrations.googleCalendar.name')}</h3>
                      <span className={styles.configDesc}>{t('admin.integrations.googleCalendar.desc')}</span>
                    </div>
                    <StatusBadge variant="success" label={t('admin.integrations.googleSheets.connected')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.googleCalendar.calendarProfile')}</span>
                    <Button variant="ghost" size="sm" aria-label={t('common.configureAria', { name: t('admin.integrations.googleCalendar.name') })} onClick={() => setModal({ title: t('admin.integrations.actions.googleCalendar.title'), body: t('admin.integrations.actions.googleCalendar.body') })}>{t('common.configure')}</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon} role="img" aria-label={t('admin.monitoring.integrations.iconLabel', { name: t('admin.integrations.gmailApi.name') })}>📧</span>
                    <div className={styles.configInfo}>
                      <h3 className={styles.configName}>{t('admin.integrations.gmailApi.name')}</h3>
                      <span className={styles.configDesc}>{t('admin.integrations.gmailApi.desc')}</span>
                    </div>
                    <StatusBadge variant="success" label={t('admin.integrations.googleSheets.connected')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.gmailApi.senderProfile')}</span>
                    <Button variant="ghost" size="sm" aria-label={t('common.configureAria', { name: t('admin.integrations.gmailApi.name') })} onClick={() => setModal({ title: t('admin.integrations.actions.gmail.title'), body: t('admin.integrations.actions.gmail.body') })}>{t('common.configure')}</Button>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <span className={styles.configIcon} role="img" aria-label={t('admin.monitoring.integrations.iconLabel', { name: t('admin.integrations.geminiApi.name') })}>🤖</span>
                    <div className={styles.configInfo}>
                      <h3 className={styles.configName}>{t('admin.integrations.geminiApi.name')}</h3>
                      <span className={styles.configDesc}>{t('admin.integrations.geminiApi.desc')}</span>
                    </div>
                    <StatusBadge variant="warning" label={t('admin.integrations.geminiApi.degraded')} />
                  </div>
                  <div className={styles.configDetails}>
                    <span>{t('admin.integrations.geminiApi.errors', { count: 3 })}</span>
                    <Button variant="ghost" size="sm" aria-label={t('common.viewLogsAria')} onClick={() => setModal({ title: t('admin.integrations.actions.geminiLogs.title'), body: t('admin.integrations.actions.geminiLogs.body') })}>{t('admin.integrations.geminiApi.viewLogs')}</Button>
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
                      <span className={`${styles.healthDot} ${styles[integration.status]}`} aria-hidden="true" />
                      <span className={styles.healthName}>{integration.name}</span>
                      <span className="sr-only">{t(`dashboard.integration.status.${integration.status}`)}</span>
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
                      <label htmlFor="geminiApiKey">{t('admin.api.apiKey')}</label>
                      <input id="geminiApiKey" type="text" value={t('admin.api.credentialManaged')} readOnly className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="geminiModelVersion">{t('admin.api.modelVersion')}</label>
                      <select id="geminiModelVersion" className={styles.select}>
                        <option>{t('admin.api.modelOptions.standard')}</option>
                        <option>{t('admin.api.modelOptions.rapid')}</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="geminiMaxTokens">{t('admin.api.maxTokens')}</label>
                      <input id="geminiMaxTokens" type="number" defaultValue={8192} className={styles.input} />
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
                      <ProgressBar value={45} variant="info" showValue label={t('admin.api.usageLimits.tokensLabel')} />
                    </div>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>{t('admin.api.usageLimits.monthlyCost')}</span>
                      <ProgressBar value={62} variant="warning" showValue label={t('admin.api.usageLimits.costLabel')} />
                    </div>
                    <div className={styles.usageItem}>
                      <span className={styles.usageLabel}>{t('admin.api.usageLimits.dailyLimit')}</span>
                      <ProgressBar value={28} variant="success" showValue label={t('admin.api.usageLimits.requestsLabel')} />
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
                  <Button variant="ghost" size="sm" aria-label={t('common.editPolicyAria', { item: t('admin.api.dataRetention.cvStorage') })} onClick={() => setFeedback({ variant: 'info', title: t('admin.api.dataRetention.feedback.cvStorage.title'), body: t('admin.api.dataRetention.feedback.cvStorage.body') })}>{t('admin.api.dataRetention.editPolicy')}</Button>
                </div>
                <div className={styles.retentionItem}>
                  <div className={styles.retentionInfo}>
                    <span className={styles.retentionLabel}>{t('admin.api.dataRetention.interviewTranscripts')}</span>
                    <span className={styles.retentionDesc}>{t('admin.api.dataRetention.interviewDuration', { years: 1 })}</span>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={t('common.editPolicyAria', { item: t('admin.api.dataRetention.interviewTranscripts') })} onClick={() => setFeedback({ variant: 'info', title: t('admin.api.dataRetention.feedback.interviewTranscripts.title'), body: t('admin.api.dataRetention.feedback.interviewTranscripts.body') })}>{t('admin.api.dataRetention.editPolicy')}</Button>
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
                  <span className={styles.statIcon} role="img" aria-label={t('admin.monitoring.stats.iconLabel', { type: t('admin.monitoring.stats.uptime'), value: t('admin.monitoring.stats.uptimeValue') })}>📊</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{t('admin.monitoring.stats.uptimeValue')}</span>
                    <h3 className={styles.statLabel}>{t('admin.monitoring.stats.uptime')}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={styles.statCard}>
              <CardContent>
                <div className={styles.statContent}>
                  <span className={styles.statIcon} role="img" aria-label={t('admin.monitoring.stats.iconLabel', { type: t('admin.monitoring.stats.avgResponse'), value: t('admin.monitoring.stats.avgResponseValue') })}>⚡</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{t('admin.monitoring.stats.avgResponseValue')}</span>
                    <h3 className={styles.statLabel}>{t('admin.monitoring.stats.avgResponse')}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={styles.statCard}>
              <CardContent>
                <div className={styles.statContent}>
                  <span className={styles.statIcon} role="img" aria-label={t('admin.monitoring.stats.iconLabel', { type: t('admin.monitoring.stats.aiCalls'), value: t('admin.monitoring.stats.aiCallsValue') })}>🤖</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{t('admin.monitoring.stats.aiCallsValue')}</span>
                    <h3 className={styles.statLabel}>{t('admin.monitoring.stats.aiCalls')}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={styles.statCard}>
              <CardContent>
                <div className={styles.statContent}>
                  <span className={styles.statIcon} role="img" aria-label={t('admin.monitoring.stats.iconLabel', { type: t('admin.monitoring.stats.apiCostMtd'), value: t('admin.monitoring.stats.apiCostMtdValue') })}>💰</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{t('admin.monitoring.stats.apiCostMtdValue')}</span>
                    <h3 className={styles.statLabel}>{t('admin.monitoring.stats.apiCostMtd')}</h3>
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
                    <h4 className={styles.queueName}>{t('admin.monitoring.queue.cvScreening')}</h4>
                    <span className={styles.queueStatus}>{t('admin.monitoring.queue.processingNormally')}</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>{t('admin.monitoring.queue.pending', { count: 12 })}</span>
                    <span>{t('admin.monitoring.queue.failed', { count: 0 })}</span>
                  </div>
                </div>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <h4 className={styles.queueName}>{t('admin.monitoring.queue.emailQueue')}</h4>
                    <span className={styles.queueStatus}>{t('admin.monitoring.queue.processingNormally')}</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>{t('admin.monitoring.queue.pending', { count: 3 })}</span>
                    <span>{t('admin.monitoring.queue.failed', { count: 0 })}</span>
                  </div>
                </div>
                <div className={styles.queueItem}>
                  <div className={styles.queueInfo}>
                    <h4 className={styles.queueName}>{t('admin.monitoring.queue.aiProcessing')}</h4>
                    <span className={styles.queueStatus}>{t('admin.monitoring.queue.stalledDetected', { count: 1 })}</span>
                  </div>
                  <div className={styles.queueStats}>
                    <span>{t('admin.monitoring.queue.pending', { count: 5 })}</span>
                    <span className={styles.queueError}>{t('admin.monitoring.queue.stalledDetected', { count: 1 })}</span>
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
                {mockEventLog.map((event, idx) => (
                  <div key={idx} className={styles.eventItem}>
                    <span className={styles.eventTime}>{formatDateTime(event.time, locale)}</span>
                    <span className={styles.eventIcon} role="img" aria-label={t('admin.monitoring.events.iconLabel', { type: t(event.eventKey) })}>{event.icon}</span>
                    <h5 className={styles.eventText}>{t(event.eventKey, event.eventParams)}</h5>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.title ?? t('admin.modal.updatedTitle')}
      >
        <CardHeader title={t('admin.modal.updatedTitle')} description={t('admin.modal.description')} />
        <Notice variant="info" title={t('admin.modal.updatedTitle')}>
          {modal?.body}
        </Notice>
        <Button variant="primary" onClick={() => setModal(null)}>{t('common.close')}</Button>
      </Modal>
    </main>
  );
}