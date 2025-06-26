import PrimeUI from 'tailwindcss-primeui';


export default {
    content: [
        './index.html',
        './client/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [PrimeUI],
};
