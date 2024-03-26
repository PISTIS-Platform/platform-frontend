import { defineStore } from 'pinia';

import { Dataset, Metadata, Report, tableRow } from '~/interfaces/dataset-preview';

//Store for sharing dataset previews across anonymizer components
export const usePreviewStore = defineStore('preview', {
    state: () => {
        return {
            dataset: {},
            metadata: {
                types: {},
            },
            report: {},
            tableRows: [{}],
        };
    },
    getters: {
        getDataset(): Dataset {
            return this.dataset;
        },
        getMetadata(): Metadata {
            return this.metadata;
        },
        getReport(): Report {
            return this.report;
        },
        getTableRows(): tableRow[] {
            return this.tableRows;
        },
    },
    actions: {
        changeDataset(dataset: Dataset): void {
            this.dataset = dataset;
        },
        changeMetadata(metadata: Metadata): void {
            this.metadata = metadata;
        },
        changeReport(report: Report) {
            this.report = report;
        },
        changeTableRows(tableRows: tableRow[]): void {
            this.tableRows = tableRows;
        },
    },
});
