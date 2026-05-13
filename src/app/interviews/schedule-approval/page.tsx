'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Notice } from '@/components/ui/Notice';
import { mockScheduleSlots } from '@/lib/mockData';
import styles from './schedule-approval.module.css';

export default function ScheduleApprovalPage() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  const pendingSlots = mockScheduleSlots.filter(s => s.status === 'pending');
  const selected = mockScheduleSlots.find(s => s.id === selectedSlot);

  const handleApprove = (slotId: string) => {
    alert(`Interview slot ${slotId} approved. Calendar event will be created.`);
  };

  const handleReject = (slotId: string) => {
    alert(`Interview slot ${slotId} rejected. Candidate will be notified.`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.schedulePage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Interview Schedule Approval</h1>
          <p className={styles.description}>
            Review and approve AI-suggested interview slots before calendar events are created
          </p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{pendingSlots.length}</span>
            <span className={styles.statLabel}>Pending Approval</span>
          </div>
        </div>
      </div>

      <Notice variant="info" title="Schedule Policy Notice">
        <strong>BQ-007 Unresolved:</strong> The Calendar reschedule/cancel policy after event creation is not yet confirmed.
        Manual intervention may be required for schedule changes. Do not assume automated cancellation behavior.
      </Notice>

      <div className={styles.mainContent}>
        <div className={styles.slotsList}>
          <Card>
            <CardHeader
              title="Suggested Slots"
              description={`${pendingSlots.length} interviews awaiting approval`}
            />
            <CardContent>
              <div className={styles.slotItems}>
                {pendingSlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`${styles.slotItem} ${selectedSlot === slot.id ? styles.selected : ''}`}
                    onClick={() => setSelectedSlot(slot.id)}
                  >
                    <div className={styles.slotHeader}>
                      <span className={styles.candidateName}>{slot.candidateName}</span>
                      <StatusBadge variant="warning" label="Pending" />
                    </div>
                    <div className={styles.slotDetails}>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon}>📋</span>
                        <span>{slot.interviewType}</span>
                      </div>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon}>👤</span>
                        <span>{slot.interviewerName}</span>
                      </div>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon}>📅</span>
                        <span>{formatDate(slot.scheduledAt)}</span>
                      </div>
                      <div className={styles.slotDetail}>
                        <span className={styles.detailIcon}>⏰</span>
                        <span>{formatTime(slot.scheduledAt)} ({slot.duration} min)</span>
                      </div>
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
                title={`Schedule: ${selected.candidateName}`}
                description={selected.interviewType}
              />
              <CardContent>
                <div className={styles.scheduleDetails}>
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Interview Details</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Candidate</span>
                        <span className={styles.detailValue}>{selected.candidateName}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Interviewer</span>
                        <span className={styles.detailValue}>{selected.interviewerName}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Type</span>
                        <span className={styles.detailValue}>{selected.interviewType}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Duration</span>
                        <span className={styles.detailValue}>{selected.duration} minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Date & Time</h3>
                    <div className={styles.dateTimeDisplay}>
                      <div className={styles.dateBox}>
                        <span className={styles.dayName}>
                          {new Date(selected.scheduledAt).toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span className={styles.dayNumber}>
                          {new Date(selected.scheduledAt).getDate()}
                        </span>
                        <span className={styles.monthYear}>
                          {new Date(selected.scheduledAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className={styles.timeBox}>
                        <span className={styles.time}>{formatTime(selected.scheduledAt)}</span>
                        <span className={styles.timezone}>Asia/Ho_Chi_Minh (UTC+7)</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Availability Check</h3>
                    <div className={styles.availabilityList}>
                      <div className={styles.availabilityItem}>
                        <span className={styles.availabilityIcon}>✓</span>
                        <span>Candidate confirmed availability</span>
                      </div>
                      <div className={styles.availabilityItem}>
                        <span className={styles.availabilityIcon}>✓</span>
                        <span>Interviewer free on Google Calendar</span>
                      </div>
                      <div className={styles.availabilityItem}>
                        <span className={styles.availabilityIcon}>✓</span>
                        <span>Within working hours (9:00 - 18:00)</span>
                      </div>
                    </div>
                  </div>

                  {showConflictWarning && (
                    <Notice variant="warning" title="Schedule Conflict Detected">
                      The interviewer has another meeting at 15:00. Buffer time of 30 minutes recommended.
                    </Notice>
                  )}

                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>What Happens on Approval</h3>
                    <ul className={styles.approvalSteps}>
                      <li>Google Calendar event will be created for all participants</li>
                      <li>Confirmation email will be sent to candidate and interviewer</li>
                      <li>Interview link (Google Meet) will be included in invitation</li>
                      <li>Reminder will be sent 24 hours before interview</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.conflictToggle}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={showConflictWarning}
                      onChange={(e) => setShowConflictWarning(e.target.checked)}
                    />
                    Show conflict warning (demo)
                  </label>
                </div>
              </CardContent>
              <div className={styles.actionButtons}>
                <Button variant="danger" onClick={() => handleReject(selected.id)}>
                  Reject & Request Alternative
                </Button>
                <Link href="/portal/interview/demo-token">
                  <Button variant="primary" onClick={() => handleApprove(selected.id)}>
                    Approve & Go to Interview Workspace
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📅</span>
                  <p>Select an interview slot to review and approve</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}