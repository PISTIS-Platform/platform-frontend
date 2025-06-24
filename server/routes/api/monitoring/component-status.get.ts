import * as R from 'ramda';

import { getToken } from '#auth';

const config = useRuntimeConfig();

import ComponentStatusData from '~/interfaces/component-status-data';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const results = await $fetch(`${config.public.cloudUrl}/srv/factories-registry/api/factories/services-mapping`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    console.log({ results });

    const componentStatuses: ComponentStatusData[] = [
        {
            title: 'Data Exchange Governance',
            active: true,
        },
        {
            title: 'Data Explorer',
            active: false,
        },
        {
            title: 'Monetary Transactions Facility',
            active: true,
        },
        {
            title: 'Asset Offering Designer',
            active: true,
        },
        {
            title: 'Monetization XAI Engine',
            active: false,
        },
        {
            title: 'Models Repository',
            active: true,
        },
        {
            title: 'System Services',
            active: false,
        },
        {
            title: 'Identity Manager',
            active: false,
        },
    ];

    const sortByTitle = R.sortBy(R.compose(R.toLower, R.prop('title')));

    return sortByTitle(componentStatuses);
});
