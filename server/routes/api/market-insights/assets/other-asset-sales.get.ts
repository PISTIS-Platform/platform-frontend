export default defineEventHandler(async (_event) => {
    const sales_data = {
        D: {
            label: 'Other Asset Name',
            borderColor: '#7BA6A2',
            backgroundColor: '#7BA6A2',
            data: [10, 22, 93, 33].reverse(),
        },

        W: {
            label: 'Other Asset Name',
            borderColor: '#7BA6A2',
            backgroundColor: '#7BA6A2',
            data: [10, 22, 93, 33],
        },

        M: [],
    };
    return { sales_data };
});
