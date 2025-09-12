/**
 * Represents dataset as fetched from the anonymiser backend.
 */
export interface Dataset {
    [key: string | number]: (string | null)[] | (number | null)[];
}

/**
 * Represents data metadata as fetched from the anonymiser backend.
 */
export interface Metadata {
    types: {
        [key: string | number]: string;
    };
    recommendation: TableRow;
    fakerOptions: string[];
    catalogueId: string;
}

/**
 * Basic structure of the response body from the Anonymiser.
 */
export interface AnonymiserResponse<T> {
    message: string;
    code: number;
    result?: T;
    error?: string;
}

/**
 * A record that stores all metadata about a user's dataset within the Anonymiser.
 */
export interface UserMetadata {
    userId: string;
    datasetName: string;
    report: Report;
    storageId: string;
    catalogueId: string;
    catalogueTitle: string;
}

/**
 * A sensitivity report that contains information about the sensitivity of a dataset's columns.
 * Each key corresponds to a column name.
 */
export interface Report {
    [key: string | number]: {
        classification: string;
        sensitivity: string;
    };
}

/**
 * Represents a row of tabular data as accepted by nuxt ui's table component.
 */
export interface TableRow {
    [key: string | number]: string | number;
}

/**
 * Represents the result of a call to an anonymiser backend preview component.
 */
export interface Preview {
    dataset: Dataset;
    metadata: Metadata;
    report: Report;
}

/**
 * Stores a preview of a dataset that has had k-anonymity applied to it.
 */
export interface KAnonPreview {
    dataset: string[][];
    riskMetrics: RiskMetrics;
}

/**
 * Represents a solution object as retrieved from the anonymiser backend.
 */
export interface Solution {
    transformation: { [key: string | number]: number };
    informationLoss: string;
}

/**
 * Stores data about the risk of reidentification posed to a dataset.
 */
export interface RiskMetrics {
    recordsAtRisk: number;
    highestRisk: number;
    successRate: number;
}
