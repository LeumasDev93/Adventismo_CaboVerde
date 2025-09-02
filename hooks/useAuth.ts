import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  user_metadata?: {
    avatar_url?: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({ user, loading: false });
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setAuthState({ user: null, loading: false });
      }
    } else {
      setAuthState({ user: null, loading: false });
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulação de login - em produção, você faria uma chamada para sua API
    const user: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0], // Usa parte do email como nome
      user_metadata: {
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      },
    };

    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ user, loading: false });
    return { user, error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Simulação de registro
    const user: User = {
      id: Date.now().toString(),
      email,
      name,
      user_metadata: {
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      },
    };

    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ user, loading: false });
    return { user, error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('user');
    setAuthState({ user: null, loading: false });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
  };
}
