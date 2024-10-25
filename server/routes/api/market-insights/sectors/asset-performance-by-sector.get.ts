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

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    let sectors = [1, 2, 3];

    if (query.sectorId) {
        sectors = sectors.filter((sectorId: number) => sectorId === parseInt(query.sectorId as string));
    }

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

    if (query.sectorId) {
        return finalResults[parseInt(query.sectorId as string)];
    }

    return finalResults;
});
