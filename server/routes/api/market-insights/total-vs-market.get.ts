export default defineEventHandler(async (_event) => {
    const labels = ['03 Wed', '04 Thu', '05 Fri', '06 Sat', '07 Sun', '08 Mon'];
    const totalAsset = {
        D: [20, 12, 39, 11, 52, 23],
        W: [20, 12, 39, 11, 52, 23],
        M: [],
    };

    const marketCap = {
        W: [11, 30, 22, 63, 52, 23],
        D: [11, 30, 22, 63, 52, 23],
        M: [],
    };

    return { labels, totalAsset, marketCap };
});
