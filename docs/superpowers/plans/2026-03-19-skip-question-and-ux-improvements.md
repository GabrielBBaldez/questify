# Skip Question + UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add skip question feature and improve UX (progress indicator dots, confetti reduced-motion, mobile touch targets).

**Architecture:** Feature uses `"__SKIPPED__"` sentinel value in the existing `answers` record. UX improvements are independent CSS/component changes. All changes follow existing CSS module patterns and React component conventions.

**Tech Stack:** React 19, TypeScript, CSS Modules, lucide-react icons

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/constants/quiz.ts` | Create | SKIPPED_ANSWER constant |
| `src/types/quiz.ts` | Modify | Add skippedCount to QuizResult |
| `src/pages/QuizPlayer/QuizPlayerPage.tsx` | Modify | handleSkip, scoring logic |
| `src/components/QuestionDisplay/QuestionDisplay.tsx` | Modify | Skip button, state logic |
| `src/components/QuestionDisplay/QuestionDisplay.module.css` | Modify | Skip button styles |
| `src/components/ProgressBar/ProgressBar.tsx` | Modify | Question dot indicators |
| `src/components/ProgressBar/ProgressBar.module.css` | Modify | Dot indicator styles |
| `src/components/ResultsSummary/ResultsSummary.tsx` | Modify | Skipped stat, adjusted score |
| `src/components/ResultsSummary/ResultsSummary.module.css` | Modify | Skipped stat color |
| `src/components/QuestionReview/QuestionReview.tsx` | Modify | Skipped badge |
| `src/components/QuestionReview/QuestionReview.module.css` | Modify | Badge skipped style |
| `src/pages/Results/ResultsPage.tsx` | Modify | isPerfect logic |
| `src/pages/History/HistoryPage.tsx` | Modify | Score display with skipped |
| `src/components/Confetti/Confetti.module.css` | Modify | prefers-reduced-motion |
| `src/styles/global.css` | Modify | Mobile touch target min size |

---

## Task 1: Constants and Types

**Files:**
- Create: `src/constants/quiz.ts`
- Modify: `src/types/quiz.ts`

- [ ] **Step 1: Create SKIPPED_ANSWER constant**

```typescript
// src/constants/quiz.ts
export const SKIPPED_ANSWER = '__SKIPPED__';
```

- [ ] **Step 2: Add skippedCount to QuizResult**

In `src/types/quiz.ts`, add `skippedCount?: number` to the `QuizResult` interface (after `correctCount`):

```typescript
export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  mode: QuizMode;
  answers: Record<string, string>;
  correctCount: number;
  skippedCount?: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/constants/quiz.ts src/types/quiz.ts
git commit -m "feat: add SKIPPED_ANSWER constant and skippedCount to QuizResult"
```

---

## Task 2: QuizPlayerPage — Skip handler and scoring

**Files:**
- Modify: `src/pages/QuizPlayer/QuizPlayerPage.tsx`

- [ ] **Step 1: Add import for SKIPPED_ANSWER**

Add at top of file:

```typescript
import { SKIPPED_ANSWER } from '../../constants/quiz';
```

- [ ] **Step 2: Add handleSkip function**

After `handlePrev` (line 109), add:

```typescript
  const handleSkip = () => {
    const qId = preparedQuestions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [qId]: SKIPPED_ANSWER }));
    if (currentIndex < preparedQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };
