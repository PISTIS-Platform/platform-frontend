export default defineEventHandler(async (_event) => {
    const worstPerformanceAsset = [
        { id: 1, asset_name: 'Asset 10', price: '$5.55', total_sales: 150, market_cap: '238', change: -20 },
        { id: 2, asset_name: 'Asset 11', price: '$8.37', total_sales: 2264, market_cap: '7488', change: -36 },
        { id: 3, asset_name: 'Asset 12', price: '$5.52', total_sales: 2098, market_cap: '2821', change: -200 },
        { id: 4, asset_name: 'Asset 13', price: '$8.90', total_sales: 2233, market_cap: '214', change: -43 },
        { id: 5, asset_name: 'Asset 14', price: '$1.27', total_sales: 1008, market_cap: '661', change: -86 },
        { id: 6, asset_name: 'Asset 15', price: '$8.94', total_sales: 1695, market_cap: '181', change: -73 },
        { id: 7, asset_name: 'Asset 16', price: '$4.13', total_sales: 1591, market_cap: '138', change: -62 },
        { id: 8, asset_name: 'Asset 17', price: '$1.94', total_sales: 2440, market_cap: '536', change: -842 },
        { id: 9, asset_name: 'Asset 18', price: '$6.28', total_sales: 2346, market_cap: '982', change: -934 },
        { id: 10, asset_name: 'Asset 19', price: '$0.07', total_sales: 2181, market_cap: '2333', change: -178 },
        { id: 11, asset_name: 'Asset 20', price: '$4.84', total_sales: 570, market_cap: '5238', change: -468 },
        { id: 12, asset_name: 'Asset 21', price: '$8.24', total_sales: 956, market_cap: '127', change: -23 },
        { id: 13, asset_name: 'Asset 22', price: '$0.58', total_sales: 1150, market_cap: '3005', change: -97 },
        { id: 14, asset_name: 'Asset 23', price: '$9.24', total_sales: 2608, market_cap: '242', change: -24 },
        { id: 15, asset_name: 'Asset 24', price: '$4.90', total_sales: 1390, market_cap: '789', change: -37 },
        { id: 16, asset_name: 'Asset 25', price: '$1.43', total_sales: 2880, market_cap: '2065', change: -23 },
        { id: 17, asset_name: 'Asset 26', price: '$1.75', total_sales: 1236, market_cap: '3127', change: -76 },
        { id: 18, asset_name: 'Asset 27', price: '$6.82', total_sales: 2676, market_cap: '66471', change: -42 },
        { id: 19, asset_name: 'Asset 28', price: '$7.23', total_sales: 507, market_cap: '257', change: -68 },
        { id: 20, asset_name: 'Asset 29', price: '$3.38', total_sales: 2461, market_cap: '3103', change: -32 },
    ];

    return worstPerformanceAsset;
});
