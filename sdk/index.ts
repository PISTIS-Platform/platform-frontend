/**
 * Create feature project specific SDK.
 * @piveau/sdk-vue and @piveau/sdk-core provide the necessary tools
 * to create a feature project specific SDK.
 */

import { schemaCatalog, SchemaDataset } from '@piveau/sdk-core';
import { dcatApDataset, defineHubSearch, getTranslationFor } from '@piveau/sdk-vue';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

import { useApiService } from '~/services/apiService';

import type { EnhancedSearchResult } from '../pages/catalog/useDatasetsSearchView';

export function useDcatApSearch() {
    const route = useRoute();
    const pistisMode = route.query.pm;
    const { getSearchUrl } = useApiService(pistisMode);

    return defineHubSearch(
        {
            baseUrl: getSearchUrl(),
            index: 'dataset',
            indexDetails: 'datasets',
            schema: SchemaDataset,
            facets: [
                'monetizationType',
                'is_free',
                'categories',
                'publisher',
                'format',
                'license',
                'catalog',
                'investment_offer.is_active',
                'keywords',
            ],
        },
        (dataset, localeInstance) => {
            const { setup: dcatApDatasetSetup } = dcatApDataset({ baseUrlHubRepo: getSearchUrl() ?? '/' });
            const baseGetters = dcatApDatasetSetup(dataset, localeInstance);

            const getCatalogId = dataset.catalog.id;
            const getCatalogTitle = getTranslationFor(dataset.catalog.title, ['en']);

            const getDescriptionMarkup = DOMPurify.sanitize(marked(baseGetters.getDescription || '', { async: false }));

            const enhanced: EnhancedSearchResult = {
                getId: dataset.id || '',
                getTitle: baseGetters.getTitle || '',
                getDescription: baseGetters.getDescription || '',
                getPublisher: baseGetters.getPublisher,
                getFormats: baseGetters.getFormats || [],
                getSummary: [
                    { title: 'updated', text: baseGetters.getModified || '' },
                    {
                        title: 'category',
                        text: [
                            ...new Set(baseGetters.getCategories.map((cat) => getTranslationFor(cat.label, 'en'))),
                        ].join(', '),
                    },
                    { title: 'provider', text: baseGetters.getPublisher?.name || '' },
                    {
                        title: 'license',
                        text:
                            pistisMode === 'cloud'
                                ? dataset.monetization?.[0]?.purchase_offer?.[0]?.license?.label || ''
                                : baseGetters.getLicenses?.[0] || '',
                    },
                ],
                getCatalog: dataset.catalog.id,
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
    const pistisMode = route.query.pm;
    const { getSearchUrl } = useApiService(pistisMode);
    return defineHubSearch(
        {
            baseUrl: getSearchUrl(),
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
