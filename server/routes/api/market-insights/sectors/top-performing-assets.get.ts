export default defineEventHandler(async () => {
    return [
        {
            id: 1,
            name: 'Asset 1',
            price: 21130,
            salesNum: 40,
            change: 1,
            data: [23, 45, 79, 324, 34, 456, 23, 45, 79, 324, 34, 456],
        },
        {
            id: 2,
            name: 'Asset 2',
            price: 90000,
            salesNum: 40,
            change: 1,
            data: [78, 45, 120, 120, 134, 140, 23, 12, 79, 123, 34, 300],
        },
        {
            id: 3,
            name: 'Asset 3',
            price: 34000,
            salesNum: 28,
            change: 1,
            data: [123, 30, 120, 324, 134, 90, 23, 45, 79, 90, 34, 50],
        },
    ];
});
