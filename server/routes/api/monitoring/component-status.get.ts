import * as R from 'ramda';

import { getToken } from '#auth';

const config = useRuntimeConfig();

import ComponentStatusData from '~/interfaces/component-status-data';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const services = await $fetch(`${config.public.cloudUrl}/srv/factories-registry/api/factories/services-mapping`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    const componentStatuses: ComponentStatusData[] = [];

    Object.keys(services).forEach(async (key: string) => {
        let active = false;

        try {
            const result = await $fetch(`${config.public.cloudUrl}${services[key]}/api/health`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            });

            if (result.status === 'ok') {
                active = true;
            }
        } catch {
            //TODO: Do something more advanced with errors here
        }

        componentStatuses.push({
            title: key,
            active,
        });
    });

    // const componentStatuses: ComponentStatusData[] = [
    //     {
    //         title: 'Data Exchange Governance',
    //         active: true,
    //     },
    //     {
    //         title: 'Data Explorer',
    //         active: false,
    //     },
    //     {
    //         title: 'Monetary Transactions Facility',
    //         active: true,
    //     },
    //     {
    //         title: 'Asset Offering Designer',
    //         active: true,
    //     },
    //     {
    //         title: 'Monetization XAI Engine',
    //         active: false,
    //     },
    //     {
    //         title: 'Models Repository',
    //         active: true,
    //     },
    //     {
    //         title: 'System Services',
    //         active: false,
    //     },
    //     {
    //         title: 'Identity Manager',
    //         active: false,
    //     },
    // ];

    const sortByTitle = R.sortBy(R.compose(R.toLower, R.prop('title')));

    console.log(componentStatuses);

    return sortByTitle(componentStatuses);
});
