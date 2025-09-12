import { type Dataset, type Report, type TableRow } from '~/interfaces/dataset-preview';

/**
 * Format a `Dataset` object to a format that is compatible with
 * NuxtUI's UTable component.
 *
 * @param dataset dataset to format.
 * @returns List of table rows.
 */
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

/**
 * Retrieve a list of column names that are sensitive or quasi identifying from a `Report`.
 *
 * @param report report to fetch sensitive column names from
 * @returns a list of column names that are sensitive.
 */
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
