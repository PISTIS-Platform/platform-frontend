export default defineEventHandler(async (_event) => {
    const topPerformanceAsset = [
        { id: 1, asset_name: 'Asset 1', price: '$2.89', total_sales: 1903, market_cap: '914', change: 10 },
        { id: 2, asset_name: 'Asset 2', price: '$3.56', total_sales: 1817, market_cap: '51', change: 23 },
        { id: 3, asset_name: 'Asset 3', price: '$7.11', total_sales: 1415, market_cap: '1526', change: 12.5 },
        { id: 4, asset_name: 'Asset 4', price: '$3.22', total_sales: 1776, market_cap: '387', change: 50 },
        { id: 5, asset_name: 'Asset 5', price: '$3.55', total_sales: 2107, market_cap: '3537', change: 48 },
        { id: 6, asset_name: 'Asset 6', price: '$8.36', total_sales: 996, market_cap: '476', change: 238 },
        { id: 7, asset_name: 'Asset 7', price: '$1.50', total_sales: 2360, market_cap: '126', change: 89 },
        { id: 8, asset_name: 'Asset 8', price: '$5.72', total_sales: 1111, market_cap: '1677', change: 57 },
        { id: 9, asset_name: 'Asset 9', price: '$9.03', total_sales: 831, market_cap: '2026', change: 96 },
        { id: 10, asset_name: 'Asset 30', price: '$2.33', total_sales: 1376, market_cap: '5550', change: 540 },
        { id: 11, asset_name: 'Asset 31', price: '$8.52', total_sales: 798, market_cap: '8934', change: 63 },
        { id: 12, asset_name: 'Asset 32', price: '$8.01', total_sales: 1484, market_cap: '3024', change: 97 },
        { id: 13, asset_name: 'Asset 56', price: '$3.47', total_sales: 1520, market_cap: '695', change: 26 },
        { id: 14, asset_name: 'Asset 87', price: '$8.22', total_sales: 309, market_cap: '89', change: 49 },
        { id: 15, asset_name: 'Asset 96', price: '$5.31', total_sales: 491, market_cap: '2532', change: 75 },
        { id: 16, asset_name: 'Asset 85', price: '$4.81', total_sales: 266, market_cap: '1120', change: 897 },
        { id: 17, asset_name: 'Asset 34', price: '$8.77', total_sales: 184, market_cap: '3873', change: 521 },
        { id: 18, asset_name: 'Asset 42', price: '$2.96', total_sales: 1314, market_cap: '6292', change: 39 },
        { id: 19, asset_name: 'Asset 26', price: '$8.33', total_sales: 2719, market_cap: '162', change: 72 },
        { id: 20, asset_name: 'Asset 54', price: '$5.37', total_sales: 1453, market_cap: '255', change: 93 },
    ];

    return topPerformanceAsset;
});
