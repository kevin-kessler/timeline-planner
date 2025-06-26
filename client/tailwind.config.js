import PrimeUI from 'tailwindcss-primeui';


export default {
    content: [
        './index.html',
        './**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [PrimeUI],
};
