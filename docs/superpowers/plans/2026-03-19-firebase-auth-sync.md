# Firebase Auth + Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional Google login with Firestore cloud sync to Questify, keeping offline localStorage mode as default.

**Architecture:** AuthContext wraps the app, providing user state. Storage hooks gain a Firestore layer that activates when logged in. New Login/Profile pages and UserAvatar header component provide the UI.

**Tech Stack:** Firebase Auth (Google provider), Cloud Firestore, React Context, existing CSS Modules + design tokens.

**Spec:** `docs/superpowers/specs/2026-03-19-firebase-auth-sync-design.md`

---

## Chunk 1: Auth Foundation

### Task 1: AuthContext + useAuth hook

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: Create AuthContext.tsx**

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, type PropsWithChildren } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 2: Create useAuth.ts**

```tsx
// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

- [ ] **Step 3: Wrap app in AuthProvider**

Modify `src/main.tsx` — add AuthProvider inside ThemeProvider:

```tsx
import { AuthProvider } from './contexts/AuthContext';

// In render:
<StrictMode>
  <HashRouter>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </HashRouter>
</StrictMode>
```

- [ ] **Step 4: Verify app still loads without errors**

Open browser, check console for errors. App should work exactly as before.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/AuthContext.tsx src/hooks/useAuth.ts src/main.tsx
git commit -m "feat: add AuthContext and useAuth hook with Google provider"
```

---

### Task 2: UserAvatar component in Header

**Files:**
- Create: `src/components/UserAvatar/UserAvatar.tsx`
- Create: `src/components/UserAvatar/UserAvatar.module.css`
- Modify: `src/components/Layout/Header.tsx`

- [ ] **Step 1: Create UserAvatar.tsx**

```tsx
// src/components/UserAvatar/UserAvatar.tsx
import { useNavigate } from 'react-router';
import { User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './UserAvatar.module.css';

export function UserAvatar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <button className={styles.avatarBtn} onClick={() => navigate('/profile')} title={user.displayName || 'Perfil'}>
        <img src={user.photoURL || ''} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
      </button>
    );
  }

  return (
    <button className={styles.loginBtn} onClick={() => navigate('/login')} title="Entrar">
      <User size={20} />
    </button>
  );
}
```

- [ ] **Step 2: Create UserAvatar.module.css**

```css
/* src/components/UserAvatar/UserAvatar.module.css */
.avatarBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  transition: opacity var(--transition-fast);
}

.avatarBtn:hover {
  opacity: 0.8;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-accent);
}

.loginBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-bg-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.loginBtn:hover {
  background-color: var(--color-accent-light);
  color: var(--color-accent);
}
```

- [ ] **Step 3: Add UserAvatar to Header.tsx**

Modify `src/components/Layout/Header.tsx`:
- Add import: `import { UserAvatar } from '../UserAvatar/UserAvatar';`
- Add `<UserAvatar />` inside the `.actions` div, after `<ThemeToggle />`:

```tsx
<div className={styles.actions}>
  <ThemeToggle />
  <UserAvatar />
</div>
```

- [ ] **Step 4: Verify header shows user icon**

