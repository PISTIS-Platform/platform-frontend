export interface BasicAsset {
    id: number;
    name: string;
    price: number;
    change: number;
    data: number[];
}

export interface BasicSector {
    name: string;
    change: number;
}
