//const { marketInsightsUrl } = useRuntimeConfig();

export default defineEventHandler(async () => {
    //const token = await getToken({ event });

    // const results = await $fetch(`${marketInsightsUrl}/sectors`, {
    //     headers: {
    //         Authorization: `Bearer ${token?.access_token}`,
    //     },
    // });

    const results = {
        D: {
            dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
            data: [
                {
                    label: 'Sector 1',
                    data: [1000, 490, 230, 900],
                    backgroundColor: '#ACDC94',
                },
                {
                    label: 'Sector 2',
                    data: [1000, 490, 230, 900].reverse(),
                    backgroundColor: '#E9A364',
                },
                {
                    label: 'Sector 3',
                    data: [460, 900, 90, 380],
                    backgroundColor: '#5ABCCF',
                },
            ],
        },
        W: {
            dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [
                {
                    label: 'Sector 1',
                    data: [56, 490, 456, 465],
                    backgroundColor: '#ACDC94',
                },
                {
                    label: 'Sector 2',
                    data: [89, 490, 230, 900].reverse(),
                    backgroundColor: '#E9A364',
                },
                {
                    label: 'Sector 3',
                    data: [460, 12, 23, 67],
                    backgroundColor: '#5ABCCF',
                },
            ],
        },
        M: {
            dates: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
            data: [
                {
                    label: 'Sector 1',
                    data: [67, 73, 67, 38],
                    backgroundColor: '#ACDC94',
                },
                {
                    label: 'Sector 2',
                    data: [244, 490, 130, 289].reverse(),
                    backgroundColor: '#E9A364',
                },
                {
                    label: 'Sector 3',
                    data: [567, 23, 90, 907],
                    backgroundColor: '#5ABCCF',
                },
            ],
        },
    };

    return results;
});
