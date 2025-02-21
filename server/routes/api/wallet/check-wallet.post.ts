import { getToken } from '#auth';

const {
    public: { factoryUrl },
    walletAlias,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = { walletAlias };
    let result;

    console.log({ body });

    if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' });

    try {
        result = await $fetch<unknown>(
            `${factoryUrl}/srv/smart-contract-execution-engine/api/scee/getUser/${token?.sub ?? ''}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            },
        );
    } catch {
        result = null;
    }

    if (!result?.walletAlias) {
        //If the user / wallet doesn't exist, create it
        await $fetch<unknown>(`${factoryUrl}/srv/smart-contract-execution-engine/api/scee/setUser`, {
            method: 'POST',
            body,
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        });
    }

    return result?.walletAlias ?? walletAlias;
});
