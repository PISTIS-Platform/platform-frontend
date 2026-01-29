export default defineEventHandler(async (event) => {
    // helpers function
    const toArray = <T>(value?: T | T[]): T[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    };

    const { datasetId } = getQuery(event);
    const config = useRuntimeConfig();

    if (!datasetId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'datasetId is required',
        });
    }

    const authHeader = getHeader(event, 'authorization');

    if (!authHeader) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Missing Authorization header',
        });
    }

    const deleteInfo = {
        distributions: [] as Array<{
            id: string;
            title?: string;
        }>,
        metricsDeleted: false,
        dataQualityDeleted: false,
    };

    const baseUrl = config.public.factoryUrl;
    const endpoint = `${baseUrl}/srv/repo/datasets/${datasetId}`;
    const apiKey = config.piveauHubRepoXApiKey;
    const dataStorageApi = `${baseUrl}/srv/factory-data-storage/api`;
    const authToken = authHeader.replace('Bearer ', '');
    const metricsApi = `${baseUrl}/datasets/${datasetId}/metrics`;
    const dataQualityApi = `${baseUrl}/resources/data-quality/${datasetId}`;

    // load dataset
    const datasetResponse = await fetch(endpoint, {
        method: 'GET',
    });

    if (!datasetResponse.ok) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to load dataset distributions',
        });
    }

    const dataset = await datasetResponse.json();
    const graph = dataset['@graph'] ?? [];
    const datasetNode = graph.find((n: any) => n['@type'] === 'dcat:Dataset');

    if (!datasetNode) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Dataset node not found in graph',
        });
    }

    // get distributions
    const distributionRefs = toArray(datasetNode['dcat:distribution']);

    const distributions = graph.filter(
        (n: any) => n['@type'] === 'dcat:Distribution' && distributionRefs.some((d: any) => d?.['@id'] === n['@id']),
    );

    // delete distributions
    for (const dist of distributions) {
        const distId = dist['@id'];
        const titles = toArray(dist['dct:title']);
        const isStream = titles.some((t: any) => t === 'Kafka Stream' || t?.en === 'Kafka Stream');
        const formats = toArray(dist['dct:format']);
        const format = formats[0]?.['@id'] ?? '';
        const accessUrls = toArray(dist['dcat:accessURL']);
        const accessUrl = accessUrls[0]?.['@id'];

        let assetUuid: string | undefined;

        if (accessUrl) {
            const url = new URL(accessUrl);
            assetUuid = url.searchParams.get('asset_uuid') ?? undefined;
        }

        if (!isStream && assetUuid) {
            try {
                // delete data storage for non stream dataset
                const isSql = format.endsWith('/SQL');

                if (isSql) {
                    await fetch(`${dataStorageApi}/tables/delete_table?asset_uuid=${assetUuid}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${authToken}` },
                    });
                } else {
                    await fetch(`${dataStorageApi}/files/delete_file?asset_uuid=${assetUuid}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${authToken}` },
                    });
                }

                https: deleteInfo.distributions.push({
                    id: distId,
                    title: dist['dct:title'],
                });
            } catch (err) {
                console.error('Failed to delete distribution', distId, err);
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Failed to delete dataset distributions',
                });
            }
        }
    }

    // verify all distributions are deleted
    for (const dist of distributions) {
        const distId = dist['@id'];
        const accessUrls = toArray(dist['dcat:accessURL']);
        const accessUrl = accessUrls[0]?.['@id'];

        let assetUuid: string | undefined;

        if (accessUrl) {
            const url = new URL(accessUrl);
            assetUuid = url.searchParams.get('asset_uuid') ?? undefined;
        }

        if (!accessUrl || !assetUuid) continue;

        try {
            const checkResponse = await fetch(accessUrl, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (![400, 404].includes(checkResponse.status)) {
                throw createError({
                    statusCode: 409,
                    statusMessage: `Distribution ${distId} is still accessible (status ${checkResponse.status})`,
                });
            }
        } catch (err: any) {
            if (err?.statusCode) {
                throw err;
            }

            throw createError({
                statusCode: 500,
                statusMessage: `Failed to verify deletion of distribution ${distId}`,
            });
        }
    }

    // delete dataset metrics
    const deleteMetrics = await fetch(metricsApi, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!deleteMetrics.ok) {
        const msg = await deleteMetrics.text();
        throw createError({
            statusCode: 500,
            statusMessage: `Delete failed: ${msg}`,
        });
    }

    deleteInfo.metricsDeleted = true;

    // delete data quality
    const deleteDataQuality = await fetch(dataQualityApi, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!deleteDataQuality.ok) {
        const msg = await deleteDataQuality.text();
        throw createError({
            statusCode: 500,
            statusMessage: `Delete failed: ${msg}`,
        });
    }

    deleteInfo.dataQualityDeleted = true;

    // delete Dataset
    const deleteResponse = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
    });

    if (!deleteResponse.ok) {
        const msg = await deleteResponse.text();
        throw createError({
            statusCode: 500,
            statusMessage: `Delete failed: ${msg}`,
        });
    }

    return {
        success: true,
        info: deleteInfo,
    };
});