```

- [ ] **Step 3: Update handleFinish scoring logic**

Replace the `handleFinish` function body (lines 112-136) with:

```typescript
  const handleFinish = () => {
    stop();

    let correctCount = 0;
    let skippedCount = 0;
    preparedQuestions.forEach((q) => {
      if (answers[q.id] === SKIPPED_ANSWER) {
        skippedCount++;
      } else if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const answeredCount = preparedQuestions.length - skippedCount;

    const result: QuizResult = {
      id: generateId(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      mode: settings.mode,
      answers,
      correctCount,
      skippedCount,
      totalQuestions: preparedQuestions.length,
      percentage: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
      timeTakenSeconds: seconds,
      completedAt: new Date().toISOString(),
    };

    navigate('/results', { state: { result, questions: preparedQuestions } });
  };
```

- [ ] **Step 4: Pass onSkip and answers to QuestionDisplay**

Update the `<QuestionDisplay>` JSX (around line 162) to include the new props:

```tsx
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedAnswer={answers[currentQuestion.id] || null}
            mode={settings.mode}
            onSelectAnswer={handleSelectAnswer}
            onSkip={handleSkip}
            onPrev={handlePrev}
            onNext={handleNext}
            onFinish={handleFinish}
            canGoPrev={canGoPrev}
            isLast={currentIndex === preparedQuestions.length - 1}
          />
```

- [ ] **Step 5: Pass answers to ProgressBar**

Update the `<ProgressBar>` JSX to include answers for dot indicators:

```tsx
          <ProgressBar
            current={currentIndex}
            total={preparedQuestions.length}
            seconds={seconds}
            answers={answers}
            questions={preparedQuestions}
          />
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/QuizPlayer/QuizPlayerPage.tsx
git commit -m "feat: add skip handler and updated scoring in QuizPlayerPage"
```

---

## Task 3: QuestionDisplay — Skip button and state logic

**Files:**
- Modify: `src/components/QuestionDisplay/QuestionDisplay.tsx`
- Modify: `src/components/QuestionDisplay/QuestionDisplay.module.css`

- [ ] **Step 1: Update QuestionDisplay component**

Replace the entire `QuestionDisplay.tsx` with:

```typescript
import { ChevronLeft, ChevronRight, CheckCircle, SkipForward } from 'lucide-react';
import type { Question, QuizMode } from '../../types/quiz';
import { SKIPPED_ANSWER } from '../../constants/quiz';
import { AlternativeButton } from '../AlternativeButton/AlternativeButton';
import styles from './QuestionDisplay.module.css';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: string | null;
  mode: QuizMode;
  onSelectAnswer: (altId: string) => void;
  onSkip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  canGoPrev: boolean;
  isLast: boolean;
}

export function QuestionDisplay({
  question,
  questionNumber,
  selectedAnswer,
  mode,
  onSelectAnswer,
  onSkip,
  onPrev,
  onNext,
  onFinish,
  canGoPrev,
  isLast,
}: QuestionDisplayProps) {
  const isSkipped = selectedAnswer === SKIPPED_ANSWER;
  const hasAnswered = selectedAnswer !== null && !isSkipped;
  const showFeedback = mode !== 'simulado' && hasAnswered;
  const showExplanation = mode === 'revisao' && hasAnswered;
  const isDisabled = mode !== 'simulado' && (hasAnswered || isSkipped);
  const isCorrect = hasAnswered && selectedAnswer === question.correctAnswer;
  const canSkip = !hasAnswered;

  return (
    <div className={styles.container}>
      <p className={styles.questionText}>
        <strong>Questão {questionNumber}.</strong> {question.text}
      </p>

      {question.image && (
        <img src={question.image} alt="Imagem da questão" className={styles.questionImage} />
      )}

      {question.type === 'assertion' && 'assertions' in question && (
        <div className={styles.assertionsList}>
          {(question as any).assertions.map((a: any) => (
            <div className={styles.assertionItem} key={a.id}>
              <span className={styles.assertionId}>{a.id}.</span>
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.alternatives}>
        {question.alternatives.map((alt) => (
          <AlternativeButton
            key={alt.id}
            alternative={alt}
            isSelected={!isSkipped && selectedAnswer === alt.id}
            isCorrect={alt.id === question.correctAnswer}
            showFeedback={showFeedback}
            showExplanation={showExplanation}
            disabled={isDisabled}
            onClick={() => onSelectAnswer(alt.id)}
          />
        ))}
      </div>

      {showFeedback && (
        <div className={isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}>
          {isCorrect ? 'Resposta correta!' : `Resposta errada. A correta era: ${question.correctAnswer}`}
        </div>
      )}

      {showExplanation && question.explanation && (
        <div className={styles.explanationBox}>
          {question.explanation}
        </div>
      )}

      <div className={styles.navigation}>
        <button
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={onPrev}
          disabled={!canGoPrev}
        >
          <ChevronLeft size={18} />
          Anterior
        </button>

        <button
          className={`${styles.navBtn} ${isSkipped ? styles.skipBtnActive : styles.skipBtn}`}
          onClick={onSkip}
          disabled={!canSkip}
          aria-label="Pular questão"
        >
          <SkipForward size={18} />
          {isSkipped ? 'Pulada' : 'Pular'}
        </button>

        {isLast ? (
          <button className={`${styles.navBtn} ${styles.finishBtn}`} onClick={onFinish}>
            <CheckCircle size={18} />
            Finalizar
          </button>
        ) : (
          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={onNext}>
            Próxima
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add skip button CSS styles**

Append to `QuestionDisplay.module.css` after `.explanationBox` (after line 131):

```css
.skipBtn {
  background-color: var(--color-bg-hover);
  color: var(--color-text-secondary);
}

.skipBtn:hover:not(:disabled) {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.skipBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skipBtnActive {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.skipBtnActive:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/QuestionDisplay/QuestionDisplay.tsx src/components/QuestionDisplay/QuestionDisplay.module.css
git commit -m "feat: add skip button to QuestionDisplay with proper state logic"
```

---

## Task 4: ProgressBar — Question dot indicators

**Files:**
- Modify: `src/components/ProgressBar/ProgressBar.tsx`
- Modify: `src/components/ProgressBar/ProgressBar.module.css`

- [ ] **Step 1: Update ProgressBar component**

Replace `ProgressBar.tsx` with:

```typescript
import { SKIPPED_ANSWER } from '../../constants/quiz';
import { formatTime } from '../../utils/formatTime';
import type { Question } from '../../types/quiz';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  seconds: number;
  answers?: Record<string, string>;
  questions?: Question[];
}

export function ProgressBar({ current, total, seconds, answers, questions }: ProgressBarProps) {
  return (
    <div className={styles.container}>
      <span className={styles.info}>{current + 1} / {total}</span>
      {questions && answers ? (
        <div className={styles.dots}>
          {questions.map((q, i) => {
            let dotClass = styles.dot;
            if (i === current) {
              dotClass += ` ${styles.dotCurrent}`;
            } else if (answers[q.id] === SKIPPED_ANSWER) {
              dotClass += ` ${styles.dotSkipped}`;
            } else if (answers[q.id]) {
              dotClass += ` ${styles.dotAnswered}`;
            }
            return (
              <div key={q.id} className={dotClass} title={`Questão ${i + 1}`} />
            );
          })}
        </div>
      ) : (
        <div className={styles.barWrapper}>
          <div className={styles.bar} style={{ width: `${((current + 1) / total) * 100}%` }} />
        </div>
      )}
      <span className={styles.timer}>{formatTime(seconds)}</span>
    </div>
  );
}
```

- [ ] **Step 2: Add dot indicator CSS**

Append to `ProgressBar.module.css` after `.timer` (after line 34):

```css
.dots {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-bg-hover);
  border: 2px solid var(--color-border);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.dotCurrent {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  transform: scale(1.3);
}

.dotAnswered {
  background-color: var(--color-accent-light);
  border-color: var(--color-accent);
}

.dotSkipped {
  background-color: var(--color-warning-light);
  border-color: var(--color-warning);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProgressBar/ProgressBar.tsx src/components/ProgressBar/ProgressBar.module.css
git commit -m "feat: add question dot indicators to ProgressBar"
```

---

## Task 5: ResultsSummary — Skipped count stat

**Files:**
- Modify: `src/components/ResultsSummary/ResultsSummary.tsx`
- Modify: `src/components/ResultsSummary/ResultsSummary.module.css`

- [ ] **Step 1: Update ResultsSummary component**

Replace `ResultsSummary.tsx` with:

```typescript
import { Trophy, Zap } from 'lucide-react';
import type { QuizResult } from '../../types/quiz';
import { formatTime } from '../../utils/formatTime';
import { Confetti } from '../Confetti/Confetti';
import styles from './ResultsSummary.module.css';

interface TimeRecord {
  isNew: boolean;
  previousBest: number;
}

interface ResultsSummaryProps {
  result: QuizResult;
  isPerfect?: boolean;
  timeRecord?: TimeRecord | null;
}

const MODE_NAMES: Record<string, string> = {
  simulado: 'Simulado',
  estudo: 'Estudo',
  revisao: 'Revisão',
};

export function ResultsSummary({ result, isPerfect, timeRecord }: ResultsSummaryProps) {
  const skippedCount = result.skippedCount ?? 0;
  const answeredCount = result.totalQuestions - skippedCount;
  const wrongCount = answeredCount - result.correctCount;

  const scoreClass =
    result.percentage >= 70
      ? styles.scoreGood
      : result.percentage >= 40
        ? styles.scoreMedium
        : styles.scoreBad;

  return (
    <div className={styles.container}>
      {isPerfect && <Confetti />}
      <h2 className={styles.title}>Resultado</h2>
      <span className={styles.modeBadge}>{MODE_NAMES[result.mode] || result.mode}</span>
      <div className={`${styles.score} ${scoreClass}`}>
        {result.correctCount} / {answeredCount}
      </div>
      <div className={`${styles.percentage} ${scoreClass}`}>
        {result.percentage}%
      </div>

      {isPerfect && (
        <div className={styles.perfectBadge}>
          <Trophy size={18} />
          Perfeito! 100% de acertos!
        </div>
      )}

      {timeRecord?.isNew && (
        <div className={styles.recordBadge}>
          <Zap size={18} />
          Novo recorde! {formatTime(result.timeTakenSeconds)} (anterior: {formatTime(timeRecord.previousBest)})
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatTime(result.timeTakenSeconds)}</span>
          <span className={styles.statLabel}>Tempo</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.statCorrect}`}>{result.correctCount}</span>
          <span className={styles.statLabel}>Acertos</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.statWrong}`}>{wrongCount}</span>
          <span className={styles.statLabel}>Erros</span>
        </div>
        {skippedCount > 0 && (
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.statSkipped}`}>{skippedCount}</span>
            <span className={styles.statLabel}>Puladas</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add stat color styles**

Append to `ResultsSummary.module.css` after the `@keyframes badgeAppear` block (after line 113):

```css
.statCorrect {
  color: var(--color-success);
}

.statWrong {
  color: var(--color-danger);
}

.statSkipped {
  color: var(--color-warning);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultsSummary/ResultsSummary.tsx src/components/ResultsSummary/ResultsSummary.module.css
git commit -m "feat: show skipped count and adjusted score in ResultsSummary"
```

---

## Task 6: QuestionReview — Skipped badge

**Files:**
- Modify: `src/components/QuestionReview/QuestionReview.tsx`
- Modify: `src/components/QuestionReview/QuestionReview.module.css`

- [ ] **Step 1: Update QuestionReview component**

Replace `QuestionReview.tsx` with:

```typescript
import { useState } from 'react';
import { ChevronDown, Check, X, SkipForward } from 'lucide-react';
import type { Question } from '../../types/quiz';
import { SKIPPED_ANSWER } from '../../constants/quiz';
import styles from './QuestionReview.module.css';

interface QuestionReviewProps {
  question: Question;
  questionNumber: number;
  userAnswer: string | undefined;
}

export function QuestionReview({ question, questionNumber, userAnswer }: QuestionReviewProps) {
  const [open, setOpen] = useState(false);
  const isSkipped = userAnswer === SKIPPED_ANSWER;
  const isUnanswered = userAnswer === undefined;
  const isCorrect = !isSkipped && !isUnanswered && userAnswer === question.correctAnswer;

  const getBadge = () => {
    if (isSkipped) {
      return (
        <span className={`${styles.badge} ${styles.badgeSkipped}`}>
          <SkipForward size={12} /> Pulada
        </span>
      );
    }
    if (isUnanswered) {
      return (
        <span className={`${styles.badge} ${styles.badgeSkipped}`}>
          Não respondida
        </span>
      );
    }
    if (isCorrect) {
      return (
        <span className={`${styles.badge} ${styles.badgeCorrect}`}>
          <Check size={12} /> Correta
        </span>
      );
    }
    return (
      <span className={`${styles.badge} ${styles.badgeWrong}`}>
        <X size={12} /> Errada
      </span>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => setOpen(!open)}>
        <div className={styles.headerLeft}>
          <span className={styles.questionNum}>Questão {questionNumber}</span>
          {getBadge()}
        </div>
        <ChevronDown size={18} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </div>

      {open && (
        <div className={styles.body}>
          <p className={styles.questionText}>{question.text}</p>

          {question.image && (
            <img src={question.image} alt="Imagem da questão" className={styles.questionImage} />
          )}

          <div className={styles.altList}>
            {question.alternatives.map((alt) => {
              let altClass = styles.altNeutral;
              if (alt.id === question.correctAnswer) {
                altClass = styles.altCorrect;
              } else if (!isSkipped && !isUnanswered && alt.id === userAnswer && !isCorrect) {
                altClass = styles.altWrong;
              }

              return (
                <div key={alt.id}>
                  <div className={`${styles.altItem} ${altClass}`}>
                    <span className={styles.altLetter}>{alt.id})</span>
                    <span>{alt.text}</span>
                    {alt.id === question.correctAnswer && <Check size={14} />}
                    {!isSkipped && !isUnanswered && alt.id === userAnswer && !isCorrect && <X size={14} />}
                  </div>
                  {alt.explanation && (
                    <div className={styles.altExplanation}>{alt.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {question.explanation && (
            <div className={styles.explanation}>
              <div className={styles.explanationLabel}>Explicação:</div>
              {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add badgeSkipped CSS**

Append to `QuestionReview.module.css` after `.badgeWrong` (after line 51):

```css
.badgeSkipped {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/QuestionReview/QuestionReview.tsx src/components/QuestionReview/QuestionReview.module.css
git commit -m "feat: add skipped and unanswered badges to QuestionReview"
```

---

## Task 7: ResultsPage — Fix isPerfect logic

**Files:**
- Modify: `src/pages/Results/ResultsPage.tsx`

- [ ] **Step 1: Update isPerfect calculation**

In `ResultsPage.tsx`, change line 28 from:

```typescript
  const isPerfect = state?.result?.percentage === 100;
```

to:

```typescript
  const isPerfect = state?.result?.percentage === 100 && (state?.result?.skippedCount ?? 0) === 0;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Results/ResultsPage.tsx
git commit -m "fix: isPerfect requires no skipped questions"
```

---

## Task 8: HistoryPage — Show skipped count in results

**Files:**
- Modify: `src/pages/History/HistoryPage.tsx`

- [ ] **Step 1: Update score display**

In `HistoryPage.tsx`, replace line 180:

```tsx
                    <span>{r.correctCount}/{r.totalQuestions} acertos</span>
```

with:

```tsx
                    <span>
                      {r.correctCount}/{r.totalQuestions - (r.skippedCount ?? 0)} acertos
                      {(r.skippedCount ?? 0) > 0 && ` (${r.skippedCount} puladas)`}
                    </span>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/History/HistoryPage.tsx
git commit -m "feat: show answered count and skipped indicator in history"
```

---

## Task 9: UX Fix — Confetti respects prefers-reduced-motion

**Files:**
- Modify: `src/components/Confetti/Confetti.module.css`

- [ ] **Step 1: Add reduced-motion media query**

Append to `Confetti.module.css` after the `@keyframes` block (after line 33):

```css
@media (prefers-reduced-motion: reduce) {
  .piece {
    animation: none;
    display: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Confetti/Confetti.module.css
git commit -m "fix: respect prefers-reduced-motion for confetti animation"
```

---

## Task 10: UX Fix — Mobile touch targets

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add minimum touch target size**

Append to the end of `global.css`:

```css
@media (pointer: coarse) {
  button,
  a,
  select,
  [role="button"] {
    min-height: 44px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "fix: ensure 44px minimum touch target on mobile devices"
```

---

## Task 11: Verify and final commit

- [ ] **Step 1: Run dev server to verify**

```bash
cd C:\Users\Baldez\Desktop\questify && npm run dev
```

Open browser and test:
1. Start a quiz in simulado mode
2. Click "Pular" on a question — verify it advances and shows dot as yellow
3. Go back and answer the skipped question — verify skip is replaced
4. Finish quiz — verify score excludes skipped questions
5. Check results page — verify "Puladas" stat shows, badge on review cards
6. Check history — verify skipped count indicator

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: No TypeScript errors, successful build.
