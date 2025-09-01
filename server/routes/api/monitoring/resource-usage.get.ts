import { PrometheusDriver } from 'prometheus-query';

const { prometheusUrl, factoryName } = useRuntimeConfig();

import UsageStatsData from '~/interfaces/usage-stats-data';

const resourceMap: Record<string, Record<string, string>> = {
    develop: {
        nodeName: 'agent',
    },
    acme: {
        nodeName: 'workers',
    },
};

const getPrometheusResult = async (q: string, percentageMultiplier = 100) => {
    const prom = new PrometheusDriver({
        endpoint: prometheusUrl,
        baseURL: '/api/v1', // default value
    });

    const result: Record<string, any> = await prom.instantQuery(q).then((res) => {
        return res.result;
    });

    if (!result || !result.length) {
        return null;
    }

    return Number((result[0].value.value * percentageMultiplier).toFixed(2));
};

const getDiskUsageByVolume = async (volume: string, percentageMultiplier: number = 100) => {
    const q = `max without (instance, node) (
            (
                (
                    topk(1, otel_k8s_volume_capacity_bytes{k8s_namespace_name="default", k8s_persistentvolumeclaim_name="${volume}"})
                -
                    topk(1, otel_k8s_volume_available_bytes{k8s_namespace_name="default", k8s_persistentvolumeclaim_name="${volume}"})
                )
            )
            /
            topk(1, otel_k8s_volume_capacity_bytes{k8s_namespace_name="default", k8s_persistentvolumeclaim_name="${volume}"})
        *
            100
        )
    `;

    return getPrometheusResult(q, percentageMultiplier);
};

export default defineEventHandler(async (_event) => {
    const nodeName = resourceMap[factoryName].nodeName;

    // CPU percentage
    const cpuQuery = `
        sum(otel_k8s_node_cpu_usage{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'})
        /
        sum(otel_k8s_node_allocatable_cpu{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'})
    `;
    const cpuPercentage = await getPrometheusResult(cpuQuery);

    // Memory utilisation percentage
    const memoryUtilisationQuery = `
        sum(otel_k8s_node_memory_usage_bytes{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'}) 
        / 
        sum(otel_k8s_node_allocatable_memory_bytes{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'})
    `;

    const memoryUtilisationPercentage = await getPrometheusResult(memoryUtilisationQuery);

    // Minio & Postgres
    const minioUsagePercentage = await getDiskUsageByVolume('minio', 1);
    const mongoDbUsagePercentage = await getDiskUsageByVolume('datadir-mongodb-0', 1);
    const postgresUsagePercentage = await getDiskUsageByVolume('postgresql-1', 1);

    //  Elasticsearch Instances
    const esInstancePercentage = await getDiskUsageByVolume('elasticsearch-data-eck-elasticsearch-es-default-0', 1);

    //  General usage stats
    const usageStatsData: UsageStatsData[] = [
        {
            key: 'cpu',
            percentage: cpuPercentage,
        },
        {
            key: 'memory',
            percentage: memoryUtilisationPercentage,
        },
        {
            key: 'minio',
            percentage: minioUsagePercentage,
        },
        {
            key: 'mongoDb',
            percentage: mongoDbUsagePercentage,
        },
        {
            key: 'postgres',
            percentage: postgresUsagePercentage,
        },
        {
            key: 'esInstance',
            percentage: esInstancePercentage,
        },
    ];

    return usageStatsData;
});
