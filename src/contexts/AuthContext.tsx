import { createContext, useState, useEffect, type PropsWithChildren } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  mergeLocalToCloud,
  saveProfile,
  fetchQuizzes,
  fetchResults,
  fetchFavorites,
} from '../services/firestoreSync';
import { MergeDialog } from '../components/MergeDialog/MergeDialog';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

function readLocalData() {
  try {
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES) || '[]');
    const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
    return { quizzes, results, favorites };
  } catch {
    return { quizzes: [], results: [], favorites: {} };
  }
}

function buildProfile(firebaseUser: User) {
  return {
    displayName: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMerge, setShowMerge] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [localCounts, setLocalCounts] = useState({ quizzes: 0, results: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { quizzes, results } = readLocalData();
        const hasLocalData = quizzes.length > 0 || results.length > 0;

        if (hasLocalData) {
          setPendingUser(firebaseUser);
          setLocalCounts({ quizzes: quizzes.length, results: results.length });
          setShowMerge(true);
          setLoading(false);
        } else {
          pullCloudAndSetUser(firebaseUser);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const pullCloudAndSetUser = async (firebaseUser: User) => {
    try {
      const [cloudQuizzes, cloudResults, cloudFavorites] = await Promise.all([
        fetchQuizzes(firebaseUser.uid),
        fetchResults(firebaseUser.uid),
        fetchFavorites(firebaseUser.uid),
      ]);

      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(cloudQuizzes));
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(cloudResults));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(cloudFavorites));

      await saveProfile(firebaseUser.uid, buildProfile(firebaseUser));
    } catch (err) {
      console.error('Failed to pull cloud data:', err);
    }

    setUser(firebaseUser);
    setLoading(false);

    // Reload so hooks pick up new localStorage data
    if (window.location) {
      window.location.reload();
    }
  };

  const handleMerge = async () => {
    if (!pendingUser) return;

    const { quizzes, results, favorites } = readLocalData();

    try {
      await Promise.all([
        mergeLocalToCloud(pendingUser.uid, quizzes, results, favorites),
        saveProfile(pendingUser.uid, buildProfile(pendingUser)),
      ]);
    } catch (err) {
      console.error('Failed to merge local data to cloud:', err);
    }

    setShowMerge(false);
    setPendingUser(null);
    setUser(pendingUser);
  };

  const handleSkipMerge = async () => {
    if (!pendingUser) return;

    setShowMerge(false);
    setPendingUser(null);

    await pullCloudAndSetUser(pendingUser);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
      {showMerge && pendingUser && (
        <MergeDialog
          quizCount={localCounts.quizzes}
          resultCount={localCounts.results}
          onMerge={handleMerge}
          onSkip={handleSkipMerge}
        />
      )}
    </AuthContext.Provider>
  );
}
