import { defineStore } from 'pinia';

import { type Dataset, type Metadata, type Preview, type Report, type TableRow } from '~/interfaces/dataset-preview';
import { type SortedMasks } from '~/interfaces/mask-settings';
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
            previewFetchCode: 0,
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
        /**
         * Get response code upon fetching preview.
         *
         * @returns HTTP status code
         */
        getPreviewFetchCode(): number {
            return this.previewFetchCode;
        },
    },
    actions: {
        /**
         * Overwrite the currently stored preview with another.
         *
         * @param preview Dataset preview to overwrite existing one with.
         */
        changePreview(preview: Preview): void {
            const { dataset, metadata, report } = preview;
            this.datasetPreview = dataset;
            this.metadata = metadata;
            this.report = report;
            this.tableRows = formatPreview(dataset) as TableRow[];
            this.columns = Object.keys(dataset);
        },
        /**
         * Fetch preview the user's currently stored dataset from the anonymiser.
         */
        async fetchPreview(): Promise<void> {
            const response = await useFetch('/api/anonymizer/preview');
            const data: any = response.data.value;

            const result: Preview = data.result;
            if (result) {
                this.changePreview(result);
            }
            this.previewFetchCode = data.code;
        },
        /**
         * Overwrite the list of currently available mask names.
         *
         * @param masks Masks sorted by type.
         */
        changeMasks(masks: SortedMasks): void {
            this.masks = masks;
        },
    },
});
