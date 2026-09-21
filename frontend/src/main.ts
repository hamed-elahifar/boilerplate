import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import './composables/useTheme'; // applies the saved theme before first paint

createApp(App).use(router).mount('#app');
