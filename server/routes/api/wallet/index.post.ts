import { getToken } from '#auth';

const { walletUrl, walletAlias } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = JSON.stringify({ wallet_alias: walletAlias });

    return $fetch<any>(`${walletUrl}`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
