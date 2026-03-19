import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { readJsonFile } from '../../utils/jsonImport';
import { validateQuiz } from '../../utils/quizValidator';
import type { Quiz } from '../../types/quiz';
import styles from './ImportExport.module.css';

interface ImportButtonProps {
  onImport: (quiz: Quiz) => void;
}

export function ImportButton({ onImport }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readJsonFile(file);
      const result = validateQuiz(data);

      if (!result.valid) {
        setFeedback({ type: 'error', message: result.errors.join(', ') });
        return;
      }

      onImport(result.quiz!);
      setFeedback({ type: 'success', message: `"${result.quiz!.title}" importado com sucesso!` });
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao ler arquivo JSON' });
    }

    if (inputRef.current) inputRef.current.value = '';
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className={styles.importWrapper}>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className={styles.hidden}
        onChange={handleFileChange}
      />
      <button className={styles.importBtn} onClick={() => inputRef.current?.click()}>
        <Upload size={18} />
        Importar JSON
      </button>
      {feedback && (
        <p className={feedback.type === 'error' ? styles.error : styles.success}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