Open browser, confirm User icon appears next to theme toggle in header. Click it — should navigate to /login (404 for now, that's expected).

- [ ] **Step 5: Commit**

```bash
git add src/components/UserAvatar/UserAvatar.tsx src/components/UserAvatar/UserAvatar.module.css src/components/Layout/Header.tsx
git commit -m "feat: add UserAvatar component to header"
```

---

### Task 3: Login Page

**Files:**
- Create: `src/pages/Login/LoginPage.tsx`
- Create: `src/pages/Login/LoginPage.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create LoginPage.tsx**

```tsx
// src/pages/Login/LoginPage.tsx
import { useNavigate } from 'react-router';
import { BookOpen, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/profile', { replace: true });
    return null;
  }

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <BookOpen size={48} className={styles.logoIcon} />
          <h1 className={styles.title}>Questify</h1>
          <p className={styles.subtitle}>Sincronize seus dados entre dispositivos</p>
        </div>

        <button className={styles.googleBtn} onClick={handleLogin}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Entrar com Google
        </button>

        <button className={styles.skipBtn} onClick={() => navigate('/')}>
          Continuar sem conta
        </button>

        <p className={styles.info}>
          Seus dados locais continuam funcionando normalmente. O login permite sincronizar entre dispositivos.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create LoginPage.module.css**

```css
/* src/pages/Login/LoginPage.module.css */
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - var(--spacing-2xl));
  padding: var(--spacing-lg);
}

.card {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.logoSection {
  margin-bottom: var(--spacing-xl);
}

.logoIcon {
  color: var(--color-accent);
  margin-bottom: var(--spacing-sm);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.googleBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  background-color: white;
  color: #333;
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  border: 1px solid #dadce0;
  transition: background-color var(--transition-fast), box-shadow var(--transition-fast);
}

.googleBtn:hover {
  background-color: #f7f8f8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.googleIcon {
  flex-shrink: 0;
}

.skipBtn {
  display: block;
  width: 100%;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.skipBtn:hover {
  color: var(--color-accent);
}

.info {
  margin-top: var(--spacing-xl);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.5;
}
```

- [ ] **Step 3: Add login route to App.tsx**

Modify `src/App.tsx`:
- Add import: `import { LoginPage } from './pages/Login/LoginPage';`
- Add route inside the Layout Route group: `<Route path="login" element={<LoginPage />} />`

- [ ] **Step 4: Verify login page renders and Google login works**

Navigate to /login, verify card renders with Google button. Click "Entrar com Google", verify Google popup appears and login succeeds. After login, check header shows Google avatar.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login/LoginPage.tsx src/pages/Login/LoginPage.module.css src/App.tsx
git commit -m "feat: add login page with Google authentication"
```

---

### Task 4: Profile Page

**Files:**
- Create: `src/pages/Profile/ProfilePage.tsx`
- Create: `src/pages/Profile/ProfilePage.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ProfilePage.tsx**

```tsx
// src/pages/Profile/ProfilePage.tsx
import { useNavigate } from 'react-router';
import { LogOut, BookOpen, Target, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useResultsStorage } from '../../hooks/useResultsStorage';
import { useQuizStorage } from '../../hooks/useQuizStorage';
import { formatTime } from '../../utils/formatTime';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { results } = useResultsStorage();
  const { quizzes } = useQuizStorage();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const totalProvas = results.length;
  const mediaGeral = totalProvas > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalProvas)
    : 0;
  const tempoTotal = results.reduce((sum, r) => sum + r.timeTakenSeconds, 0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <img src={user.photoURL || ''} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
        <h2 className={styles.name}>{user.displayName}</h2>
        <p className={styles.email}>{user.email}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <BookOpen size={24} className={styles.statIcon} />
          <span className={styles.statValue}>{totalProvas}</span>
          <span className={styles.statLabel}>Provas realizadas</span>
        </div>
        <div className={styles.statCard}>
          <Target size={24} className={styles.statIcon} />
          <span className={styles.statValue}>{mediaGeral}%</span>
          <span className={styles.statLabel}>Media geral</span>
        </div>
        <div className={styles.statCard}>
          <Clock size={24} className={styles.statIcon} />
          <span className={styles.statValue}>{formatTime(tempoTotal)}</span>
          <span className={styles.statLabel}>Tempo total</span>
        </div>
      </div>

      <div className={styles.infoCard}>
        <p className={styles.infoText}>
          {quizzes.length} banco{quizzes.length !== 1 ? 's' : ''} de questoes
        </p>
      </div>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={18} />
        Sair da conta
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create ProfilePage.module.css**

```css
/* src/pages/Profile/ProfilePage.module.css */
.container {
  max-width: 600px;
  margin: 0 auto;
}

.profileCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-lg);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-accent);
  margin-bottom: var(--spacing-md);
}

