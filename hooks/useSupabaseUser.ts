/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { createComponentClient } from '@/models/supabase';
import { User } from '@supabase/supabase-js';

export function useSupabaseUser() {
  const [user, setUser] = useState<{ user: User | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createComponentClient();

    // Obter usuário atual
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          // console.error('Erro ao obter usuário:', error);
        }
        setUser({ user });
      } catch (error) {
        // console.error('Erro ao obter usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser({ user: session?.user ?? null });
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
