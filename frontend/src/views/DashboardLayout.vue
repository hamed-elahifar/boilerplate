<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { LayoutDashboard, LogOut, Settings, Users } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const auth = useAuth();
const nav = [
  { to: '/', label: 'داشبورد', icon: LayoutDashboard },
  { to: '/users', label: 'کاربران', icon: Users },
  { to: '/settings', label: 'تنظیمات', icon: Settings },
];

onMounted(() => {
  if (!auth.me.value) void auth.load().catch(() => {}); // a 401 redirects in api.ts
});

function signOut() {
  auth.signOut();
  router.push('/login');
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside
      class="flex w-56 shrink-0 flex-col border-e border-sidebar-border bg-sidebar p-4 text-sidebar-foreground"
    >
      <div class="mb-6 px-2 text-xl font-semibold text-sidebar-primary">
        Boilerplate
      </div>
      <nav class="grid gap-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
          exact-active-class="bg-sidebar-accent font-medium text-sidebar-accent-foreground"
        >
          <component :is="item.icon" class="size-4" />
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto grid gap-2 border-t border-sidebar-border pt-4">
        <p class="truncate px-2 text-sm text-muted-foreground">
          {{ auth.me.value?.username }}
        </p>
        <Button variant="ghost" class="justify-start" @click="signOut">
          <LogOut class="size-4 rtl:-scale-x-100" /> خروج
        </Button>
      </div>
    </aside>
    <main class="flex-1 p-8"><RouterView /></main>
  </div>
</template>
