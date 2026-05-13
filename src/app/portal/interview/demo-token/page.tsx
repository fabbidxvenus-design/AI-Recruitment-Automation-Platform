'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockInterviewSessions } from '@/lib/mockData';
import styles from './interview.module.css';

export default function InterviewPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConsent, setShowConsent] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const questionRef = useRef<HTMLHeadingElement>(null);

  const session = mockInterviewSessions[0];
  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (answers[currentQuestion.id] ? 1 : 0)) / session.questions.length) * 100;

  // Check reduced motion preference - initialize with current value then subscribe for changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- MediaQueryList requires initial read + subscription pattern
    setPrefersReducedMotion(mediaQuery.matches);

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
    alert('Interview submitted! AI analysis will be available shortly.');
  };

  const handleSaveProgress = () => {
    alert('Progress saved. You can return later to complete the interview.');
  };

  const timeRemaining = '68h 42m';

  if (isExpired) {
    return (
      <div className={styles.interviewPage}>
        <Card className={styles.expiredCard}>
          <CardContent>
            <div className={styles.expiredContent}>
              <span aria-hidden="true" className={styles.expiredIcon}>⏰</span>
              <h2>Interview Link Expired</h2>
              <p>The deadline for this interview has passed. Please contact the HR team if you wish to continue.</p>
              <div className={styles.expiredActions}>
                <Button variant="secondary">Contact HR</Button>
                <Button variant="ghost">Withdraw Application</Button>
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
            <CardHeader title="AI Async Interview" description="Please review the instructions before starting" />
            <CardContent>
              <div className={styles.consentContent}>
                <div className={styles.consentSection}>
                  <h3>About This Interview</h3>
                  <p>
                    This is an asynchronous text-based interview. You will answer a series of questions
                    related to the position. Each question has a suggested time limit, but you have up to
                    the deadline to complete all responses.
                  </p>
                </div>

                <div className={styles.consentSection}>
                  <h3>Interview Format</h3>
                  <ul>
                    <li>Fixed questions presented sequentially</li>
                    <li>AI-generated follow-up questions based on your responses</li>
                    <li>Progress is automatically saved</li>
                    <li>You can return to complete within the deadline</li>
                  </ul>
                </div>

                <div className={styles.consentSection}>
                  <h3>Privacy Notice</h3>
                  <p>
                    Your responses will be analyzed using AI to generate an evaluation report.
                    Data is processed securely and only accessible to authorized HR personnel.
                    Personal information is handled according to our privacy policy.
                  </p>
                </div>

                <div className={styles.consentSection}>
                  <h3>Deadline</h3>
                  <div className={styles.deadlineDisplay}>
                    <span className={styles.deadlineIcon} aria-hidden="true">⏱️</span>
                    <span className={styles.deadlineValue}>{timeRemaining} remaining</span>
                    <span className={styles.deadlineDate}>Until May 15, 2024 at 11:59 PM</span>
                  </div>
                </div>

                <Notice variant="info" title="Reminder">
                  A reminder email will be sent if you have not completed the interview within 48 hours.
                </Notice>
              </div>
            </CardContent>
            <div className={styles.consentActions}>
              <Button variant="ghost">Save & Exit</Button>
              <Button variant="primary" onClick={handleStartInterview}>
                Start Interview
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
          <h1 className={styles.title}>AI Async Interview</h1>
          <p className={styles.candidateName}>Candidate: {session.candidateName}</p>
        </div>
        <div className={styles.headerRight}>
          <div
            className={`${styles.deadline} ${!prefersReducedMotion ? styles.animate : ''}`}
            role="timer"
            aria-live={prefersReducedMotion ? 'off' : 'polite'}
            aria-label={`Time remaining: ${timeRemaining}`}
          >
            <span className={styles.deadlineIcon} aria-hidden="true">⏱️</span>
            <span>{timeRemaining} remaining</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSaveProgress}>
            Save Progress
          </Button>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} showValue={false} variant="info" />
        <span className={styles.questionCount}>
          Question {currentQuestionIndex + 1} of {session.questions.length}
        </span>
      </div>

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
            <span>Suggested time: {currentQuestion.expectedDuration} minutes</span>
          </div>

          <div className={styles.answerSection}>
            <label htmlFor="answer" className={styles.answerLabel}>
              Your Answer
            </label>
            <textarea
              id="answer"
              className={styles.answerInput}
              rows={6}
              placeholder="Type your answer here..."
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
              <h4>Previous Responses</h4>
              {session.responses.slice(0, currentQuestionIndex).map((response, index) => {
                const question = session.questions[index];
                return (
                  <div key={response.questionId} className={styles.responseItem}>
                    <span className={styles.responseQuestion}>{question.text}</span>
                    <p className={styles.responseAnswer}>{response.answer}</p>
                    {response.aiFeedback && (
                      <div className={styles.aiFeedback}>
                        <span className={styles.feedbackLabel}>AI Feedback:</span>
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
            Previous
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
              Next Question
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!answers[currentQuestion.id] || Object.keys(answers).length < session.questions.length}
              aria-label="Submit interview"
            >
              Submit Interview
            </Button>
          )}
        </div>
      </Card>

      <div className={styles.tips}>
        <h4>Tips for Success</h4>
        <ul>
          <li>Be specific and provide examples when possible</li>
          <li>Take your time to structure your thoughts</li>
          <li>Your progress is automatically saved</li>
        </ul>
      </div>
    </div>
  );
}