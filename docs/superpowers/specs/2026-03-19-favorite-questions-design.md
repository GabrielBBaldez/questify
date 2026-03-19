# Favorite Questions Design

## Goal

Allow users to favorite/bookmark individual questions within a quiz, persisting across sessions, accessible during training, review, and consultation modes.

## Storage

- New localStorage key: `treino-prova-favorites`
- Data structure: `Record<string, string[]>` mapping quiz IDs to arrays of favorited question IDs
- Example: `{ "quiz-abc": ["q1", "q5"], "quiz-xyz": ["q3"] }`

### Hook: `useFavoritesStorage`

New hook at `src/hooks/useFavoritesStorage.ts` following existing `useLocalStorage` pattern.

**Methods:**
- `toggleFavorite(quizId: string, questionId: string): void` - adds or removes a question from favorites
- `isFavorite(quizId: string, questionId: string): boolean` - checks if a question is favorited
- `getFavorites(quizId: string): string[]` - returns all favorited question IDs for a quiz
- `getFavoriteCount(quizId: string): number` - returns count of favorites for a quiz

**Storage key constant:** Add `FAVORITES: 'treino-prova-favorites'` to `src/constants/storageKeys.ts`.

## UI Components

### Star Button

Reusable inline component or pattern (not a separate file needed - just a styled button with the Star icon).

- Icon: `Star` from lucide-react (outline when inactive, filled when active)
- Color: golden (#f5b942) when active, muted/gray when inactive
- Size: 18px
- Clickable at any time (before/after answering)

### QuestionDisplay (Training)

- Star in the top-right corner of the question text area
- Props: receives `isFavorite: boolean` and `onToggleFavorite: () => void`
- QuizPlayerPage passes these props using `useFavoritesStorage`

### QuestionReview (Post-quiz Review)

- Star in the header row, next to the Correta/Errada/Pulada badge
- Props: receives `isFavorite: boolean` and `onToggleFavorite: () => void`
- ResultsPage passes these props using `useFavoritesStorage`

### ConsultPage (Consultation)

- Star on each question card header
- Toggle button "Mostrar so favoritas" in the search bar area
- When active, filters `filteredQuestions` to only show favorited questions
- Counter showing "X favoritas" next to the toggle
- New local state: `showOnlyFavorites: boolean`
- Filter logic integrates with existing `useMemo` search filter

## Cleanup

- When a quiz is deleted (in `HomePage`), also remove its favorites entry from localStorage
- Add cleanup call in the delete handler: after `deleteQuiz(id)`, call `clearFavoritesForQuiz(id)`
- Add `clearFavoritesForQuiz(quizId: string): void` method to the hook

## Files to Create/Modify

**Create:**
- `src/hooks/useFavoritesStorage.ts`

**Modify:**
- `src/constants/storageKeys.ts` - add FAVORITES key
- `src/components/QuestionDisplay/QuestionDisplay.tsx` - add star button + props
- `src/components/QuestionDisplay/QuestionDisplay.module.css` - star button styles
- `src/components/QuestionReview/QuestionReview.tsx` - add star button + props
- `src/components/QuestionReview/QuestionReview.module.css` - star button styles
- `src/pages/QuizPlayer/QuizPlayerPage.tsx` - use hook, pass props to QuestionDisplay
- `src/pages/Results/ResultsPage.tsx` - use hook, pass props to QuestionReview
- `src/pages/Consult/ConsultPage.tsx` - use hook, add filter toggle, star per question
- `src/pages/Consult/ConsultPage.module.css` - toggle button styles
- `src/pages/Home/HomePage.tsx` - cleanup favorites on quiz delete
