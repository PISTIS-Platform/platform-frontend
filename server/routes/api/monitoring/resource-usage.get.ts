import { PrometheusDriver } from 'prometheus-query';

const { prometheusUrl } = useRuntimeConfig();

import UsageStatsData from '~/interfaces/usage-stats-data';

const getPrometheusResult = async (q: string, percentageMultiplier = 100) => {
    const prom = new PrometheusDriver({
        endpoint: prometheusUrl,
        baseURL: '/api/v1', // default value
    });

    const result: Record<string, any> = await prom.instantQuery(q).then((res) => {
        return res.result;
    });

    if (!result || !result.length) {
        throw createError({
            statusCode: 400,
            statusMessage: 'An error occurred, no resource usage stats were found',
        });
    }

    return Number((result[0].value.value * percentageMultiplier).toFixed(2));
};

const getDiskUsageByVolume = async (volume: string, percentageMultiplier: number = 100) => {
    const q = `max without (instance, node) (
      (
        (
            topk(1, otel_k8s_volume_capacity{k8s_namespace_name="default",k8s_persistentvolumeclaim_name="${volume}"})
          -
            topk(1, otel_k8s_volume_available{k8s_namespace_name="default",k8s_persistentvolumeclaim_name="${volume}"})
        )
      )
    /
      topk(1, otel_k8s_volume_capacity{k8s_namespace_name="default",k8s_persistentvolumeclaim_name="${volume}"})
  *
    100
)`;

    return getPrometheusResult(q, percentageMultiplier);
};

export default defineEventHandler(async (_event) => {
    //CPU percentage
    const cpuQuery = `(
  sum(otel_k8s_node_cpu_utilization{k8s_cluster_name='cloud', k8s_node_name=~'.*agent.*'})
  /
  sum(kube_node_status_capacity{resource='cpu', node=~'.*agent.*'})
)`;

    const cpuPercentage = await getPrometheusResult(cpuQuery);

    //Memory utilisation percentage
    const memoryUtilisationQuery = `(
  sum(otel_k8s_node_memory_usage{k8s_cluster_name='cloud', k8s_node_name=~'.*agent.*'})
  /
  sum(kube_node_status_capacity{resource='memory', node=~'.*agent.*'})
)`;

    const memoryUtilisationPercentage = await getPrometheusResult(memoryUtilisationQuery);

    //Disk Usage Stats

    //Minio & Postgres
    const minioUsagePercentage = await getDiskUsageByVolume('minio', 1);
    const mongoDbUsagePercentage = await getDiskUsageByVolume('datadir-mongodb-0', 1);
    const postgresUsagePercentage = await getDiskUsageByVolume('postgresql-1', 1);

    //Elasticsearch Instances
    const esInstance1Percentage = await getDiskUsageByVolume('elasticsearch-data-elasticsearch-es-default-0', 1);
    const esInstance2Percentage = await getDiskUsageByVolume('elasticsearch-data-elasticsearch-es-default-1', 1);
    const esInstance3Percentage = await getDiskUsageByVolume('elasticsearch-data-elasticsearch-es-default-2', 1);

    //Elasticsearch average percentage
    const elasticSearchAvgPercentage = Number(
        ((esInstance1Percentage + esInstance2Percentage + esInstance3Percentage) / 3).toFixed(2),
    );

    //General disk usage stats
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
            key: 'elasticSearchAvg',
            percentage: elasticSearchAvgPercentage,
            extraInfo: [
                {
                    key: 'esInstance1',
                    value: esInstance1Percentage,
                },
                {
                    key: 'esInstance2',
                    value: esInstance2Percentage,
                },
                {
                    key: 'esInstance3',
                    value: esInstance3Percentage,
                },
            ],
        },
    ];

    return usageStatsData;
});