.name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.email {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.statCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.statIcon {
  color: var(--color-accent);
}

.statValue {
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.statLabel {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
}

.infoCard {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.infoText {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.logoutBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-danger-light);
  color: var(--color-danger);
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--color-danger);
  transition: background-color var(--transition-fast);
}

.logoutBtn:hover {
  background-color: var(--color-danger);
  color: white;
}

@media (max-width: 480px) {
  .statsGrid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Add profile route to App.tsx**

Modify `src/App.tsx`:
- Add import: `import { ProfilePage } from './pages/Profile/ProfilePage';`
- Add route: `<Route path="profile" element={<ProfilePage />} />`

- [ ] **Step 4: Verify profile page with stats**

Login, navigate to /profile. Verify avatar, name, email display. Verify stats show from localStorage results. Verify logout button works.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Profile/ProfilePage.tsx src/pages/Profile/ProfilePage.module.css src/App.tsx
git commit -m "feat: add profile page with user stats"
```

---

## Chunk 2: Firestore Sync

### Task 5: Firestore sync service

**Files:**
- Create: `src/services/firestoreSync.ts`

- [ ] **Step 1: Create firestoreSync.ts**

This is a pure service module (no React hooks) with functions for reading/writing Firestore.

```tsx
// src/services/firestoreSync.ts
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { Quiz, QuizResult } from '../types/quiz';

type FavoritesMap = Record<string, string[]>;

// ---- Quizzes ----

export async function fetchQuizzes(userId: string): Promise<Quiz[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'quizzes'));
  return snap.docs.map((d) => d.data() as Quiz);
}

export async function pushQuiz(userId: string, quiz: Quiz): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'quizzes', quiz.id), quiz);
}

export async function removeQuiz(userId: string, quizId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'quizzes', quizId));
}

// ---- Results ----

export async function fetchResults(userId: string): Promise<QuizResult[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'results'));
  return snap.docs.map((d) => d.data() as QuizResult);
}

export async function pushResult(userId: string, result: QuizResult): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'results', result.id), result);
}

