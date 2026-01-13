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

//-----------------------------------------------------------------------------------------------

export default defineEventHandler(async (_event) => {
    // Case #1: Factory is 'develop' or 'acme'

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

    // Minio, Mongo & Postgres
    const minioUsagePercentage = await getDiskUsageByVolume('minio', 1);
    const mongoDbUsagePercentage = await getDiskUsageByVolume('datadir-mongodb-0', 1);
    const postgresUsagePercentage = await getDiskUsageByVolume('postgresql-1', 1);

    //  Elasticsearch Instances
    const esInstancePercentage = await getDiskUsageByVolume('elasticsearch-data-eck-elasticsearch-es-default-0', 1);

    // ---------------------------------------------------------------------------------------------

    //Case #2: Factory is not 'develop' or 'acme'

    //CPU Usage
    const otherCpuQuery = `
    (
      sum(otel_k8s_pod_cpu_usage{namespace="default"})
      /
      sum(otel_kube_node_status_capacity{resource="cpu", unit="core"})
    ) * 100
  `;
    const otherCpuPercentage = await getPrometheusResult(otherCpuQuery);

    //Memory usage
    const otherMemoryUtilisationQuery = `
    (
      sum(otel_k8s_pod_memory_working_set_bytes{namespace="default"})
      /
      sum(otel_kube_node_status_capacity{resource="memory", unit="byte"})
    ) * 100
    `;
    const otherMemoryUtilisationPercentage = await getPrometheusResult(otherMemoryUtilisationQuery);

    //Minio
    const otherMinioUsageQuery = `
    (
      (
        max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"minio.*", k8s_volume_name="data"})
        -
        max(otel_k8s_volume_available_bytes{namespace="default", pod=~"minio.*", k8s_volume_name="data"})
      )
      /
      max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"minio.*", k8s_volume_name="data"})
    ) * 100
    `;
    const otherMinioUsagePercentage = await getPrometheusResult(otherMinioUsageQuery);

    //MongoDB
    const otherMongoDBUsageQuery = `
      (
        max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"mongodb.*", k8s_volume_name="datadir"})
        -
        max(otel_k8s_volume_available_bytes{namespace="default", pod=~"mongodb.*", k8s_volume_name="datadir"})
      )
      /
      max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"mongodb.*", k8s_volume_name="datadir"})
      ) * 100
    `;
    const otherMongoDbUsagePercentage = await getPrometheusResult(otherMongoDBUsageQuery);

    //PostgreSQL
    const otherPostgreSQLUsageQuery = `
    (
      (
        max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"postgresql.*", k8s_volume_name="pgdata"})
        -
        max(otel_k8s_volume_available_bytes{namespace="default", pod=~"postgresql.*", k8s_volume_name="pgdata"})
      )
      /
      max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"postgresql.*", k8s_volume_name="pgdata"})
    ) * 100
    `;
    const otherPostgresUsagePercentage = await getPrometheusResult(otherPostgreSQLUsageQuery);

    //Elastic Search
    const otherESQuery = `
    (
      (
        max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"eck-elasticsearch.*", k8s_volume_name="elasticsearch-data"})
        -
        max(otel_k8s_volume_available_bytes{namespace="default", pod=~"eck-elasticsearch.*", k8s_volume_name="elasticsearch-data"})
      )
      /
      max(otel_k8s_volume_capacity_bytes{namespace="default", pod=~"eck-elasticsearch.*", k8s_volume_name="elasticsearch-data"})
    ) * 100
    `;
    const otherEsInstancePercentage = await getPrometheusResult(otherESQuery);

    // ---------------------------------------------------------------------------------------------

    //  Final usage stats
    const usageStatsData: UsageStatsData[] = [
        {
            key: 'cpu',
            percentage: isDevAcme ? cpuPercentage : otherCpuPercentage,
        },
        {
            key: 'memory',
            percentage: isDevAcme ? memoryUtilisationPercentage : otherMemoryUtilisationPercentage,
        },
        {
            key: 'minio',
            percentage: isDevAcme ? minioUsagePercentage : otherMinioUsagePercentage,
        },
        {
            key: 'mongoDb',
            percentage: isDevAcme ? mongoDbUsagePercentage : otherMongoDbUsagePercentage,
        },
        {
            key: 'postgres',
            percentage: isDevAcme ? postgresUsagePercentage : otherPostgresUsagePercentage,
        },
        {
            key: 'esInstance',
            percentage: isDevAcme ? esInstancePercentage : otherEsInstancePercentage,
        },
    ];

    return usageStatsData;
});
