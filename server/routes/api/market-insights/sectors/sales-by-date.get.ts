const generateRandomData = () => {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 100));
};

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    let sectors = [
        {
            id: 1,
            label: 'Sector 1',
        },
        {
            id: 2,
            label: 'Sector 2',
        },
        {
            id: 3,
            label: 'Sector 3',
        },
    ];

    if (query.sectorId) {
        sectors = sectors.filter((sector: Record<string, any>) => sector.id === parseInt(query.sectorId as string));
    }

    const results = {
        D: {
            dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
            data: sectors.map((sector: Record<string, any>) => {
                return {
                    label: sector.label,
                    data: generateRandomData(),
                };
            }),
        },
        W: {
            dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: sectors.map((sector: Record<string, any>) => {
                return {
                    label: sector.label,
                    data: generateRandomData(),
                };
            }),
        },
        M: {
            dates: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
            data: sectors.map((sector: Record<string, any>) => {
                return {
                    label: sector.label,
                    data: generateRandomData(),
                };
            }),
        },
    };

    return results;
});
