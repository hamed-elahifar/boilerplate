import { ref } from 'vue';
import { api, token } from '@/lib/api';

export interface Me {
  username: string;
  role: string;
}

const me = ref<Me | null>(null);

async function load() {
  me.value = await api.get<Me>('/auth/me');
}

export function useAuth() {
  return {
    me,
    load,
    async signIn(username: string, password: string) {
      const { accessToken } = await api.post<{ accessToken: string }>(
        '/auth/sign-in',
        { username, password },
      );
      token.set(accessToken);
      await load();
    },
    signOut() {
      token.clear();
      me.value = null;
    },
  };
}
