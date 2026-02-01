import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase'; // adjust path if needed
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        user,
        isLoading: false,
        error: null,
      });
    }, (err) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message,
      }));
    });

    return () => unsubscribe();
  }, []);

  return state;
}