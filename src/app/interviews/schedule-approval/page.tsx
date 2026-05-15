'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n';
import { formatDate, formatTime } from '@/lib/formatDate';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Notice } from '@/components/ui/Notice';
import { mockScheduleSlots } from '@/lib/mockData';
import styles from './schedule-approval.module.css';

export default function ScheduleApprovalPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [slots, setSlots] = useState(mockScheduleSlots);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'info' | 'warning'; title: string; body: string } | null>(null);

  const pendingSlots = slots.filter(s => s.status === 'pending');
  const selected = slots.find(s => s.id === selectedSlot);

  const handleApprove = (slotId: string) => {
    const slot = slots.find(item => item.id === slotId);
    setSlots(prev => prev.map(item => (
      item.id === slotId ? { ...item, status: 'approved' } : item
    )));
    setFeedback({
      variant: 'success',
      title: t('interviews.scheduleApproval.feedback.approved.title'),
      body: t('interviews.scheduleApproval.feedback.approved.body', { name: slot?.candidateName ?? t('common.notAvailable') }),
    });
  };

  const handleReject = (slotId: string) => {
    const slot = slots.find(item => item.id === slotId);
    setSlots(prev => prev.map(item => (
      item.id === slotId ? { ...item, status: 'rejected' } : item
    )));
    setFeedback({
      variant: 'warning',
      title: t('interviews.scheduleApproval.feedback.alternativeRequested.title'),
      body: t('interviews.scheduleApproval.feedback.alternativeRequested.body', { name: slot?.candidateName ?? t('common.notAvailable') }),
    });
    setSelectedSlot(null);
  };

  const formatScheduleDate = (dateStr: string) => formatDate(dateStr, locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatScheduleTime = (dateStr: string) => formatTime(dateStr, locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getInterviewTypeLabel = (interviewType: string): string => {
    const interviewTypeKey = interviewType.split(' ')[0].toLowerCase();
    return t(`interviews.scheduleApproval.type.${interviewTypeKey}`);
  };

  return (
    <div className={styles.schedulePage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('interviews.scheduleApproval.title')}</h1>
          <p className={styles.description}>
            {t('interviews.scheduleApproval.description')}
          </p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{pendingSlots.length}</span>
            <span className={styles.statLabel}>{t('interviews.scheduleApproval.pendingApproval')}</span>
          </div>
        </div>
      </div>

      <Notice variant="info" title={t('interviews.scheduleApproval.notice.title')}>
        <strong>{t('interviews.scheduleApproval.notice.prefix')}</strong> {t('interviews.scheduleApproval.notice.body')}
      </Notice>

      {feedback && (
        <Notice variant={feedback.variant} title={feedback.title}>
          {feedback.body}
        </Notice>
      )}

      <div className={styles.mainContent}>
        <div className={styles.slotsList}>
          <Card>
            <CardHeader
              title={t('interviews.scheduleApproval.suggestedSlots.title')}
              description={t('interviews.scheduleApproval.suggestedSlots.description', { count: pendingSlots.length })}
            />
            <CardContent>
              <div className={styles.slotItems}>
                {pendingSlots.map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`${styles.slotItem} ${selectedSlot === slot.id ? styles.selected : ''}`}
                    onClick={() => setSelectedSlot(slot.id)}
                    aria-pressed={selectedSlot === slot.id}
                    aria-label={t('interviews.scheduleApproval.suggestedSlots.slotLabel', {
                      candidate: slot.candidateName,
                      type: getInterviewTypeLabel(slot.interviewType),
                      interviewer: slot.interviewerName,
                      date: formatScheduleDate(slot.scheduledAt),
                      time: formatScheduleTime(slot.scheduledAt),
                      duration: slot.duration,
                    })}
                  >
                    <div className={styles.slotHeader}>
                      <span className={styles.candidateName}>{slot.candidateName}</span>
                      <StatusBadge variant="warning" label={t('interviews.scheduleApproval.pending')} />
                    </div>
                    <div className={styles.slotDetails}>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon} aria-hidden="true">📋</span>
                        <span>{getInterviewTypeLabel(slot.interviewType)}</span>
                      </div>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon} aria-hidden="true">👤</span>
                        <span>{slot.interviewerName}</span>
                      </div>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon} aria-hidden="true">📅</span>
                        <span>{formatScheduleDate(slot.scheduledAt)}</span>
                      </div>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon} aria-hidden="true">⏰</span>
                        <span>{formatScheduleTime(slot.scheduledAt)} ({slot.duration} {t('interviews.scheduleApproval.suggestedSlots.minDuration')})</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.detailPanel}>
          {selected ? (
            <Card>
              <CardHeader
                title={t('interviews.scheduleApproval.detail.title', { name: selected.candidateName })}
                description={getInterviewTypeLabel(selected.interviewType)}
              />
              <CardContent>
                <div className={styles.scheduleDetails}>
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>{t('interviews.scheduleApproval.detail.interviewDetails')}</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{t('interviews.scheduleApproval.detail.candidate')}</span>
                        <span className={styles.detailValue}>{selected.candidateName}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{t('interviews.scheduleApproval.detail.interviewer')}</span>
                        <span className={styles.detailValue}>{selected.interviewerName}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{t('interviews.scheduleApproval.detail.type')}</span>
                        <span className={styles.detailValue}>{getInterviewTypeLabel(selected.interviewType)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>{t('interviews.scheduleApproval.detail.duration')}</span>
                        <span className={styles.detailValue}>{t('interviews.scheduleApproval.detail.durationMin', { min: selected.duration })}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>{t('interviews.scheduleApproval.detail.dateTime')}</h3>
                    <div className={styles.dateTimeDisplay}>
                      <div className={styles.dateBox}>
                        <span className={styles.dayName}>
                          {formatDate(selected.scheduledAt, locale, { weekday: 'long' })}
                        </span>
                        <span className={styles.dayNumber}>
                          {new Date(selected.scheduledAt).getDate()}
                        </span>
                        <span className={styles.monthYear}>
                          {formatDate(selected.scheduledAt, locale, { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className={styles.timeBox}>
                        <span className={styles.time}>{formatScheduleTime(selected.scheduledAt)}</span>
                        <span className={styles.timezone}>{t('interviews.scheduleApproval.timezone')}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>{t('interviews.scheduleApproval.detail.availability')}</h3>
                    <div className={styles.availabilityList}>
                      <div className={styles.availabilityItem}>
                        <span className={styles.availabilityIcon}>✓</span>
                        <span>{t('interviews.scheduleApproval.detail.candidateConfirmed')}</span>
                      </div>
                      <div className={styles.availabilityItem}>
                        <span className={styles.availabilityIcon}>✓</span>
                        <span>{t('interviews.scheduleApproval.detail.interviewerFree')}</span>
                      </div>
                      <div className={styles.availabilityItem}>
                        <span className={styles.availabilityIcon}>✓</span>
                        <span>{t('interviews.scheduleApproval.detail.withinWorkingHours')}</span>
                      </div>
                    </div>
                  </div>

                  {showConflictWarning && (
                    <Notice variant="warning" title={t('interviews.scheduleApproval.conflict.title')}>
                      {t('interviews.scheduleApproval.conflict.desc')}
                    </Notice>
                  )}

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>{t('interviews.scheduleApproval.approval.whatHappens')}</h3>
                    <ul className={styles.approvalSteps}>
                      <li>{t('interviews.scheduleApproval.approval.calendarCreated')}</li>
                      <li>{t('interviews.scheduleApproval.approval.emailSent')}</li>
                      <li>{t('interviews.scheduleApproval.approval.meetLink')}</li>
                      <li>{t('interviews.scheduleApproval.approval.reminderSent')}</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.conflictToggle}>
                  <input
                    id="show-conflict-warning"
                    type="checkbox"
                    checked={showConflictWarning}
                    onChange={(e) => setShowConflictWarning(e.target.checked)}
                  />
                  <label className={styles.toggleLabel} htmlFor="show-conflict-warning">
                    {t('interviews.scheduleApproval.conflict.showWarning')}
                  </label>
                </div>
              </CardContent>
              <div className={styles.actionButtons}>
                <Button variant="danger" onClick={() => handleReject(selected.id)}>
                  {t('interviews.scheduleApproval.actions.rejectAlternative')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleApprove(selected.id);
                    router.push('/portal/interview/access');
                  }}
                >
                  {t('interviews.scheduleApproval.actions.approveWorkspace')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon} aria-hidden="true">📅</span>
                  <p>{t('interviews.scheduleApproval.empty.selectToReview')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}