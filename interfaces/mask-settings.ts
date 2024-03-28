export interface FakerSettings {
    replacer: string;
}

export interface LocationSettings {
    isLat: boolean;
}

export interface RangeSettings {
    interval: number;
}

export interface HashSettings {
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
    config?: Config[];
    outcome?: string;
}

export interface SortedMasks {
    STRING: MaskDetail[];
    NUMBER: MaskDetail[];
}

export interface Config {
    name: string;
    [key: string]: string | number | string[];
}

export interface ConfigEmit {
    mask: string;
    config: Config;
}

export interface ObfuscationBody {
    [key: string | number]: Config[];
}
