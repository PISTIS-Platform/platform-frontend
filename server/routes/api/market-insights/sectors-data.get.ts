export default defineEventHandler(async (_event) => {
    const sectorsData = [
        {
            label: 'Sector 1',
            value: 'sector1',
        },
        {
            label: 'Sector 2',
            value: 'sector2',
        },
        {
            label: 'Sector 3',
            value: 'sector3',
        },
        {
            label: 'Sector 4',
            value: 'sector4',
        },
        {
            label: 'Sector 5',
            value: 'sector5',
        },
    ];

    return sectorsData;
});
