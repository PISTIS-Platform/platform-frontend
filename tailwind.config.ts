import TailwindForms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
    content: ['./components/**/*.{vue,js,ts}', './layouts/**/*.vue', './pages/**/*.vue', './app.{js,ts,vue}'],
    theme: {
        extend: {
            colors: {
                pistis: {
                    '50': '#edefff',
                    '100': '#dfe1ff',
                    '200': '#c5c8ff',
                    '300': '#a2a4ff',
                    '400': '#837cfd',
                    '500': '#705df7',
                    '600': '#613deb',
                    '700': '#5632d0',
                    '800': '#462ba8',
                    '900': '#3b2b84',
                    '950': '#24194d',
                },
            },
            fontFamily: {
                sans: ['Inter var', ...fontFamily.sans],
            },
        },
    },
    plugins: [TailwindForms],
} satisfies Config;
