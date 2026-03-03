import { PrometheusDriver } from 'prometheus-query';

const { prometheusUrl, factoryName } = useRuntimeConfig();

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

    return Number(result[0].value.value);
};

const getPodVolumeMetric = async (name: string, volume: string) => {
    const pod = isDevAcme ? 'k8s_pod_name' : 'pod';

    const capacity = await getPrometheusResult(
        `sum(otel_k8s_volume_capacity_bytes{${pod}=~"${name}.*", k8s_cluster_name="${factoryName}", k8s_volume_name="${volume}"})`,
    );

    const available = await getPrometheusResult(
        `sum(otel_k8s_volume_available_bytes{${pod}=~"${name}.*", k8s_cluster_name="${factoryName}", k8s_volume_name="${volume}"})`,
    );

    return { capacity, available };
};

export default defineEventHandler(async (_event) => {
    const cpu = await getPrometheusResult(`sum(rate(otel_k8s_pod_cpu_time_seconds_total[5m]))`); // Calculates the per-second increase in CPU time over the last 5 minutes.
    const memory = await getPrometheusResult(`sum(otel_k8s_pod_memory_working_set_bytes)`);

    const minio = await getPodVolumeMetric('minio', 'data');
    const mongodb = await getPodVolumeMetric('mongodb', 'datadir');
    const postgresql = await getPodVolumeMetric('postgresql', 'pgdata');
    const elasticsearch = await getPodVolumeMetric('eck-elasticsearch', 'elasticsearch-data');

    return {
        cpu,
        memory,
        volume: {
            minio,
            mongodb,
            postgresql,
            elasticsearch,
        },
    };
});
