interface IVolume {
    capacity: number;
    available: number;
}

export default interface UsageStatsData {
    cpu: number;
    memory: number;
    volume: {
        minio: IVolume;
        postgresql: IVolume;
        mongodb: IVolume;
        elasticsearch: IVolume;
    };
}
