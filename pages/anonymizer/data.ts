import { Dataset, Report, TableRow } from '~/interfaces/dataset-preview';

//Format preview rows to be compatible with Nuxt UI row attribute
export function formatPreview(dataset: Dataset): TableRow[] {
    const columns: string[] = Object.keys(dataset);
    const previewSize: number = dataset[columns[0]].length;

    const rows = [];

    for (let i = 0; i < previewSize; i++) {
        const row: TableRow = {};

        columns.forEach((column: string) => {
            row[column] = dataset[column][i];
        });

        rows.push(row);
    }

    return rows;
}

//Retrieve list of sensitive column names
export function getSensitiveColumns(report: Report): string[] {
    const columns = Object.keys(report);

    columns.forEach((column) => {
        if (report[column]['sensitivity'] === 'INSENSITIVE') {
            delete report[column];
        }
    });

    return Object.keys(report);
}
