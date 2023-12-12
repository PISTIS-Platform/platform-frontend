import * as ChartJS from 'chart.js';

import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(ChartJS);
});
