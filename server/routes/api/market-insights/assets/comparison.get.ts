export default defineEventHandler(async (_event) => {
    const labels = ['January', 'February', 'March', 'April'];

    //TODO: Internal call to isolated asset sales data to feed it below where 'Asset Name' is

    //TODO: Possibly translate 'Sector' and 'Total' for front-end display
    const sales = {
        D: [
            {
                label: 'Asset Name',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [20, 12, 39, 11],
            },
            {
                label: 'Sector',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [30, 40, 100, 50],
            },
            {
                label: 'Total',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [90, 120, 300, 150],
            },
        ],
        W: [
            {
                label: 'Asset Name',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [20, 12, 39, 11].reverse(),
            },
            {
                label: 'Sector',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [30, 40, 100, 50].reverse(),
            },
            {
                label: 'Total',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [90, 120, 300, 150].reverse(),
            },
        ],
        M: [],
    };

    const market_cap = {
        W: [
            {
                label: 'Asset Name',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [40, 24, 78, 22],
            },
            {
                label: 'Sector',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [60, 80, 200, 100],
            },
            {
                label: 'Total',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [180, 240, 600, 300],
            },
        ],
        D: [
            {
                label: 'Asset Name',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [40, 24, 78, 22].reverse(),
            },
            {
                label: 'Sector',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [60, 80, 200, 100].reverse(),
            },
            {
                label: 'Total',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [180, 240, 600, 300].reverse(),
            },
        ],
        M: [],
    };

    return { labels, sales, market_cap };
});
