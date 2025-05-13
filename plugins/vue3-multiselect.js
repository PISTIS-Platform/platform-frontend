import { Multiselect } from 'vue-multiselect';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('multiselect', Multiselect);
});
