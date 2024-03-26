import { defineStore } from 'pinia';

import { Dataset, Metadata, Preview, Report, TableRow } from '~/interfaces/dataset-preview';
import { formatPreview } from '~/pages/anonymizer/data';

//Store for sharing dataset previews across anonymizer components
export const usePreviewStore = defineStore('preview', {
    state: () => {
        return {
            dataset: {},
            metadata: {
                types: {},
            },
            report: {},
            tableRows: [] as TableRow[],
            columns: [] as string[],
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
        getTableRows(): TableRow[] {
            return this.tableRows;
        },
    },
    actions: {
        changePreview(preview: Preview): void {
            const { dataset, metadata, report } = preview;
            this.dataset = dataset;
            this.metadata = metadata;
            this.report = report;
            this.tableRows = formatPreview(dataset) as TableRow[];
            this.columns = Object.keys(dataset);
        },
    },
});
