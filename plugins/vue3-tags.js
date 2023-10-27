import Vue3TagsInput from 'vue3-tags-input';

import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(Vue3TagsInput);
});
