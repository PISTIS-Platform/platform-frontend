//TODO: Handle colors in front end
export default defineEventHandler(async (_event) => {
    const sales_data = {
        D: {
            label: 'Asset Name',
            borderColor: '#7BA3A2',
            backgroundColor: '#7BA3A2',
            data: [10, 22, 93, 33],
        },

        W: {
            label: 'Asset Name',
            borderColor: '#7BA3A2',
            backgroundColor: '#7BA3A2',
            data: [10, 22, 93, 33].reverse(),
        },

        M: {},
    };
    return { sales_data };
});
