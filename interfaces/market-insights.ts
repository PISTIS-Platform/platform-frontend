export interface BasicAsset {
    id?: number; //TODO:: perhaps do not make this optional
    name: string;
    price: number;
    change: number;
    salesNum?: number;
    data: number[];
}

export interface BasicSector {
    value: number;
    label: string;
    change?: number;
}

export interface SectorCard {
    id: number;
    name: string;
    changeTimeframeAgo: Record<
        string,
        {
            label: string;
            change: number;
            value: number;
        }[]
    >;
}

export type SectorSalesByTimeframe = Record<
    string,
    {
        dates: string[];
        data: {
            label: string;
            data: number;
        }[];
    }
>;

export type SectorDataItem = {
    label: string;
    percentages: number[];
    total: number;
};

export interface SectorsComparisonData {
    timesData: string[];
    sectorsData: Record<string, SectorDataItem[]>;
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
