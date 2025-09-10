export const useKeycloakLogout = () => {
    const config = useRuntimeConfig();
    const keycloakIssuer = config.keycloakIssuer;

    const logout = async () => {
        let session: any = null;
        try {
            session = await $fetch('/api/auth/session');
        } catch (e) {
            // ignore - session may already be cleared
        }

        const idToken = session?.id_token;
        const postLogout = '/';
        const logoutUrl =
            `${keycloakIssuer}/protocol/openid-connect/logout` +
            `?id_token_hint=${encodeURIComponent(idToken ?? '')}` +
            `&post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;

        try {
            await $fetch('/api/auth/signout', {
                method: 'POST',
                body: new URLSearchParams({ callbackUrl: logoutUrl }),
            });
        } catch (e) {}

        window.location.href = logoutUrl;
    };

    return { logout };
};
