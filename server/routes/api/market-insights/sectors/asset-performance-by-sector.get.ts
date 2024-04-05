//const { marketInsightsUrl } = useRuntimeConfig();
interface Asset {
    id: number;
    name: string;
    value: number;
}

const generateAssetsArray = (numAssets = 5): Asset[] => {
    const assets: Asset[] = [];
    for (let i = 1; i <= numAssets; i++) {
        const asset: Asset = {
            id: i,
            name: `Asset ${i}`,
            value: Math.floor(Math.random() * 1000),
        };
        assets.push(asset);
    }
    return assets;
};

export default defineEventHandler(async () => {
    //const token = await getToken({ event });

    // const results = await $fetch(`${marketInsightsUrl}/sectors`, {
    //     headers: {
    //         Authorization: `Bearer ${token?.access_token}`,
    //     },
    // });

    const sectors = [1, 2, 3];

    const sortByOptions = ['total_sales', 'market_cap', 'price', 'percentage_change', 'acquisition_date'];

    const rankOptions = ['top', 'worst'];

    const finalResults: Record<string, any> = {};

    //Prepare dummy data
    sectors.forEach((sector: number) => {
        finalResults[sector] = {
            top: {},
            worst: {},
        };

        rankOptions.forEach((rankingOption: string) => {
            sortByOptions.forEach((sortByOption: string) => {
                finalResults[sector][rankingOption][sortByOption] = generateAssetsArray();
            });
        });
    });

    return finalResults;
});
