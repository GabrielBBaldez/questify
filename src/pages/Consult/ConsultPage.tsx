import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { Search, Home, Check, X, Hash } from 'lucide-react';
import { useQuizStorage } from '../../hooks/useQuizStorage';
import type { AssertionQuestion } from '../../types/quiz';
import styles from './ConsultPage.module.css';

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Múltipla Escolha',
  true_false: 'V ou F',
  assertion: 'Assertivas',
};

export function ConsultPage() {
  const { quizId } = useParams();
  const { getQuiz } = useQuizStorage();
  const [search, setSearch] = useState('');

  const quiz = getQuiz(quizId || '');

  const filteredQuestions = useMemo(() => {
    if (!quiz) return [];
    if (!search.trim()) return quiz.questions;

    const term = search.toLowerCase();
    return quiz.questions.filter((q) => {
      if (q.text.toLowerCase().includes(term)) return true;
      if (q.explanation?.toLowerCase().includes(term)) return true;
      if (q.alternatives.some((a) => a.text.toLowerCase().includes(term))) return true;
      if (q.alternatives.some((a) => a.explanation?.toLowerCase().includes(term))) return true;
      if (q.tags?.some((t) => t.toLowerCase().includes(term))) return true;
      if (q.type === 'assertion') {
        if ((q as AssertionQuestion).assertions.some((a) => a.text.toLowerCase().includes(term))) return true;
      }
      return false;
    });
  }, [quiz, search]);

  if (!quiz) {
    return (
      <div className={styles.notFound}>
        <p>Banco de questões não encontrado.</p>
        <Link to="/" className={styles.backLink}>
          <Home size={18} />
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{quiz.title}</h1>
        <p className={styles.subtitle}>Modo consulta - visualize questões, respostas e explicações</p>
      </div>

      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por palavra-chave (ex: cardiologia, infarto, herança)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p className={styles.resultCount}>
        {filteredQuestions.length} de {quiz.questions.length} questões
        {search && ` para "${search}"`}
      </p>

      {filteredQuestions.map((q) => {
        const originalIndex = quiz.questions.indexOf(q);
        return (
          <div key={q.id} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNum}>#{originalIndex + 1}</span>
              <span className={styles.questionType}>{TYPE_LABELS[q.type] || q.type}</span>
              {q.tags && q.tags.length > 0 && (
                <div className={styles.tagsList}>
                  {q.tags.map((tag) => (
                    <span key={tag} className={styles.tagBadge}>
                      <Hash size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className={styles.questionText}>{q.text}</p>

            {q.image && (
              <img src={q.image} alt="Imagem da questão" className={styles.questionImage} />
            )}

            {q.type === 'assertion' && (
              <div className={styles.assertionsList}>
                {(q as AssertionQuestion).assertions.map((a) => (
                  <div className={styles.assertionItem} key={a.id}>
                    <span className={styles.assertionId}>{a.id}.</span>
                    <span>{a.text}</span>
                    {a.correct ? (
                      <Check size={14} className={styles.assertionCorrect} />
                    ) : (
                      <X size={14} className={styles.assertionWrong} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className={styles.altList}>
              {q.alternatives.map((alt) => (
                <div key={alt.id}>
                  <div
                    className={`${styles.altItem} ${alt.id === q.correctAnswer ? styles.altCorrect : styles.altNormal}`}
                  >
                    <span className={styles.altLetter}>{alt.id})</span>
                    <span>{alt.text}</span>
                    {alt.id === q.correctAnswer && <Check size={14} />}
                  </div>
                  {alt.explanation && (
                    <div className={styles.altExplanation}>{alt.explanation}</div>
                  )}
                </div>
              ))}
            </div>

            {q.explanation && (
              <div className={styles.explanation}>
                <div className={styles.explanationLabel}>Explicação:</div>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
