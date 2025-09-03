/**
 * Create feature project specific SDK.
 * @piveau/sdk-vue and @piveau/sdk-core provide the necessary tools
 * to create a feature project specific SDK.
 */

import { schemaCatalog, SchemaDataset } from '@piveau/sdk-core';
import { dcatApDataset, defineHubSearch, getTranslationFor } from '@piveau/sdk-vue';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

import type { EnhancedSearchResult } from '../composables/useDatasetsSearchView';

const config = useRuntimeConfig();
let appUrl = '';

export function useDcatApSearch() {
    const route = useRoute();
    if (route.query.pm === 'factory') {
        appUrl = config.public.factoryUrl + '/srv/search/';
    } else {
        appUrl = config.public.cloudUrl + '/srv/search/';
    }
    return defineHubSearch(
        {
            baseUrl: appUrl,
            index: 'dataset',
            indexDetails: 'datasets',
            schema: SchemaDataset,
            facets: ['monetizationType', 'is_free', 'categories', 'publisher', 'format', 'license', 'catalog'],
        },
        (dataset, localeInstance) => {
            const { setup: dcatApDatasetSetup } = dcatApDataset({ baseUrlHubRepo: appUrl ?? '/' });
            const baseGetters = dcatApDatasetSetup(dataset, localeInstance);

            const getCatalogId = dataset.catalog.id;
            const getCatalogTitle = getTranslationFor(dataset.catalog.title, ['de']);

            const getDescriptionMarkup = DOMPurify.sanitize(marked(baseGetters.getDescription || '', { async: false }));

            const enhanced: EnhancedSearchResult = {
                getId: dataset.id || '',
                getTitle: baseGetters.getTitle || '',
                getDescription: baseGetters.getDescription || '',
                getPublisher: baseGetters.getPublisher,
                getFormats: baseGetters.getFormats || [],
                getSummary: [
                    { title: 'updated', text: baseGetters.getIssued || baseGetters.getModified || '' },
                    {
                        title: 'category',
                        text: [
                            ...new Set(baseGetters.getCategories.map((cat) => getTranslationFor(cat.label, 'de'))),
                        ].join(', '),
                    },
                    { title: 'provider', text: baseGetters.getPublisher?.name || '' },
                    { title: 'license', text: baseGetters.getLicenses?.[0] || '' },
                ],
            };

            return {
                ...baseGetters,
                ...enhanced,
                getCatalogId,
                getCatalogTitle,
                getDescriptionMarkup,
            };
        },
    );
}

export function useDcatApCatalogSearch() {
    const route = useRoute();
    if (route.query.pm === 'factory') {
        appUrl = config.public.factoryUrl + '/srv/search/';
    } else {
        appUrl = config.public.cloudUrl + '/srv/search/';
    }
    return defineHubSearch(
        {
            baseUrl: appUrl,
            index: 'catalogue',
            indexDetails: 'catalogues',
            schema: schemaCatalog,
            facets: ['country', 'superCatalog'],
        },
        (dataset, localeInstance) => {
            const { currentLocale: locale } = localeInstance;

            const enhanced: EnhancedSearchResult = {
                getId: dataset.id || '',
                getTitle: getTranslationFor(dataset.title, [locale]) || '',
                getDescription: getTranslationFor(dataset.description, [locale]) || '',
                getPublisher: dataset.publisher,
                getFormats: [],
                getSummary: [],
            };

            return enhanced;
        },
    );
}
