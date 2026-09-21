import { ref, watchEffect } from 'vue';

// To add a theme: a [data-theme='<id>'] block pair in assets/themes.css, then an entry here.
export const themes = [
  { id: 'teal', label: 'سبزآبی', swatch: 'oklch(0.4335 0.0754 182.2315)' },
  { id: 'neutral', label: 'خنثی', swatch: 'oklch(0.205 0 0)' },
  { id: 'violet', label: 'بنفش', swatch: 'oklch(0.5 0.22 293)' },
];

const savedTheme = localStorage.getItem('iea.theme');
const savedDark = localStorage.getItem('iea.dark');

const theme = ref(
  themes.some((t) => t.id === savedTheme) ? savedTheme! : 'teal',
);
const dark = ref(
  savedDark === null
    ? matchMedia('(prefers-color-scheme: dark)').matches
    : savedDark === '1',
);

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
  document.documentElement.classList.toggle('dark', dark.value);
  localStorage.setItem('iea.theme', theme.value);
  localStorage.setItem('iea.dark', dark.value ? '1' : '0');
});

export const useTheme = () => ({ theme, dark });
