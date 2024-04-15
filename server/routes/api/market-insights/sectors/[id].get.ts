//const { marketInsightsUrl } = useRuntimeConfig();
// const sleep = (seconds: number) => {
//     return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
// };

export default defineEventHandler(async (event) => {
    const sectorId = getRouterParam(event, 'id');

    //TODO:: if the structure remains like this we should look how to do translations in labels (can it be done in nitro?)

    return {
        id: sectorId,
        name: 'Sector 1',
        changeTimeframeAgo: {
            D: [
                {
                    label: 'Total Sales',
                    change: 12,
                    value: 700,
                },
                {
                    label: 'Total Revenue',
                    change: 34,
                    value: 523,
                },
                {
                    label: 'Market Cap',
                    change: -18.4,
                    value: 900,
                },
            ],
            W: [
                {
                    label: 'Total Sales',
                    change: 14,
                    value: 230,
                },
                {
                    label: 'Total Revenue',
                    change: -23.9,
                    value: 123,
                },
                {
                    label: 'Market Cap',
                    change: 18.4,
                    value: 340,
                },
            ],
            M: [
                {
                    label: 'Total Sales',
                    change: 18.9,
                    value: 1700,
                },
                {
                    label: 'Total Revenue',
                    change: 23,
                    value: 4059,
                },
                {
                    label: 'Market Cap',
                    change: 32,
                    value: 9504,
                },
            ],
        },
    };
});
