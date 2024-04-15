export default defineEventHandler(async (_event) => {
    const rollingAssetsData = [
        {
            name: 'Asset 1',
            price: 20000,
            change: 4.6,
            data: [13, 56, 34, 20, 34, 45, 60],
        },
        {
            name: 'Asset 2',
            price: 45000,
            change: 9.6,
            data: [13, 56, 34, 20, 34, 45, 60].reverse(),
        },
        {
            name: 'Asset 3',
            price: 90000,
            change: -5.6,
            data: [90, 16, 34, 20, 34, 45, 60],
        },
        {
            name: 'Asset 4',
            price: 90000,
            change: 0,
            data: [13, 56, 34, 20, 34, 45, 60],
        },
    ];

    return rollingAssetsData;
});
