import * as R from 'ramda';

import { getToken } from '#auth';

const config = useRuntimeConfig();

import ComponentStatusData from '~/interfaces/component-status-data';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const services = await $fetch<Record<string, string>>(
        `${config.public.cloudUrl}/srv/factories-registry/api/factories/services-mapping`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        },
    );

    const componentStatusPromises = Object.keys(services).map(async (key: string) => {
        let active = false;
        const url = `${config.public.factoryUrl}${services[key]}/api/health`.replace('//', '/');
        try {
            const result = await $fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            });

            if (result?.status === 'ok') {
                active = true;
            }
        } catch (error) {
            console.error(`Error fetching health for ${key}:`, error);
        } finally {
            return {
                title: key,
                active,
            };
        }
    });

    const componentStatuses: ComponentStatusData[] = await Promise.all(componentStatusPromises);

    const sortByTitle = R.sortBy(R.compose(R.toLower, R.prop('title')));

    return sortByTitle(componentStatuses);
});
