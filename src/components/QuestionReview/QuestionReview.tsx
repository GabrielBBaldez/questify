import { useState } from 'react';
import { ChevronDown, Check, X, SkipForward } from 'lucide-react';
import type { Question, AssertionQuestion } from '../../types/quiz';
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

          {question.type === 'assertion' && (
            <div className={styles.altList} style={{ marginBottom: 'var(--spacing-md)' }}>
              {(question as AssertionQuestion).assertions.map((a) => (
                <div key={a.id} className={`${styles.altItem} ${a.correct ? styles.altCorrect : styles.altWrong}`}>
                  <span className={styles.altLetter}>{a.id}.</span>
                  <span>{a.text}</span>
                  {a.correct ? <Check size={14} /> : <X size={14} />}
                </div>
              ))}
            </div>
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
