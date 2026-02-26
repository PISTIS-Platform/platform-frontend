import { useDcatApCatalogSearch, useDcatApSearch } from '@/sdk';

export function useSelectedFacets() {
    const route = useRoute();
    const pistisMode = route.query.pm;
    const { refSyncedWithRouteQueryFacet } = useDcatApSearch();
    const licenseFacetOption = pistisMode === 'cloud' ? 'purchaseOfferLicense' : 'license';

    return {
        monetizationType: refSyncedWithRouteQueryFacet('monetizationType', [] as string[]),
        is_free: refSyncedWithRouteQueryFacet('is_free', [] as string[]),
        categories: refSyncedWithRouteQueryFacet('categories', [] as string[]),
        publisher: refSyncedWithRouteQueryFacet('publisher', [] as string[]),
        format: refSyncedWithRouteQueryFacet('format', [] as string[]),
        [licenseFacetOption]: refSyncedWithRouteQueryFacet('license', [] as string[]),
        catalog: refSyncedWithRouteQueryFacet('catalog', [] as string[]),
        isInvestmentActive: refSyncedWithRouteQueryFacet('investment_offer.is_active', [] as string[]),
        keywords: refSyncedWithRouteQueryFacet('keywords', [] as string[]),
        // DEU facets:
        ...(pistisMode === 'openData' && {
            // dataScope: refSyncedWithRouteQueryFacet('dataScope', [] as string[]),
            is_hvd: refSyncedWithRouteQueryFacet('is_hvd', [] as string[]),
            hvdCategory: refSyncedWithRouteQueryFacet('hvdCategory', [] as string[]),
            country: refSyncedWithRouteQueryFacet('country', [] as string[]),
            scoring: refSyncedWithRouteQueryFacet('scoring', [] as string[]),
            subject: refSyncedWithRouteQueryFacet('subject', [] as string[]),
            contactPoint: refSyncedWithRouteQueryFacet('contactPoint', [] as string[]),
            type: refSyncedWithRouteQueryFacet('type', [] as string[]),
        }),
    };
}

export function useSelectedFacetsCatalog() {
    const { refSyncedWithRouteQueryFacet } = useDcatApCatalogSearch();

    return {
        country: refSyncedWithRouteQueryFacet('country', [] as string[]),
        superCatalog: refSyncedWithRouteQueryFacet('superCatalog', [] as string[]),
    };
}
