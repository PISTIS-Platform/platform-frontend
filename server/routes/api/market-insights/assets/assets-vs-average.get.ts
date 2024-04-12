export default defineEventHandler(async (_event) => {
    const labels = ['January', 'February', 'March', 'April'];
    //TODO: Possibly translate 'average' for front-end / chart display
    const aviation = {
        D: [
            {
                label: 'Asset 1',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [20, 12, 39, 11],
            },
            {
                label: 'Asset 2',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [11, 20, 12, 39],
            },
            {
                label: 'Asset 3',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [8, 40, 32, 16],
            },
            {
                label: 'Asset 4',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [32, 15, 21, 18],
            },
            {
                label: 'Average',
                borderColor: 'gray',
                backgroundColor: 'gray',
                data: [11, 20, 12, 39].reverse(),
            },
        ],
        W: [
            {
                label: 'Asset 1',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [20, 12, 39, 11].reverse(),
            },
            {
                label: 'Asset 2',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [11, 20, 12, 39].reverse(),
            },
            {
                label: 'Asset 3',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [8, 40, 32, 16].reverse(),
            },
            {
                label: 'Asset 4',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [32, 15, 21, 18].reverse(),
            },
            {
                label: 'Average',
                borderColor: 'gray',
                backgroundColor: 'gray',
                data: [11, 20, 12, 39],
            },
        ],
        M: [],
    };

    const energy = {
        W: [
            {
                label: 'Asset 1',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [20, 12, 39, 11],
            },
            {
                label: 'Asset 2',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [11, 20, 12, 39],
            },
            {
                label: 'Asset 3',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [8, 40, 32, 16],
            },
            {
                label: 'Asset 4',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [32, 15, 21, 18],
            },
            {
                label: 'Average',
                borderColor: 'gray',
                backgroundColor: 'gray',
                data: [11, 20, 12, 39].reverse(),
            },
        ],
        D: [
            {
                label: 'Asset 1',
                borderColor: '#7BA3A2',
                backgroundColor: '#7BA3A2',
                data: [20, 12, 39, 11].reverse(),
            },
            {
                label: 'Asset 2',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [11, 20, 12, 39].reverse(),
            },
            {
                label: 'Asset 3',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [8, 40, 32, 16].reverse(),
            },
            {
                label: 'Asset 4',
                borderColor: '#4B6C6C',
                backgroundColor: '#4B6C6C',
                data: [32, 15, 21, 18].reverse(),
            },
            {
                label: 'Average',
                borderColor: 'gray',
                backgroundColor: 'gray',
                data: [11, 20, 12, 39],
            },
        ],
        M: [],
    };

    return { labels, energy, aviation };
});
