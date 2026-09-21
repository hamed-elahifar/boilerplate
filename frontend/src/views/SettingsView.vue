<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { themes, useTheme } from '@/composables/useTheme';

const { theme, dark } = useTheme();
</script>

<template>
  <h1 class="mb-6 text-2xl font-semibold">تنظیمات</h1>
  <Card class="max-w-xl">
    <CardHeader>
      <CardTitle>ظاهر</CardTitle>
      <CardDescription>در این مرورگر ذخیره می‌شود.</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6">
      <div role="radiogroup" aria-label="پوسته" class="grid grid-cols-3 gap-3">
        <button
          v-for="t in themes"
          :key="t.id"
          type="button"
          role="radio"
          :aria-checked="theme === t.id"
          class="flex items-center gap-2 rounded-md border p-3 text-sm"
          :class="
            theme === t.id
              ? 'border-ring ring-2 ring-ring/40'
              : 'hover:bg-muted'
          "
          @click="theme = t.id"
        >
          <span class="size-4 rounded-full" :style="{ background: t.swatch }" />
          {{ t.label }}
        </button>
      </div>
      <Button variant="outline" class="w-fit" @click="dark = !dark">
        <component :is="dark ? Sun : Moon" class="size-4" />
        {{ dark ? 'حالت روشن' : 'حالت تاریک' }}
      </Button>
    </CardContent>
  </Card>
</template>
