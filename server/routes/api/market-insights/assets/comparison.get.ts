export default defineEventHandler(async (_event) => {
    const labels = ['January', 'February', 'March', 'April'];

    //TODO: Possibly translate 'Sector' and 'Total' for front-end display
    const sales = {
        D: [
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
