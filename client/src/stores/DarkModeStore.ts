import { defineStore } from 'pinia';


export const DARK_MODE_CLASS = 'dark-mode-enabled';
const STORAGE_KEY = 'darkMode';

export const useDarkModeStore = defineStore('darkMode', {
    state: () => ({
        isEnabled: false,
    }),
    actions: {
        init() {
            const stored = localStorage.getItem(STORAGE_KEY);
            this.isEnabled = stored !== null
                ? JSON.parse(stored)
                // If no preference is set in local storage, use system preference
                : window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.apply();
        },
        toggle() {
            this.isEnabled = !this.isEnabled;
            this.apply();
        },
        apply() {
            document.documentElement.classList.toggle(DARK_MODE_CLASS, this.isEnabled);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.isEnabled));
        },
    },
});
