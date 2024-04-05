export interface BasicAsset {
    name: string;
    price: number;
    change: number;
    data: number[];
}

export interface BasicSector {
    value: number;
    label: string;
    change: number;
}

export interface AssetPerformanceList {
    top: Record<
        string,
        {
            id: number;
            name: string;
            value: number | string;
        }[]
    >;
    worst: Record<
        string,
        {
            id: number;
            name: string;
            value: number | string;
        }[]
    >;
}
