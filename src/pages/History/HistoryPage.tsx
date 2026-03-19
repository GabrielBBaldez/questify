import { useState, useMemo } from 'react';
import { BarChart3, Clock, Trophy, Target, Trash2, Filter } from 'lucide-react';
import { useResultsStorage } from '../../hooks/useResultsStorage';
import { formatTime } from '../../utils/formatTime';
import { ProgressChart } from '../../components/ProgressChart/ProgressChart';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import styles from './HistoryPage.module.css';

const MODE_LABELS: Record<string, string> = {
  simulado: 'Simulado',
  estudo: 'Estudo',
  revisao: 'Revisão',
};

export function HistoryPage() {
  const { results, clearResults } = useResultsStorage();
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get unique quiz names for filter dropdown
  const quizOptions = useMemo(() => {
    const map = new Map<string, string>();
    results.forEach((r) => map.set(r.quizId, r.quizTitle));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [results]);

  // Filtered results
  const filtered = useMemo(() => {
    let list = [...results];
    if (filterQuiz !== 'all') {
      list = list.filter((r) => r.quizId === filterQuiz);
    }
    if (filterMode !== 'all') {
      list = list.filter((r) => r.mode === filterMode);
    }
    // Most recent first
    list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return list;
  }, [results, filterQuiz, filterMode]);

  // Stats
  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const total = filtered.length;
    const avgPercent = Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / total);
    const best = Math.max(...filtered.map((r) => r.percentage));
    const avgTime = Math.round(filtered.reduce((s, r) => s + r.timeTakenSeconds, 0) / total);
    return { total, avgPercent, best, avgTime };
  }, [filtered]);

  // Chart data (chronological order for the chart)
  const chartData = useMemo(() => {
    if (filterQuiz === 'all') return [];
    const quizResults = filtered
      .slice()
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    return quizResults.map((r, i) => ({
      label: `#${i + 1}`,
      value: r.percentage,
    }));
  }, [filtered, filterQuiz]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreClass = (pct: number) => {
    if (pct >= 70) return styles.scoreGood;
    if (pct >= 50) return styles.scoreMedium;
    return styles.scoreBad;
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <BarChart3 size={28} />
            Histórico
          </h1>
          <p className={styles.subtitle}>Acompanhe sua evolução ao longo do tempo</p>
        </div>
        {results.length > 0 && (
          <button className={styles.clearBtn} onClick={() => setShowClearConfirm(true)}>
            <Trash2 size={16} />
            Limpar
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className={styles.empty}>
          <BarChart3 size={48} />
          <p>Nenhum resultado registrado ainda.</p>
          <p className={styles.emptyHint}>Complete um treino para começar a acompanhar sua evolução.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className={styles.filters}>
            <Filter size={16} className={styles.filterIcon} />
            <select
              className={styles.filterSelect}
              value={filterQuiz}
              onChange={(e) => setFilterQuiz(e.target.value)}
            >
              <option value="all">Todas as provas</option>
              {quizOptions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
            >
              <option value="all">Todos os modos</option>
              <option value="simulado">Simulado</option>
              <option value="estudo">Estudo</option>
              <option value="revisao">Revisão</option>
            </select>
          </div>

          {/* Stats */}
          {stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Target size={20} className={styles.statIcon} />
                <div className={styles.statValue}>{stats.total}</div>
                <div className={styles.statLabel}>Tentativas</div>
              </div>
              <div className={styles.statCard}>
                <BarChart3 size={20} className={styles.statIcon} />
                <div className={styles.statValue}>{stats.avgPercent}%</div>
                <div className={styles.statLabel}>Média</div>
              </div>
              <div className={styles.statCard}>
                <Trophy size={20} className={styles.statIcon} />
                <div className={styles.statValue}>{stats.best}%</div>
                <div className={styles.statLabel}>Melhor</div>
              </div>
              <div className={styles.statCard}>
                <Clock size={20} className={styles.statIcon} />
                <div className={styles.statValue}>{formatTime(stats.avgTime)}</div>
                <div className={styles.statLabel}>Tempo médio</div>
              </div>
            </div>
          )}

          {/* Chart - only when filtering by specific quiz */}
          {chartData.length >= 2 && (
            <div className={styles.chartSection}>
              <h2 className={styles.chartTitle}>Evolução de acertos</h2>
              <ProgressChart data={chartData} />
            </div>
          )}

          {/* Results list */}
          <div className={styles.resultsList}>
            {filtered.map((r) => (
              <div key={r.id} className={styles.resultCard}>
                <div className={styles.resultMain}>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{r.quizTitle}</span>
                    <span className={`${styles.modeBadge} ${styles[`mode_${r.mode}`]}`}>
                      {MODE_LABELS[r.mode] || r.mode}
                    </span>
                  </div>
                  <div className={styles.resultMeta}>
                    <span>
                      {r.correctCount}/{r.totalQuestions - (r.skippedCount ?? 0)} acertos
                      {(r.skippedCount ?? 0) > 0 && ` (${r.skippedCount} puladas)`}
                    </span>
                    <span>·</span>
                    <span><Clock size={12} /> {formatTime(r.timeTakenSeconds)}</span>
                    <span>·</span>
                    <span>{formatDate(r.completedAt)}</span>
                  </div>
                </div>
                <div className={`${styles.resultScore} ${getScoreClass(r.percentage)}`}>
                  {r.percentage}%
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={styles.noResults}>
              Nenhum resultado encontrado com esses filtros.
            </div>
          )}
        </>
      )}

      {showClearConfirm && (
        <ConfirmDialog
          title="Limpar histórico"
          message="Tem certeza que deseja apagar todo o histórico de resultados? Essa ação não pode ser desfeita."
          onConfirm={() => {
            clearResults();
            setShowClearConfirm(false);
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
}
