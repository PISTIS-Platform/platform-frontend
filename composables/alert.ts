export const useAlertMessage = () => {
    const toast = useToast();

    const showSuccessMessage = (message: string) => {
        toast.add({ title: message, color: 'green' });
    };

    const showErrorMessage = (message: string) => {
        toast.add({ title: message, color: 'red' });
    };

    const showInfoMessage = (message: string) => {
        toast.add({ title: message, color: 'blue' });
    };

    return {
        showSuccessMessage,
        showErrorMessage,
        showInfoMessage,
    };
};
