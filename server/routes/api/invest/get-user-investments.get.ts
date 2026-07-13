const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    const results = await $fetch<Record<string, any>[]>(
        `${cloudUrl}/srv/investment-planner/api/investment-planner/user-investments`,
        {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        },
    );

    if (!results.length) return [];

    // Enrich each investment with the dataset title/description from the search
    // service. These calls are best-effort: if the search service is down (503)
    // or fails for a given asset, we fall back to 'N/A' below rather than failing
    // the whole request.
    const settled = await Promise.allSettled(
        results.map((result: Record<string, any>) =>
            $fetch<Record<string, any>>(
                `${cloudUrl}/srv/search/search?q=${result.cloudAssetId}&filters=dataset&includes=title,description`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.token}`,
                    },
                },
            ),
        ),
    );

    const datasetResults = settled.map((outcome) =>
        outcome.status === 'fulfilled' ? outcome.value?.result?.results?.[0] : undefined,
    );

    const finalResults = results.map((result: Record<string, any>, index: number) => ({
        assetId: result.cloudAssetId,
        shares: result.shares,
        price: result.investmentPlan.price,
        total: Number((result.shares * result.investmentPlan.price).toFixed(2)),
        expirationDate: result.investmentPlan.dueDate,
        title: datasetResults[index]?.title?.en || 'N/A',
        description: datasetResults[index]?.description?.en || 'N/A',
        investmentPlan: result.investmentPlan,
        date: result.createdAt,
    }));

    return finalResults;
});
