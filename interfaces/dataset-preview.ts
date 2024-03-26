export interface Dataset {
    [key: string | number]: (string | null)[] | (number | null)[];
}

export interface Metadata {
    types: {
        [key: string | number]: string;
    };
}

export interface Report {
    [key: string | number]: {
        classification: string;
        sensitivity: string;
    };
}

export interface tableRow {
    [key: string | number]: string | number | null;
}
