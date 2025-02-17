import { getToken } from '#auth';
import { useUserStore } from '~/store/user';
// import type { TransactionsType } from '~/interfaces/wallet-transactions';
const userStore = useUserStore();

const {
    public: { factoryUrl },
    walletAlias,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = JSON.stringify({ walletAlias });
    let result;
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
        console.log('User not found');
        await $fetch<unknown>(`${factoryUrl}/srv/smart-contract-execution-engine/api/scee/setUser`, {
            method: 'POST',
            body,
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        });
    }

    userStore.setWalletAlias(result?.walletAlias ?? walletAlias);

    return result?.walletAlias ?? walletAlias;
});
