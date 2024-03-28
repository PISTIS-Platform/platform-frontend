export interface Dataset {
    [key: string | number]: (string | null)[] | (number | null)[];
}

export interface Metadata {
    types: {
        [key: string | number]: string;
    };
    recommendation: TableRow;
    fakerOptions: string[];
}

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
