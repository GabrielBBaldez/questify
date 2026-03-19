# Design: Feature "Pular Questao"

## Resumo

Permitir que o usuario pule uma questao durante o quiz sem comprometer sua pontuacao. Questoes puladas nao contam como certa nem errada — apenas como "pulada".

## Abordagem

Usar valor especial `"__SKIPPED__"` no `answers` record. Quando o usuario pula, `answers[questionId] = "__SKIPPED__"`.

## Mudancas por Arquivo

### 1. Constante — `src/constants/quiz.ts` (NOVO ARQUIVO)

- Criar arquivo com: `export const SKIPPED_ANSWER = "__SKIPPED__";`

### 2. Tipos — `src/types/quiz.ts`

- Adicionar campo `skippedCount?: number` a `QuizResult` (opcional para compatibilidade com dados existentes no localStorage)

### 3. QuizPlayerPage — `src/pages/QuizPlayer/QuizPlayerPage.tsx`

- Adicionar `handleSkip()`:
  - Grava `answers[qId] = SKIPPED_ANSWER`
  - Avanca para proxima questao
  - Na ultima questao, apenas marca como pulada (nao auto-finaliza — usuario precisa clicar "Finalizar")
- Alterar `handleFinish()`:
  - Contar questoes com `SKIPPED_ANSWER` como `skippedCount`
  - `answeredCount = total - skippedCount`
  - `correctCount` ignora questoes com `SKIPPED_ANSWER`
  - `percentage = answeredCount > 0 ? Math.round(correctCount / answeredCount * 100) : 0`
  - Incluir `skippedCount` no `QuizResult`
- Passar `onSkip` para `QuestionDisplay`

### 4. QuestionDisplay — `src/components/QuestionDisplay/QuestionDisplay.tsx`

- Adicionar prop `onSkip: () => void`
- Atualizar logica de estados derivados para distinguir skip de resposta:
  ```
  const isSkipped = selectedAnswer === SKIPPED_ANSWER;
  const hasAnswered = selectedAnswer !== null && !isSkipped;
  const showFeedback = mode !== 'simulado' && hasAnswered;  // NAO mostra feedback para skip
  const isDisabled = mode !== 'simulado' && (hasAnswered || isSkipped);  // Trava apos skip em estudo/revisao
  ```
- Adicionar botao "Pular" com icone `SkipForward` do lucide-react
- Posicao: entre "Anterior" e "Proxima/Finalizar"
- Desabilitado se `hasAnswered` (ja respondeu com alternativa real)
- Em modo simulado: usuario NAO pode pular questao ja respondida (skip so para nao-respondidas)
- Se questao ja pulada (`isSkipped`), botao mostra "Pulada" com estilo cinza
- Disponivel em todos os modos
- Adicionar `aria-label="Pular questao"` para acessibilidade

### 5. QuestionDisplay.module.css

- Adicionar estilos para `.skipBtn` (cor neutra/cinza)
- Adicionar estado `.skipBtnActive` para questao ja pulada

### 6. ResultsSummary — `src/components/ResultsSummary/ResultsSummary.tsx`

- Computar `skippedCount = result.skippedCount ?? 0` (fallback para dados antigos)
- Computar `answeredCount = result.totalQuestions - skippedCount`
- Score: mostrar `acertos / respondidas` (nao total geral)
- Adicionar terceira stat "Puladas" com `skippedCount` (so mostra se > 0)
- Erros = `answeredCount - correctCount` (nao conta puladas)

### 7. ResultsPage — `src/pages/Results/ResultsPage.tsx`

- Alterar logica de `isPerfect`: requer `percentage === 100 && (result.skippedCount ?? 0) === 0`
  (evita confetti quando usuario pula 9 questoes e acerta 1)

### 8. QuestionReview — `src/components/QuestionReview/QuestionReview.tsx`

- Importar `SKIPPED_ANSWER`
- Se `userAnswer === SKIPPED_ANSWER`:
  - Badge "Pulada" com cor cinza/amarela (novo estilo `.badgeSkipped`)
  - Nenhuma alternativa marcada como selecionada
  - Alternativa correta ainda destacada em verde
- Se `userAnswer === undefined` (nao respondida e nao pulada):
  - Badge "Nao respondida" com estilo similar ao pulada

### 9. QuestionReview.module.css

- Adicionar estilo `.badgeSkipped` (cor cinza/amarela)

### 10. HistoryPage — `src/pages/History/HistoryPage.tsx`

- Linha 180: alterar display de `r.correctCount/r.totalQuestions` para mostrar respondidas:
  ```
  const answered = r.totalQuestions - (r.skippedCount ?? 0);
  `${r.correctCount}/${answered} acertos`
  ```
- Se houve questoes puladas, mostrar indicador: `(${r.skippedCount} puladas)`

## Comportamento por Modo

| Modo      | Pular disponivel | Pode voltar e responder | Pode pular ja respondida |
|-----------|-------------------|-------------------------|--------------------------|
| Simulado  | Sim               | Sim (ja pode voltar)    | Nao                      |
| Estudo    | Sim               | Nao (questao trava)     | Nao                      |
| Revisao   | Sim               | Nao (questao trava)     | Nao                      |

## Compatibilidade com Dados Existentes

- `skippedCount` e opcional (`skippedCount?: number`) no tipo `QuizResult`
- Todos os componentes usam `result.skippedCount ?? 0` como fallback
- Resultados antigos no localStorage continuam funcionando sem quebrar

## Pontuacao

- Total de questoes no quiz: `N`
- Puladas: `S` (questoes com `SKIPPED_ANSWER`)
- Respondidas: `N - S`
- Acertos: `C`
- Porcentagem: `C / (N - S) * 100`
- Se todas puladas: `0%`
- Perfect score: so se `percentage === 100` E `skippedCount === 0`

## Fluxo do Usuario

1. Usuario ve a questao
2. Clica "Pular" → questao marcada como `__SKIPPED__`, avanca para proxima
3. Na ultima questao, pular marca como pulada mas nao auto-finaliza
4. No modo simulado, pode voltar e responder (substitui o skip)
5. Ao finalizar, questoes puladas aparecem separadas na pontuacao
6. Na revisao de questoes, puladas mostram badge "Pulada" e a resposta correta
7. No historico, score mostra apenas questoes respondidas
