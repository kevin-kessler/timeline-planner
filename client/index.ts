import { DARK_MODE_CLASS } from '@client/stores/DarkModeStore.ts';
import { definePreset } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';
import { createPinia } from 'pinia';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import App from './App.vue';
import './index.css';


const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(ToastService);
app.component('ToastContainer', Toast);

app.use(ConfirmationService);

const noraExtension = definePreset(Nora, {
    semantic: {
        components: {
            button: {
                outlinedPrimaryHoverBackground: 'primary.200',
            },
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}',
                },
            },
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}',
                },
            },
        },
    },
});

app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: noraExtension,
        options: {
            prefix: 'p',
            darkModeSelector: `.${DARK_MODE_CLASS}`,
            cssLayer: {
                name: 'primevue',
                order: 'theme, base, primevue',
            },
        },
    },
    pt: {}, // Enable PassThrough

});

app.mount('#app');
