<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Trash2 } from '@lucide/vue';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';

interface User {
  _id: string;
  username: string;
  role: string;
}

const users = ref<User[]>([]);
const error = ref('');
const busy = ref(false);
const form = ref({ username: '', password: '', role: 'USER' });
const toRemove = ref<User | null>(null);

// ponytail: one page of 100; add limit/offset paging when a list outgrows it.
const load = async () => {
  users.value = await api.get<User[]>('/users?limit=100');
};

onMounted(() =>
  load().catch((e) => {
    error.value = e instanceof Error ? e.message : 'بارگذاری ناموفق بود';
  }),
);

async function run(action: () => Promise<void>) {
  busy.value = true;
  error.value = '';
  try {
    await action();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'درخواست ناموفق بود';
  } finally {
    busy.value = false;
  }
}

const add = () =>
  run(async () => {
    await api.post('/users', form.value);
    form.value = { username: '', password: '', role: 'USER' };
    await load();
  });

const remove = () =>
  run(async () => {
    await api.delete(`/users/${toRemove.value!._id}`);
    toRemove.value = null;
    await load();
  });
</script>

<template>
  <h1 class="mb-6 text-2xl font-semibold">کاربران</h1>

  <p v-if="error" role="alert" class="mb-4 text-sm text-destructive">
    {{ error }}
  </p>

  <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <Card>
      <CardContent class="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام کاربری</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead class="w-12"
                ><span class="sr-only">عملیات</span></TableHead
              >
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user._id">
              <TableCell class="font-medium">{{ user.username }}</TableCell>
              <TableCell class="text-muted-foreground">{{
                user.role
              }}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  :aria-label="`حذف ${user.username}`"
                  @click="toRemove = user"
                >
                  <Trash2 class="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!users.length">
              <TableCell colspan="3" class="text-center text-muted-foreground">
                هنوز کاربری ثبت نشده است.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card class="self-start">
      <CardHeader><CardTitle>افزودن کاربر</CardTitle></CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="add">
          <div class="grid gap-2">
            <Label for="username">نام کاربری</Label>
            <Input id="username" v-model="form.username" dir="ltr" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">رمز عبور</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              dir="ltr"
              minlength="8"
              autocomplete="new-password"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="role">نقش</Label>
            <Select v-model="form.role">
              <SelectTrigger id="role" class="w-full"
                ><SelectValue
              /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" :disabled="busy">افزودن کاربر</Button>
        </form>
      </CardContent>
    </Card>
  </div>

  <AlertDialog
    :open="!!toRemove"
    @update:open="(open) => !open && (toRemove = null)"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>حذف {{ toRemove?.username }}؟</AlertDialogTitle>
        <AlertDialogDescription
          >این عمل قابل بازگشت نیست.</AlertDialogDescription
        >
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>انصراف</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="remove">
          حذف
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