export async function clearAllResults(userId: string): Promise<void> {
  const snap = await getDocs(collection(db, 'users', userId, 'results'));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ---- Favorites ----

export async function fetchFavorites(userId: string): Promise<FavoritesMap> {
  const snap = await getDocs(collection(db, 'users', userId, 'favorites'));
  const map: FavoritesMap = {};
  snap.docs.forEach((d) => {
    map[d.id] = (d.data().questionIds as string[]) || [];
  });
  return map;
}

export async function pushFavorites(userId: string, quizId: string, questionIds: string[]): Promise<void> {
  if (questionIds.length === 0) {
    await deleteDoc(doc(db, 'users', userId, 'favorites', quizId));
  } else {
    await setDoc(doc(db, 'users', userId, 'favorites', quizId), { questionIds });
  }
}

// ---- Bulk merge (first login) ----

export async function mergeLocalToCloud(
  userId: string,
  quizzes: Quiz[],
  results: QuizResult[],
  favorites: FavoritesMap
): Promise<void> {
  const batch = writeBatch(db);

  for (const quiz of quizzes) {
    batch.set(doc(db, 'users', userId, 'quizzes', quiz.id), quiz);
  }
  for (const result of results) {
    batch.set(doc(db, 'users', userId, 'results', result.id), result);
  }
  for (const [quizId, questionIds] of Object.entries(favorites)) {
    if (questionIds.length > 0) {
      batch.set(doc(db, 'users', userId, 'favorites', quizId), { questionIds });
    }
  }

  await batch.commit();
}

// ---- Profile ----

export async function saveProfile(userId: string, profile: { displayName: string; email: string; photoURL: string; createdAt: string }): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'profile'), profile, { merge: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/firestoreSync.ts
git commit -m "feat: add Firestore sync service layer"
```

---

### Task 6: Wire Firestore sync into storage hooks

**Files:**
- Modify: `src/hooks/useQuizStorage.ts`
- Modify: `src/hooks/useResultsStorage.ts`
- Modify: `src/hooks/useFavoritesStorage.ts`

- [ ] **Step 1: Update useQuizStorage.ts**

Add Firestore sync on every mutation when user is logged in:

```tsx
// src/hooks/useQuizStorage.ts
import { useCallback } from 'react';
import type { Quiz } from '../types/quiz';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { pushQuiz, removeQuiz } from '../services/firestoreSync';

export function useQuizStorage() {
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, []);
  const { user } = useAuth();

  const addQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => [...prev, quiz]);
    if (user) pushQuiz(user.uid, quiz).catch(console.error);
  }, [setQuizzes, user]);

  const updateQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? quiz : q)));
    if (user) pushQuiz(user.uid, quiz).catch(console.error);
  }, [setQuizzes, user]);

  const deleteQuiz = useCallback((id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    if (user) removeQuiz(user.uid, id).catch(console.error);
  }, [setQuizzes, user]);

  const getQuiz = useCallback((id: string): Quiz | undefined => {
    return quizzes.find((q) => q.id === id);
  }, [quizzes]);

  return { quizzes, setQuizzes, addQuiz, updateQuiz, deleteQuiz, getQuiz };
}
```

Note: `setQuizzes` is now also exported for the sync/merge flow.

- [ ] **Step 2: Update useResultsStorage.ts**

```tsx
// src/hooks/useResultsStorage.ts
import { useCallback } from 'react';
import type { QuizResult } from '../types/quiz';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { pushResult, clearAllResults } from '../services/firestoreSync';

export function useResultsStorage() {
  const [results, setResults] = useLocalStorage<QuizResult[]>(STORAGE_KEYS.RESULTS, []);
  const { user } = useAuth();

  const addResult = useCallback((result: QuizResult) => {
    setResults((prev) => [...prev, result]);
    if (user) pushResult(user.uid, result).catch(console.error);
  }, [setResults, user]);

  const getResultsForQuiz = useCallback((quizId: string): QuizResult[] => {
    return results.filter((r) => r.quizId === quizId);
  }, [results]);

  const clearResults = useCallback(() => {
    setResults([]);
    if (user) clearAllResults(user.uid).catch(console.error);
  }, [setResults, user]);

  return { results, setResults, addResult, getResultsForQuiz, clearResults };
}
```

- [ ] **Step 3: Update useFavoritesStorage.ts**

```tsx
// src/hooks/useFavoritesStorage.ts
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { pushFavorites } from '../services/firestoreSync';

type FavoritesMap = Record<string, string[]>;

