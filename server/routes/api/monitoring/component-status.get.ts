import * as R from 'ramda';

import { getToken } from '#auth';

const config = useRuntimeConfig();

import ComponentStatusData from '~/interfaces/component-status-data';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const newServices = {
        Anonymizer: ['/srv/anonymiser/api/test'],
        'Asset Description Bundler': ['/srv/asset-description-bundler/api/health/'],
        'Contract Inspector': ['/srv/contract-inspector-on-platform/api/health'],
        'Job Configurator': ['/srv/data-check-in/api/health'],
        'Data Factory Connector': ['/srv/data-connector/api/health'],
        'Identity Wallet': ['/srv/data-factory-user-wallet/health'],
        'Data Quality Assessment': ['/srv/data-quality-assessor/api/health/'],
        'Data Transformation': ['/srv/data-transformation/api/health'],
        'FAIR Data Valuation': ['/srv/data-valuation-service/api/health/'],
        'Distributed Query': ['/srv/distributed-query/api/health'],
        'DLT FIAT Wallet': ['/srv/payments/v0/dlt/health_checker'],
        'Encryption/Decryption': ['/srv/encryption-decryption-engine/health'],
        'Factory Data Storage': ['/srv/factory-data-storage/api/health'],
        'GDPR Checker': ['/srv/gdpr-checker/ready'],
        'Insights Generator': ['/srv/insights-generator/api/health'],
        'Lineage Tracker': ['/srv/lineage-tracker/api/health'],
        'Factory Data Catalog': ['/srv/catalog'],
        'Smart Contract Template Composer': ['/srv/sctc/api/health'],
        'Smart Contract Execution Engine': ['/srv/smart-contract-execution-engine/ready'],
        'Data Enrichment': ['/srv/data-enrichment-backend/api/health'],
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

                if (key === 'Distributed Query') {
                    if (result?.toLowerCase() === 'ok') {
                        active = 'true';
                    }
                } else if (key === 'Data Enrichment') {
                    if (result === 'Service is up and running') {
                        active = 'true';
                    }
                } else if (result === true) {
                    active = 'true';
                } else if (result === 'Service is up and running') {
                    active = 'true';
                } else if (result?.success) {
                    active = 'true';
                } else if (
                    result?.status.toLowerCase() === 'ok' ||
                    result?.status.toLowerCase() === 'success' ||
                    result?.status.toLowerCase() === 'up'
                ) {
                    active = 'true';
                } else if (result?.toLowerCase() === 'ok') {
                    active = 'true';
                } else if (result?.code === 200) {
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
