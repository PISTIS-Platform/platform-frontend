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
