import { useNavigate } from 'react-router';
import { User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './UserAvatar.module.css';

export function UserAvatar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (!user) {
    return (
      <button
        className={styles.button}
        onClick={() => navigate('/login')}
        aria-label="Fazer login"
      >
        <User size={20} />
      </button>
    );
  }

  return (
    <button
      className={styles.button}
      onClick={() => navigate('/profile')}
      aria-label="Perfil"
    >
      <img
        className={styles.avatar}
        src={user.photoURL || undefined}
        alt={user.displayName || 'Avatar'}
        referrerPolicy="no-referrer"
      />
    </button>
  );
}
