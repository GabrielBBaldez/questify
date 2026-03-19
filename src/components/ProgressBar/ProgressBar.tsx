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
