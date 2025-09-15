/**
 * Represents the additional keys added to the MaskTile config by the faker settings component.
 */
export interface FakerSettings {
    replacer: string;
}

/**
 * Represents the addtional keys added to the MaskTile config by the location settings component.
 */
export interface LocationSettings {
    isLat: boolean;
}

/**
 * Represents the addtional keys added to the MaskTile config by the range settings component.
 */
export interface RangeSettings {
    interval: number;
}

/**
 * Represents the addtional keys added to the MaskTile config by the hash settings component.
 */
export interface HashSettings {
    classification: string;
}

/**
 * Represents the type of data that a mask is applicable to.
 */
export enum MaskType {
    ANY = 'ANY',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
}

/**
 * Represents details of a mask as retrieved from the anonymiser backend.
 */
export interface MaskDetail {
    name: string;
    data_type: string;
    config?: Config[];
    outcome?: string;
}

/**
 * Represents an object that contains masks sorted by which type of data they are applicable to.
 */
export interface SortedMasks {
    STRING: MaskDetail[];
    NUMBER: MaskDetail[];
}

/**
 * Represents a configuration of MaskTile.
 */
export interface Config {
    name: string;
    [key: string]: string | number | string[];
}

/**
 * Represents the object that is emitted by the MaskTile configChange event.
 */
export interface ConfigEmit {
    mask: string;
    config: Config;
}

/**
 * Represents the request body of a call to the anonymiser backend to invoke obfuscation endpoints.
 */
export interface ObfuscationBody {
    [key: string | number]: Config[];
}
