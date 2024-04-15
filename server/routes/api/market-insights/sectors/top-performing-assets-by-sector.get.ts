const generateRandomData = () => {
    const data: number[] = [];
    for (let i = 0; i < 12; i++) {
        data.push(Math.floor(Math.random() * 500)); // Generating random numbers between 0 and 499
    }
    return data;
};

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    //const token = await getToken({ event });

    // const results = await $fetch(`${marketInsightsUrl}/sectors`, {
    //     headers: {
    //         Authorization: `Bearer ${token?.access_token}`,
    //     },
    // });

    let sectors = [1, 2, 3];

    if (query.sectorId) {
        sectors = sectors.filter((sectorId: number) => sectorId === parseInt(query.sectorId as string));
    }

    const finalResults: Record<number, any> = {};

    sectors.forEach((sector: number) => {
        finalResults[sector] = [];

        //add 3 dummy assets
        for (let i = 0; i < 3; i++) {
            const newObject = {
                id: `Asset ${i + 1}`,
                name: `Asset ${i + 1}`,
                price: Math.floor(Math.random() * 100000),
                salesNum: Math.floor(Math.random() * 1000),
                change: 1,
                data: generateRandomData(),
            };

            finalResults[sector].push(newObject);
        }
    });

    if (query.sectorId) {
        return finalResults[parseInt(query.sectorId as string)];
    }

    return finalResults;
});
