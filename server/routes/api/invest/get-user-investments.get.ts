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

    const datasetResults: Record<string, any>[] = [];

    for (let i = 0; i < results.length; i++) {
        const innerResult = await $fetch<Record<string, any>>(
            `${cloudUrl}/srv/search/search?q=${results[i].cloudAssetId}&filters=dataset&includes=title,description`,
        );
        datasetResults.push(innerResult.result.results[0]);
    }

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
