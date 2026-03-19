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
