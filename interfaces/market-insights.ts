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
