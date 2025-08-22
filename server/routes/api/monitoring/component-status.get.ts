import * as R from 'ramda';

import { getToken } from '#auth';

const config = useRuntimeConfig();

import ComponentStatusData from '~/interfaces/component-status-data';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const newServices = {
        // 'analytics-engine': '',
        // eslint-disable-next-line prettier/prettier
        Anonymizer: [],
        'Asset Description Bundler': ['/srv/asset-description-bundler/api/health/'],
        'On/Off platform contract inspector': [],
        'Data Check-in': [],
        'Data Factory Connector': ['/srv/data-connector/api/health'],
        'Identity Wallet': [],
        'Data Quality Assessment': ['/srv/data-quality-assessment/api/health/'],
        'Data Transformation': [],
        'FAIR Data Valuation': [],
        'Distributed Query': [],
        'DLT FIAT Wallet': [],
        'Encryption/Decryption': [],
        'Factory Data Storage': ['/srv/factory-data-storage/api/health'],
        'GDPR Checker': ['/srv/gdpr-checker/ready'],
        'Insights Generator': [],
        // 'job-configurator': '',
        // 'ledger-validator': '',
        'Lineage Tracker': [],
        'Factory Data Catalog': ['/srv/catalog'],
        'Smart contract template composer': ['/srv/sctc/api/health'],
        'Smart Contract Execution Engine': ['/srv/smart-contract-execution-engine/ready'],
    };

    const componentStatusPromises = Object.entries(newServices).map(async ([key, value]: [string, string[]]) => {
        let active = 'false';
        const url = `${config.public.factoryUrl}${value}`;
        if (value.length === 0) {
            return {
                title: key,
                active: 'N/A',
            };
        }
        if (key === 'Factory Data Catalog') {
            const repo = await $fetch(`${config.public.factoryUrl}/srv/repo/health`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
                timeout: 5000,
            });
            const search = await $fetch(`${config.public.factoryUrl}/srv/search/health`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
                timeout: 5000,
            });

            const mqa = await $fetch(`${config.public.factoryUrl}/srv/mqa/health`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
                timeout: 5000,
            });
            if (repo?.status === 'UP' && search?.status === 'UP' && mqa?.status === 'UP') {
                active = 'true';
            }
            return {
                title: key,
                active,
            };
        } else {
            try {
                const result = await $fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token?.access_token}`,
                    },
                    timeout: 5000,
                });
                if (result === 'Service is up and running') {
                    active = 'true';
                } else if (result?.success) {
                    active = 'true';
                } else if (result?.status.toLowerCase() === 'ok') {
                    active = 'true';
                }
            } catch (error) {
                console.error(`Error fetching health for ${key}:`, error);
            } finally {
                return {
                    title: key,
                    active,
                };
            }
        }
    });

    const componentStatuses: ComponentStatusData[] = await Promise.all(componentStatusPromises);

    const sortByTitle = R.sortBy(R.compose(R.toLower, R.prop('title')));

    return sortByTitle(componentStatuses);
});
