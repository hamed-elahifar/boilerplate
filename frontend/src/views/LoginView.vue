<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  busy.value = true;
  error.value = '';
  try {
    await useAuth().signIn(email.value, password.value);
    await router.push('/');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ورود ناموفق بود';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center p-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">Boilerplate</CardTitle>
        <CardDescription>وارد شوید.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="submit">
          <div class="grid gap-2">
            <Label for="email">نام کاربری</Label>
            <Input
              id="email"
              v-model="email"
              type="text"
              dir="ltr"
              autocomplete="username"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="password">رمز عبور</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              dir="ltr"
              autocomplete="current-password"
              required
            />
          </div>
          <p v-if="error" role="alert" class="text-sm text-destructive">
            {{ error }}
          </p>
          <Button type="submit" :disabled="busy">
            {{ busy ? 'در حال ورود…' : 'ورود' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </main>
</template>