export function useFavoritesStorage() {
  const [favorites, setFavorites] = useLocalStorage<FavoritesMap>(STORAGE_KEYS.FAVORITES, {});
  const { user } = useAuth();

  const syncFavorites = useCallback((quizId: string, questionIds: string[]) => {
    if (user) pushFavorites(user.uid, quizId, questionIds).catch(console.error);
  }, [user]);

  const toggleFavorite = useCallback((quizId: string, questionId: string) => {
    setFavorites((prev) => {
      const list = prev[quizId] || [];
      const exists = list.includes(questionId);
      const updated = exists ? list.filter((id) => id !== questionId) : [...list, questionId];
      syncFavorites(quizId, updated);
      return { ...prev, [quizId]: updated };
    });
  }, [setFavorites, syncFavorites]);

  const isFavorite = useCallback((quizId: string, questionId: string): boolean => {
    return (favorites[quizId] || []).includes(questionId);
  }, [favorites]);

  const getFavorites = useCallback((quizId: string): string[] => {
    return favorites[quizId] || [];
  }, [favorites]);

  const getFavoriteCount = useCallback((quizId: string): number => {
    return (favorites[quizId] || []).length;
  }, [favorites]);

  const clearFavoritesForQuiz = useCallback((quizId: string) => {
    setFavorites((prev) => {
      const next = { ...prev };
      delete next[quizId];
      return next;
    });
    syncFavorites(quizId, []);
  }, [setFavorites, syncFavorites]);

  return { favorites, setFavorites, toggleFavorite, isFavorite, getFavorites, getFavoriteCount, clearFavoritesForQuiz };
}
```

Note: `favorites` and `setFavorites` are now exported for the sync/merge flow.

- [ ] **Step 4: Verify app works offline (no login)**

Open app without logging in. Add a quiz, take a test, favorite a question. Verify everything still works with localStorage only. No console errors.

- [ ] **Step 5: Verify app syncs when logged in**

Login with Google. Add a quiz. Check Firebase Console > Firestore > users/{uid}/quizzes — verify the quiz document appears. Take a test — verify result document appears in users/{uid}/results.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useQuizStorage.ts src/hooks/useResultsStorage.ts src/hooks/useFavoritesStorage.ts
git commit -m "feat: wire Firestore sync into storage hooks"
```

---

### Task 7: MergeDialog + first-login sync

**Files:**
- Create: `src/components/MergeDialog/MergeDialog.tsx`
- Create: `src/components/MergeDialog/MergeDialog.module.css`
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Create MergeDialog.tsx**

