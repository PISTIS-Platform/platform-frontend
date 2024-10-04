export interface Dataset {
    [key: string | number]: (string | null)[] | (number | null)[];
}

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

export interface TableRow {
    [key: string | number]: string | number;
}

export interface Preview {
    dataset: Dataset;
    metadata: Metadata;
    report: Report;
}

export interface Solution {
    transformation: { [key: string | number]: number };
    informationLoss: string;
}
