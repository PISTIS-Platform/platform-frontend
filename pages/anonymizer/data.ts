import { Dataset, Report, TableRow } from '~/interfaces/dataset-preview';

//Format preview rows to be compatible with Nuxt UI row attribute
export function formatPreview(dataset: Dataset): TableRow[] {
    const columns: string[] = Object.keys(dataset);
    const previewSize: number = dataset[columns[0]].length;

    const rows = [];

    for (let i = 0; i < previewSize; i++) {
        const row: TableRow = {};

        columns.forEach((column: string) => {
            row[column] = dataset[column][i]!;
        });

        rows.push(row);
    }

    return rows;
}

//Retrieve list of sensitive column names
export function getSensitiveColumns(report: Report): string[] {
    //Create temp copy to avoid altering anonymizerStore
    const tempReport = { ...report };
    const columns = Object.keys(tempReport);

    columns.forEach((column) => {
        if (report[column]['sensitivity'] === 'INSENSITIVE') {
            delete tempReport[column];
        }
    });

    return Object.keys(tempReport);
}
