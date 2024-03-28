import { defineStore } from 'pinia';

import { Dataset, Metadata, Preview, Report, TableRow } from '~/interfaces/dataset-preview';
import { SortedMasks } from '~/interfaces/mask-settings';
import { formatPreview } from '~/pages/anonymizer/data';

//Store for sharing dataset previews across anonymizer components
export const useAnonymizerStore = defineStore('preview', {
    state: () => {
        return {
            datasetPreview: {},
            metadata: {
                types: {},
                recommendation: {} as TableRow,
                fakerOptions: [] as string[],
            },
            report: {} as Report,
            tableRows: [] as TableRow[],
            columns: [] as string[],
            masks: { STRING: [], NUMBER: [] } as SortedMasks,
        };
    },
    getters: {
        getPreview(): Dataset {
            return this.datasetPreview;
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
        getMasks(): SortedMasks {
            return this.masks;
        },
    },
    actions: {
        changePreview(preview: Preview): void {
            const { dataset, metadata, report } = preview;
            this.datasetPreview = dataset;
            this.metadata = metadata;
            this.report = report;
            this.tableRows = formatPreview(dataset) as TableRow[];
            this.columns = Object.keys(dataset);
        },
        changeMasks(masks: SortedMasks): void {
            this.masks = masks;
        },
    },
});
