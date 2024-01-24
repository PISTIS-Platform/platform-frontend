export default defineAppConfig({
    name: 'PISTIS UI',
    theme: {
        loading: 'repeating-linear-gradient(to right,#5632d0 0%,#705df7 50%,#a2a4ff 100%)',
    },
    ui: {
        primary: 'pistis',
        gray: 'zinc',
    },
    notifications: {
        // Show toasts at the top right of the screen
        position: 'top-0 bottom-auto',
    },
});
