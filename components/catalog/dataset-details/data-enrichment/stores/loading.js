import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', () => {
    const loading = ref(false);
    const error = ref(false);
    const errorText = ref('');

    const loadingPending = () => {
        loading.value = true;
    };

    const loadingSuccess = () => {
        loading.value = error.value = false;
        errorText.value = '';
    };

    const loadingError = (errorMsg = 'Something went wrong') => {
        loading.value = false;
        error.value = true;
        errorText.value = errorMsg;
    };

    return { loading, error, errorText, loadingPending, loadingError, loadingSuccess };
});
