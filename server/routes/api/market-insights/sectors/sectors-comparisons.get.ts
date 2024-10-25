export default defineEventHandler(async () => {
    const sectors = [
        {
            id: 1,
            label: 'Sector 1',
        },
        {
            id: 2,
            label: 'Sector 2',
        },
        {
            id: 3,
            label: 'Sector 3',
        },
    ];

    const timesData = ['January', 'February', 'March', 'April', 'May'];

    const sectorsSalesDataByIndex = [
        [20, 30, 65, 30, 60],
        [30, 60, 15, 40, 15],
        [50, 10, 20, 30, 25],
    ];

    const sectorsMarketCapDataByIndex = [
        [20, 10, 20, 30, 25],
        [20, 30, 65, 30, 60],
        [60, 60, 15, 40, 15],
    ];

    const sectorsData = {
        by_sales: sectors.map((sectorItem: Record<string, any>, index: number) => {
            return {
                label: sectorItem.label,
                percentages: sectorsSalesDataByIndex[index],
                total: Math.floor(Math.random() * 100),
            };
        }),
        by_market_cap: sectors.map((sectorItem: Record<string, any>, index: number) => {
            return {
                label: sectorItem.label,
                percentages: sectorsMarketCapDataByIndex[index],
                total: Math.floor(Math.random() * 100),
            };
        }),
    };

    return {
        timesData,
        sectorsData,
    };
});
