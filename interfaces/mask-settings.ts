interface BaseSettings {
    name: string;
}

export interface DeleteSettings extends BaseSettings {}

export interface FakerSettings extends BaseSettings {
    replacer: string;
}

export interface LocationSettings extends BaseSettings {
    isLat: boolean;
}

export interface RangeSettings extends BaseSettings {
    interval: number;
}

export interface HashSettings extends BaseSettings {
    classification: string;
}

export enum MaskType {
    ANY = 'ANY',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
}

export interface MaskDetail {
    name: string;
    data_type: string;
}

export interface SortedMasks {
    STRING: MaskDetail[];
    NUMBER: MaskDetail[];
}
