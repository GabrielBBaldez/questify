import { CloudUpload, RefreshCw } from 'lucide-react';
import styles from './MergeDialog.module.css';

interface MergeDialogProps {
  quizCount: number;
  resultCount: number;
  onMerge: () => void;
  onSkip: () => void;
}

export function MergeDialog({ quizCount, resultCount, onMerge, onSkip }: MergeDialogProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>Dados locais encontrados</h3>
        <p className={styles.message}>
          Voce possui dados salvos neste navegador. Deseja enviar para a nuvem ou comecar do zero com os dados da sua conta?
        </p>
        <div className={styles.counts}>
          <span className={styles.countBadge}>{quizCount} quiz{quizCount !== 1 ? 'zes' : ''}</span>
          <span className={styles.countBadge}>{resultCount} resultado{resultCount !== 1 ? 's' : ''}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.mergeBtn} onClick={onMerge}>
            <CloudUpload size={18} />
            Enviar para a nuvem
          </button>
          <button className={styles.skipBtn} onClick={onSkip}>
            <RefreshCw size={18} />
            Comecar do zero
          </button>
        </div>
      </div>
    </div>
  );
}
