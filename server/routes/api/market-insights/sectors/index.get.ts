//const { marketInsightsUrl } = useRuntimeConfig();
// const sleep = (seconds: number) => {
//     return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
// };

export default defineEventHandler(async () => {
    //const token = await getToken({ event });

    // const results = await $fetch(`${marketInsightsUrl}/sectors`, {
    //     headers: {
    //         Authorization: `Bearer ${token?.access_token}`,
    //     },
    // });

    //await sleep(3);

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
