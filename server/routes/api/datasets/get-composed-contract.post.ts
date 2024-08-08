import { getToken } from '#auth';

const { smartContractTemplateComposerUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = await readBody(event);

    return $fetch(`${smartContractTemplateComposerUrl}/smart-contract-template-composer/compose`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
