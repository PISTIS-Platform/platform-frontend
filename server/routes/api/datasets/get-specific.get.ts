import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = await getQuery(event);

    const catalogResults: string[] = await $fetch(`${factoryUrl}/srv/search/datasets?catalogue=my-data`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    if (!catalogResults.length || !catalogResults.includes(query.id as string)) {
        return null;
    }

    const finalResult: Record<string, any> = await $fetch(`${factoryUrl}/srv/search/datasets/${query.id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    return finalResult.result;
});
