'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { markInterviewCompleted, resolveInterviewSessionForActivePlan } from '@/lib/assessmentWorkflowState';
import styles from './interview.module.css';

export const dynamic = 'force-dynamic';

export default function InterviewPage() {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConsent, setShowConsent] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'info' | 'warning'; title: string; body: string } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  const questionRef = useRef<HTMLHeadingElement>(null);

  const [session, setSession] = useState(() => resolveInterviewSessionForActivePlan());
  const currentQuestion = session.questions[currentQuestionIndex];
  const assessmentTraceability = session.assessmentTraceability;
  const progress = ((currentQuestionIndex + (answers[currentQuestion.id] ? 1 : 0)) / session.questions.length) * 100;

  // Check reduced motion preference - initialize with current value then subscribe for changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Focus on question heading when navigating
  useEffect(() => {
    if (interviewStarted && questionRef.current) {
      questionRef.current.focus();
    }
  }, [currentQuestionIndex, interviewStarted]);

  const handleStartInterview = () => {
    setShowConsent(false);
    setInterviewStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    markInterviewCompleted(session.id);
    setSession(prev => ({ ...prev, status: 'completed' }));
    setFeedback({
      variant: 'success',
      title: 'Interview submitted',
      body: 'AI analysis is queued and the recruiter workspace now shows this interview as completed.',
    });
  };

  const handleSaveProgress = () => {
    setFeedback({
      variant: 'info',
      title: 'Progress saved',
      body: `${Object.keys(answers).length} answer(s) have been saved.`,
    });
  };

  const handleContactHr = () => {
    setFeedback({
      variant: 'info',
      title: 'HR contact prepared',
      body: 'A support request has been submitted to hr@company.com.',
    });
  };

  const handleWithdraw = () => {
    setFeedback({
      variant: 'warning',
      title: 'Withdrawal drafted',
      body: 'The application withdrawal request has been submitted.',
    });
  };

  const renderAssessmentTraceability = () => {
    if (!assessmentTraceability) return null;

    return (
      <div className={styles.traceabilityPanel}>
        <h3>{t('portal.interview.traceability.title')}</h3>
        <dl className={styles.traceabilityGrid}>
          <div>
            <dt>{t('portal.interview.traceability.jobId')}</dt>
            <dd>{assessmentTraceability.jobId}</dd>
          </div>
          <div>
            <dt>{t('portal.interview.traceability.jdVersionId')}</dt>
            <dd>{assessmentTraceability.jdVersionId}</dd>
          </div>
          <div>
            <dt>{t('portal.interview.traceability.parsedCriteriaVersion')}</dt>
            <dd>{assessmentTraceability.parsedCriteriaVersion}</dd>
          </div>
          <div>
            <dt>{t('portal.interview.traceability.assessmentPlanId')}</dt>
            <dd>{assessmentTraceability.assessmentPlanId}</dd>
          </div>
          <div>
            <dt>{t('portal.interview.traceability.assessmentPlanVersionId')}</dt>
            <dd>{assessmentTraceability.assessmentPlanVersionId}</dd>
          </div>
          <div>
            <dt>{t('portal.interview.traceability.rubricVersionId')}</dt>
            <dd>{assessmentTraceability.rubricVersionId}</dd>
          </div>
          <div>
            <dt>{t('portal.interview.traceability.interviewQuestionSetVersionId')}</dt>
            <dd>{assessmentTraceability.interviewQuestionSetVersionId ?? t('common.notAvailable')}</dd>
          </div>
        </dl>
      </div>
    );
  };

  const timeRemaining = '68h 42m';

  if (isExpired) {
    return (
      <div className={styles.interviewPage}>
        <Card className={styles.expiredCard}>
          <CardContent>
            <div className={styles.expiredContent}>
              <span aria-hidden="true" className={styles.expiredIcon}>⏰</span>
              <h2>{t('portal.interview.expired.title')}</h2>
              <p>{t('portal.interview.expired.message')}</p>
              {feedback && (
                <Notice variant={feedback.variant} title={feedback.title}>
                  {feedback.body}
                </Notice>
              )}
              <div className={styles.expiredActions}>
                <Button variant="secondary" onClick={handleContactHr}>{t('portal.interview.expired.contactHR')}</Button>
                <Button variant="ghost" onClick={handleWithdraw}>{t('portal.interview.expired.withdraw')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConsent) {
    return (
      <div className={styles.interviewPage}>
        <div className={styles.consentContainer}>
          <Card>
            <CardHeader title={t('portal.interview.title')} description={t('portal.interview.description')} />
            <CardContent>
              <div className={styles.consentContent}>
                <div className={styles.consentSection}>
                  <h3>{t('portal.interview.aboutThisInterview')}</h3>
                  <p>{t('portal.interview.aboutThisInterviewBody')}</p>
                </div>

                <div className={styles.consentSection}>
                  <h3>{t('portal.interview.interviewFormat')}</h3>
                  <ul>
                    <li>{t('portal.interview.interviewFormatItems.item1')}</li>
                    <li>{t('portal.interview.interviewFormatItems.item2')}</li>
                    <li>{t('portal.interview.interviewFormatItems.item3')}</li>
                    <li>{t('portal.interview.interviewFormatItems.item4')}</li>
                  </ul>
                </div>

                <div className={styles.consentSection}>
                  <h3>{t('portal.interview.privacyNotice')}</h3>
                  <p>{t('portal.interview.privacyText')}</p>
                </div>

                <div className={styles.consentSection}>
                  <h3>{t('portal.interview.deadline')}</h3>
                  <div className={styles.deadlineDisplay}>
                    <span className={styles.deadlineIcon} aria-hidden="true">⏱️</span>
                    <span className={styles.deadlineValue}>{t('portal.interview.timeRemaining', { time: timeRemaining })}</span>
                    <span className={styles.deadlineDate}>{t('portal.interview.deadlineDate', { date: 'May 15, 2026 at 11:59 PM' })}</span>
                  </div>
                </div>

                <Notice variant="info" title={t('portal.interview.reminderTitle')}>
                  {t('portal.interview.reminderEmail')}
                </Notice>

                {feedback && (
                  <Notice variant={feedback.variant} title={feedback.title}>
                    {feedback.body}
                  </Notice>
                )}

                {renderAssessmentTraceability()}
              </div>
            </CardContent>
            <div className={styles.consentActions}>
              <Button variant="ghost" onClick={handleSaveProgress}>{t('portal.interview.actions.saveExit')}</Button>
              <Button variant="primary" onClick={handleStartInterview}>
                {t('portal.interview.actions.startInterview')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.interviewPage}>
      <div className={styles.interviewHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{t('portal.interview.inProgress.title')}</h1>
          <p className={styles.candidateName}>{t('portal.interview.inProgress.candidate')} {session.candidateName}</p>
        </div>
        <div className={styles.headerRight}>
          <div
            className={`${styles.deadline} ${!prefersReducedMotion ? styles.animate : ''}`}
            role="timer"
            aria-live={prefersReducedMotion ? 'off' : 'polite'}
            aria-label={`Time remaining: ${timeRemaining}`}
          >
            <span className={styles.deadlineIcon} aria-hidden="true">⏱️</span>
            <span>{t('portal.interview.inProgress.timeRemaining', { time: timeRemaining })}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSaveProgress}>
            {t('portal.interview.inProgress.saveProgress')}
          </Button>
        </div>
      </div>

      {feedback && (
        <Notice variant={feedback.variant} title={feedback.title}>
          {feedback.body}
        </Notice>
      )}

      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>{t('portal.interview.progress.label')}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} showValue={false} variant="info" />
        <span className={styles.questionCount}>
          {t('portal.interview.progress.questionCount', { current: currentQuestionIndex + 1, total: session.questions.length })}
        </span>
      </div>

      {renderAssessmentTraceability()}

      <Card className={styles.questionCard}>
        <CardContent>
          <div className={styles.questionHeader}>
            <span className={styles.questionCategory}>{currentQuestion.category}</span>
            <span className={`${styles.questionDifficulty} ${styles[currentQuestion.difficulty]}`}>
              {currentQuestion.difficulty}
            </span>
          </div>
          <h2
            ref={questionRef}
            className={styles.questionText}
            tabIndex={-1}
            aria-label={`Question ${currentQuestionIndex + 1}: ${currentQuestion.text}`}
          >
            {currentQuestion.text}
          </h2>
          <div className={styles.questionMeta}>
            <span>{t('portal.interview.question.suggestedTime', { minutes: currentQuestion.expectedDuration })}</span>
          </div>

          <div className={styles.answerSection}>
            <label htmlFor="answer" className={styles.answerLabel}>
              {t('portal.interview.answer.label')}
            </label>
            <textarea
              id="answer"
              className={styles.answerInput}
              rows={6}
              placeholder={t('portal.interview.answer.placeholder')}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              aria-describedby="answer-hint"
            />
            <span id="answer-hint" className="sr-only">
              Type your response to the current question. Your progress is automatically saved.
            </span>
            <div className={styles.answerMeta}>
              <span className={styles.charCount} aria-live="polite">
                {(answers[currentQuestion.id] || '').length} characters
              </span>
            </div>
          </div>

          {answers[currentQuestion.id] && session.responses.find(r => r.questionId === currentQuestion.id) && (
            <div className={styles.previousResponses}>
              <h4>{t('portal.interview.previousResponses')}</h4>
              {session.responses.slice(0, currentQuestionIndex).map((response, index) => {
                const question = session.questions[index];
                return (
                  <div key={response.questionId} className={styles.responseItem}>
                    <span className={styles.responseQuestion}>{question.text}</span>
                    <p className={styles.responseAnswer}>{response.answer}</p>
                    {response.aiFeedback && (
                      <div className={styles.aiFeedback}>
                        <span className={styles.feedbackLabel}>{t('portal.interview.aiFeedback')}</span>
                        {response.aiFeedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <div className={styles.questionNavigation}>
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            aria-label="Go to previous question"
          >
            {t('portal.interview.navigation.previous')}
          </Button>
          <div className={styles.questionDots} role="navigation" aria-label="Question navigation">
            {session.questions.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === currentQuestionIndex ? styles.active : ''} ${answers[session.questions[index].id] ? styles.completed : ''}`}
                aria-label={`Question ${index + 1}: ${index === currentQuestionIndex ? 'current' : answers[session.questions[index].id] ? 'completed' : 'not answered'}`}
              />
            ))}
          </div>
          {currentQuestionIndex < session.questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              aria-label="Go to next question"
            >
              {t('portal.interview.navigation.next')}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!answers[currentQuestion.id] || Object.keys(answers).length < session.questions.length}
              aria-label="Submit interview"
            >
              {t('portal.interview.navigation.submit')}
            </Button>
          )}
        </div>
      </Card>

      <div className={styles.tips}>
        <h4>{t('portal.interview.tips.title')}</h4>
        <ul>
          <li>{t('portal.interview.tips.tip1')}</li>
          <li>{t('portal.interview.tips.tip2')}</li>
          <li>{t('portal.interview.tips.tip3')}</li>
        </ul>
      </div>
    </div>
  );
}