import { writable, derived } from 'svelte/store';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    loading: false,
  });

  return {
    subscribe,
    setUser: (user: User, token: string) => {
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
    },
    logout: () => {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    },
    setLoading: (loading: boolean) => update(s => ({ ...s, loading })),
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, $auth => !!$auth.token);
export const isAdmin = derived(auth, $auth => $auth.user?.role === 'admin');
