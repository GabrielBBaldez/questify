import { formatTime } from '../../utils/formatTime';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  seconds: number;
}

export function ProgressBar({ current, total, seconds }: ProgressBarProps) {
  const pct = ((current + 1) / total) * 100;

  return (
    <div className={styles.container}>
      <span className={styles.info}>{current + 1} / {total}</span>
      <div className={styles.barWrapper}>
        <div className={styles.bar} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.timer}>{formatTime(seconds)}</span>
    </div>
  );
}
