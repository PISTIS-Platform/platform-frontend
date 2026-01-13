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

const isDevAcme = factoryName === 'develop' || factoryName === 'acme';

const getPrometheusResult = async (q: string) => {
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

    return Number(result[0].value.value.toFixed(2));
};

const getDiskUsageByVolume = async (volume: string) => {
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

    return getPrometheusResult(q);
};

const getVCDiskUsagePerPod = async (pod: string, volume: string) => {
    const q = `(
      (
        max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"${pod}.*", k8s_volume_name="${volume}"})
        -
        max(otel_k8s_volume_available_bytes{namespace="default", pod=~"${pod}.*", k8s_volume_name="${volume}"})
      )
      /
      max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"${pod}.*", k8s_volume_name="${volume}"})
      * 100
    )`;

    return getPrometheusResult(q);
};

const getVirtualClusterStats = async (): Promise<UsageStatsData[]> => {
    //CPU percentage
    const cpuPercentage = await getPrometheusResult(`
        (
            sum(otel_k8s_pod_cpu_usage{namespace="default"})
            /
            sum(otel_kube_node_status_capacity{resource="cpu", unit="core"})
        ) * 100
    `);

    //Memory percentage
    const memoryPercentage = await getPrometheusResult(`
    (
      sum(otel_k8s_pod_memory_working_set_bytes{namespace="default"})
      /
      sum(otel_kube_node_status_capacity{resource="memory", unit="byte"})
    ) * 100
    `);

    //Minio, Mongo, PostgreSQL and ES
    const minioPercentage = await getVCDiskUsagePerPod('minio', 'data');
    const mongoPercentage = await getVCDiskUsagePerPod('mongodb', 'datadir');
    const postgreSQLPercentage = await getVCDiskUsagePerPod('postgresql', 'pgdata');
    const elasticPercentage = await getVCDiskUsagePerPod('eck-elasticsearch', 'elasticsearch-data');

    return [
        {
            key: 'cpu',
            percentage: cpuPercentage,
        },
        {
            key: 'memory',
            percentage: memoryPercentage,
        },
        {
            key: 'minio',
            percentage: minioPercentage,
        },
        {
            key: 'mongoDb',
            percentage: mongoPercentage,
        },
        {
            key: 'postgres',
            percentage: postgreSQLPercentage,
        },
        {
            key: 'esInstance',
            percentage: elasticPercentage,
        },
    ];
};

const getDevelopAcmeStats = async (): Promise<UsageStatsData[]> => {
    const nodeName = resourceMap[factoryName].nodeName;

    // CPU percentage
    const cpuPercentage = await getPrometheusResult(`
        (
            sum(otel_k8s_node_cpu_usage{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'})
            /
            sum(otel_k8s_node_allocatable_cpu{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'})
        ) * 100
    `);

    // Memory percentage
    const memoryUtilisationPercentage = await getPrometheusResult(`
        (
            sum(otel_k8s_node_memory_usage_bytes{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'}) 
            / 
            sum(otel_k8s_node_allocatable_memory_bytes{k8s_cluster_name='${factoryName}', k8s_node_name=~'.*${nodeName}.*'})
        ) * 100
    `);

    // Minio, Mongo, PostgreSQL & ES
    const minioUsagePercentage = await getDiskUsageByVolume('minio');
    const mongoDbUsagePercentage = await getDiskUsageByVolume('datadir-mongodb-0');
    const postgresUsagePercentage = await getDiskUsageByVolume('postgresql-1');
    const esInstancePercentage = await getDiskUsageByVolume('elasticsearch-data-eck-elasticsearch-es-default-0');

    return [
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
};

export default defineEventHandler(async (_event) => {
    return isDevAcme ? getDevelopAcmeStats() : getVirtualClusterStats();
});
