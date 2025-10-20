import { useDcatApCatalogSearch, useDcatApSearch } from '@/sdk';

export function useSelectedFacets() {
    const { refSyncedWithRouteQueryFacet } = useDcatApSearch();

    return {
        monetizationType: refSyncedWithRouteQueryFacet('monetizationType', [] as string[]),
        is_free: refSyncedWithRouteQueryFacet('is_free', [] as string[]),
        categories: refSyncedWithRouteQueryFacet('categories', [] as string[]),
        publisher: refSyncedWithRouteQueryFacet('publisher', [] as string[]),
        format: refSyncedWithRouteQueryFacet('format', [] as string[]),
        license: refSyncedWithRouteQueryFacet('license', [] as string[]),
        catalog: refSyncedWithRouteQueryFacet('catalog', [] as string[]),
        isInvestmentActive: refSyncedWithRouteQueryFacet('investment_offer.is_active', [] as string[]),
    };
}

export function useSelectedFacetsCatalog() {
    const { refSyncedWithRouteQueryFacet } = useDcatApCatalogSearch();

    return {
        country: refSyncedWithRouteQueryFacet('country', [] as string[]),
        superCatalog: refSyncedWithRouteQueryFacet('superCatalog', [] as string[]),
    };
}
