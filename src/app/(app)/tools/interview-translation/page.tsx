'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useLanguage } from '@/i18n';
import { formatDateTime } from '@/lib/formatDate';
import { Card, Button, Notice, LoadingState, StatusBadge, ProgressBar } from '@/components';
import type { InterviewTranslation, LanguageCode } from '@/types';
import styles from './interview-translation.module.css';

type WorkflowStep = 'input' | 'generating' | 'review' | 'approved';

interface TranscriptSegment {
  speakerKey: 'interviewer' | 'candidate';
  original: string;
  translated: string;
}

interface InterviewOption {
  id: string;
  candidateName: string;
  date: string;
}

const mockInterviews: InterviewOption[] = [
  { id: 'int-001', candidateName: 'Nguyen Van A', date: '2026-05-10' },
  { id: 'int-002', candidateName: 'Tran Thi B', date: '2026-05-12' },
];

const languageCodes = ['vi', 'en', 'ja'] as const satisfies readonly LanguageCode[];

function isLanguageCode(value: string): value is LanguageCode {
  return languageCodes.includes(value as LanguageCode);
}

export default function InterviewTranslationPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('input');
  const [selectedInterview, setSelectedInterview] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [targetLang, setTargetLang] = useState<LanguageCode>('en');
  const [currentTranslation, setCurrentTranslation] = useState<InterviewTranslation | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string>('');
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleGenerate = async (): Promise<void> => {
    setCurrentStep('generating');
    setGenerationError('');
    setProgress(0);

    try {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (!isMountedRef.current) return;
      setProgress(100);

      const mockSegments: TranscriptSegment[] = [
      {
        speakerKey: 'interviewer',
        original: 'Xin chào, bạn có thể giới thiệu về bản thân không?',
        translated: 'Hello, can you introduce yourself?',
      },
      {
        speakerKey: 'candidate',
        original: 'Chào anh/chị. Tôi tên là Nguyen Van A, có 5 năm kinh nghiệm làm việc trong lĩnh vực phát triển phần mềm.',
        translated: 'Hello. My name is Nguyen Van A, I have 5 years of experience working in software development.',
      },
      {
        speakerKey: 'interviewer',
        original: 'Bạn có kinh nghiệm với React không?',
        translated: 'Do you have experience with React?',
      },
      {
        speakerKey: 'candidate',
        original: 'Có, tôi đã sử dụng React trong 3 năm qua cho nhiều dự án khác nhau.',
        translated: 'Yes, I have been using React for the past 3 years on various projects.',
      },
    ];

    const translation: InterviewTranslation = {
      id: `trans-${Date.now()}`,
      interviewId: selectedInterview || 'manual',
      candidateId: 'cand-001',
      sourceLang: 'vi',
      targetLang,
      translatedText: mockSegments.map((s) => `${t(`tools.interviewTranslation.speakers.${s.speakerKey}`)}: ${s.translated}`).join('\n'),
      status: 'pending',
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
    };

    if (!isMountedRef.current) return;
    setCurrentTranslation(translation);
    setSegments(mockSegments);
    setCurrentStep('review');
    } catch (error: unknown) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      console.error('[interview-translation] handleGenerate failed:', error);
      setGenerationError(t('tools.interviewTranslation.workspace.generationFailed'));
      setCurrentStep('input');
    }
  };

  const handleApprove = () => {
    if (!currentTranslation) return;

    setCurrentTranslation({
      ...currentTranslation,
      status: 'approved',
      approvedBy: 'hr.manager@company.com',
      approvedAt: new Date().toISOString(),
    });
    setCurrentStep('approved');
  };

  const handleReject = () => {
    setCurrentStep('input');
    setCurrentTranslation(null);
    setSegments([]);
  };

  const canGenerate = (selectedInterview || manualNotes.trim()) && targetLang;

  const handleTargetLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (isLanguageCode(value)) {
      setTargetLang(value);
    }
  };
  const currentTranslationStatusLabel = currentTranslation ? t(`common.status.${currentTranslation.status}`) : '';

  return (
    <main id="main-content" className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/tools" className={styles.backLink}>
            ← {t('tools.hub.title')}
          </Link>
        </div>
        <h1 className={styles.title}>{t('tools.interviewTranslation.title')}</h1>
        <p className={styles.description}>
          {t('tools.interviewTranslation.description')}
        </p>
      </header>

      <Notice variant="info" title={t('tools.interviewTranslation.workspace.approvalRequired')}>
        {t('tools.interviewTranslation.workspace.approvalRequiredDesc')}
      </Notice>

      {generationError && (
        <Notice variant="danger" title={t('common.error.title')}>
          {generationError}
        </Notice>
      )}

      {currentStep === 'input' && (
        <Card className={styles.inputCard}>
          <h2 className={styles.sectionTitle}>{t('tools.interviewTranslation.steps.input')}</h2>

          <div className={styles.formGroup}>
            <label htmlFor="selectInterview">{t('tools.interviewTranslation.selectInterview')}</label>
            <select
              id="selectInterview"
              value={selectedInterview}
              onChange={(e) => {
                setSelectedInterview(e.target.value);
                if (e.target.value) setManualNotes('');
              }}
              className={styles.select}
            >
              <option value="">-- {t('tools.interviewTranslation.selectInterview')} --</option>
              {mockInterviews.map((interview) => (
                <option key={interview.id} value={interview.id}>
                  {interview.candidateName} - {interview.date}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.divider}>
            <span>{t('common.or')}</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="manualNotes">{t('tools.interviewTranslation.pasteNotes')}</label>
            <textarea
              id="manualNotes"
              value={manualNotes}
              onChange={(e) => {
                setManualNotes(e.target.value);
                if (e.target.value) setSelectedInterview('');
              }}
              placeholder={t('tools.interviewTranslation.pasteNotesPlaceholder')}
              className={styles.textarea}
              rows={8}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="targetLang">{t('tools.interviewTranslation.selectLanguage')}</label>
            <select
              id="targetLang"
              value={targetLang}
              onChange={handleTargetLangChange}
              className={styles.select}
            >
              <option value="vi">{t('tools.interviewTranslation.languages.vi')}</option>
              <option value="en">{t('tools.interviewTranslation.languages.en')}</option>
              <option value="ja">{t('tools.interviewTranslation.languages.ja')}</option>
            </select>
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary"
              aria-label={t('common.generateAria')}
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {t('tools.interviewTranslation.generate')}
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 'generating' && (
        <Card className={styles.generatingCard}>
          <LoadingState text={t('tools.interviewTranslation.generating')} />
          <ProgressBar value={progress} />
        </Card>
      )}

      {(currentStep === 'review' || currentStep === 'approved') && currentTranslation && (
        <div className={styles.workspace}>
          <div className={styles.workflowStepper}>
            <div className={`${styles.step} ${styles.stepComplete}`}>
              <span className={styles.stepLabel}>{t('tools.interviewTranslation.steps.input')}</span>
            </div>
            <div className={`${styles.step} ${currentStep === 'review' ? styles.stepActive : currentStep === 'approved' ? styles.stepComplete : styles.stepPending}`}>
              <span className={styles.stepLabel}>{t('tools.interviewTranslation.steps.review')}</span>
            </div>
            <div className={`${styles.step} ${currentStep === 'approved' ? styles.stepComplete : styles.stepPending}`}>
              <span className={styles.stepLabel}>{t('common.status.approved')}</span>
            </div>
          </div>
          <div className={styles.statusPanel}>
            <h2 className={styles.sectionTitle}>{t('tools.interviewTranslation.workspace.status')}</h2>
            <StatusBadge
              label={currentTranslationStatusLabel}
              variant={currentTranslation.status === 'approved' ? 'success' : 'warning'}
            />

            {currentTranslation.status === 'approved' && (
              <Notice variant="success" title={t('common.status.approved')}>
                {t('tools.interviewTranslation.approvedBy')}: {currentTranslation.approvedBy}
              </Notice>
            )}

            <Card className={styles.provenanceCard}>
              <h3>{t('tools.interviewTranslation.provenance.title')}</h3>
              <div className={styles.provenanceMeta}>
                <span>{t('tools.interviewTranslation.provenance.model')}: {t('tools.interviewTranslation.provenance.reviewEngine')}</span>
                <span>{t('tools.interviewTranslation.provenance.confidence')}: {t('tools.interviewTranslation.provenance.confidenceValue')}</span>
                <span>{t('tools.interviewTranslation.provenance.timestamp')}: {formatDateTime(currentTranslation.createdAt, locale)}</span>
              </div>
            </Card>
          </div>

          <div className={styles.transcriptPanel}>
            <h2 className={styles.sectionTitle}>{t('tools.interviewTranslation.workspace.transcript')}</h2>

            <div className={styles.segmentList} role="list">
              {segments.map((segment, index) => (
                <div key={`segment-${segment.speakerKey}-${segment.original}-${index}`} className={styles.segment} role="listitem">
                  <div className={styles.segmentHeader}>
                    <strong>{t(`tools.interviewTranslation.speakers.${segment.speakerKey}`)}</strong>
                  </div>
                  <div className={styles.segmentContent}>
                    <div className={styles.segmentOriginal}>
                      <span className={styles.segmentLabel}>{t('tools.interviewTranslation.original')}:</span>
                      <p>{segment.original}</p>
                    </div>
                    <div className={styles.segmentTranslated}>
                      <span className={styles.segmentLabel}>{t('tools.interviewTranslation.translated')}:</span>
                      <p>{segment.translated}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentStep === 'review' && (
              <div className={styles.actions}>
                <Button variant="secondary" aria-label={t('common.rejectAria')} onClick={handleReject}>
                  {t('tools.interviewTranslation.reject')}
                </Button>
                <Button variant="primary" aria-label={t('common.approveAria')} onClick={handleApprove}>
                  {t('tools.interviewTranslation.approve')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
