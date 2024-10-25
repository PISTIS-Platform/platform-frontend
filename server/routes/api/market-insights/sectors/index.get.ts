export default defineEventHandler(async () => {
    return [
        {
            value: 1,
            label: 'Sector 1',
            change: 5.6,
        },
        {
            value: 2,
            label: 'Sector 2',
            change: 7.6,
        },
        {
            value: 3,
            label: 'Sector 3',
            change: -8.6,
        },
    ];
});
