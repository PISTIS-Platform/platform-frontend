import 'vue-fast-marquee/style.css';

import Marquee from 'vue-fast-marquee';

import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(Marquee);
});