```tsx
// src/components/MergeDialog/MergeDialog.tsx
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
          Voce tem <strong>{quizCount}</strong> banco{quizCount !== 1 ? 's' : ''} de questoes
          e <strong>{resultCount}</strong> resultado{resultCount !== 1 ? 's' : ''} neste dispositivo.
          Deseja enviar para sua conta na nuvem?
        </p>
        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={onSkip}>
            <RefreshCw size={16} />
            Comecar do zero
          </button>
          <button className={styles.mergeBtn} onClick={onMerge}>
            <CloudUpload size={16} />
            Enviar para a nuvem
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MergeDialog.module.css**

```css
/* src/components/MergeDialog/MergeDialog.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-lg);
}

.dialog {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 440px;
  width: 100%;
  box-shadow: 0 8px 32px var(--color-shadow);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.skipBtn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.skipBtn:hover {
  background-color: var(--color-border);
}

.mergeBtn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.mergeBtn:hover {
  opacity: 0.9;
}
```

- [ ] **Step 3: Add first-login sync logic to AuthContext**

Update `src/contexts/AuthContext.tsx` to handle first login merge and cloud data pull:

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, useCallback, type PropsWithChildren } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { fetchQuizzes, fetchResults, fetchFavorites, mergeLocalToCloud, saveProfile } from '../services/firestoreSync';
import { MergeDialog } from '../components/MergeDialog/MergeDialog';
import type { Quiz, QuizResult } from '../types/quiz';

type FavoritesMap = Record<string, string[]>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMerge, setShowMerge] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const getLocalData = () => {
    const quizzes: Quiz[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES) || '[]');
    const results: QuizResult[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
    const favorites: FavoritesMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
    return { quizzes, results, favorites };
  };

  const pullCloudData = async (uid: string) => {
    const [cloudQuizzes, cloudResults, cloudFavorites] = await Promise.all([
      fetchQuizzes(uid),
      fetchResults(uid),
      fetchFavorites(uid),
    ]);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(cloudQuizzes));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(cloudResults));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(cloudFavorites));
    window.dispatchEvent(new Event('storage'));
  };

  const handleFirstLogin = async (firebaseUser: User) => {
    const local = getLocalData();
    const hasLocalData = local.quizzes.length > 0 || local.results.length > 0;

    if (hasLocalData) {
      setPendingUser(firebaseUser);
      setShowMerge(true);
    } else {
      await pullCloudData(firebaseUser.uid);
      setUser(firebaseUser);
    }
  };

  const handleMerge = async () => {
    if (!pendingUser) return;
    const local = getLocalData();
    await mergeLocalToCloud(pendingUser.uid, local.quizzes, local.results, local.favorites);
    await saveProfile(pendingUser.uid, {
      displayName: pendingUser.displayName || '',
      email: pendingUser.email || '',
      photoURL: pendingUser.photoURL || '',
      createdAt: new Date().toISOString(),
    });
    setUser(pendingUser);
    setPendingUser(null);
    setShowMerge(false);
  };

  const handleSkipMerge = async () => {
    if (!pendingUser) return;
    await pullCloudData(pendingUser.uid);
    await saveProfile(pendingUser.uid, {
      displayName: pendingUser.displayName || '',
      email: pendingUser.email || '',
      photoURL: pendingUser.photoURL || '',
      createdAt: new Date().toISOString(),
    });
    setUser(pendingUser);
    setPendingUser(null);
    setShowMerge(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await handleFirstLogin(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const localData = getLocalData();

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
      {showMerge && (
        <MergeDialog
          quizCount={localData.quizzes.length}
          resultCount={localData.results.length}
          onMerge={handleMerge}
          onSkip={handleSkipMerge}
        />
      )}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 4: Verify merge flow**

1. Logout if logged in
2. Add some quizzes and results while logged out
3. Login with Google
4. Verify MergeDialog appears with correct counts
5. Click "Enviar para a nuvem"
6. Check Firestore console — data should appear

- [ ] **Step 5: Verify pull flow**

1. Clear localStorage (DevTools > Application > Clear)
2. Login with Google
3. Verify data is pulled from Firestore into localStorage
4. Quizzes and results should appear in the app

- [ ] **Step 6: Commit**

```bash
git add src/components/MergeDialog/MergeDialog.tsx src/components/MergeDialog/MergeDialog.module.css src/contexts/AuthContext.tsx
git commit -m "feat: add first-login merge dialog and cloud sync"
```

---

## Chunk 3: Security Rules + Final Polish

### Task 8: Deploy Firestore security rules

**Files:** None (Firebase Console)

- [ ] **Step 1: Set Firestore security rules**

In Firebase Console > Firestore > Rules tab, replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click "Publicar".

- [ ] **Step 2: Verify rules work**

Login and perform CRUD operations. Verify they succeed. Try accessing another user's data path in console — should fail.

---

### Task 9: Loading state handling

**Files:**
- Modify: `src/components/Layout/Layout.tsx`

- [ ] **Step 1: Add loading spinner while auth initializes**

Read Layout.tsx first, then add a loading check. While `loading` is true from AuthContext, show a simple centered spinner so the app doesn't flash.

Modify `src/components/Layout/Layout.tsx`:

```tsx
import { Outlet } from 'react-router';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';
import styles from './Layout.module.css';

export function Layout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
```

Add to `Layout.module.css`:

```css
.loadingContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 2: Verify loading state**

Hard reload the page. Should see spinner briefly before app loads.

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout/Layout.tsx src/components/Layout/Layout.module.css
git commit -m "feat: add loading spinner during auth initialization"
```

---

### Task 10: Final integration test + push

- [ ] **Step 1: Full flow test — offline mode**

1. Logout (or use incognito)
2. Import a quiz JSON
3. Take a test
4. Check history
5. Favorite questions
6. Verify everything works without login

- [ ] **Step 2: Full flow test — online mode**

1. Login with Google
2. Import a quiz
3. Take a test
4. Favorite questions
5. Check Firestore console — all data synced
6. Go to Profile — stats are correct
7. Clear localStorage, reload — data pulled from cloud

- [ ] **Step 3: Full flow test — cross-device**

1. Open app in different browser or incognito
2. Login with same Google account
3. Verify all data appears

- [ ] **Step 4: Push to remote**

```bash
git push
```
