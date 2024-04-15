export default defineEventHandler(async (_event) => {
    const latestTransactions = [
        { id: 1, asset_name: 'Asset 10', transaction_date: '07/01/2024', sector: 'Sector 1', price: 52 },
        { id: 2, asset_name: 'Asset 10', transaction_date: '11/12/2023', sector: '', price: 4 },
        { id: 3, asset_name: 'Asset 10', transaction_date: '07/09/2023', sector: '', price: 56 },
        { id: 4, asset_name: 'Asset 10', transaction_date: '29/10/2023', sector: 'Sector 1', price: 2 },
        { id: 5, asset_name: 'Asset 10', transaction_date: '17/09/2023', sector: 'Sector 3', price: 12 },
        { id: 6, asset_name: 'Asset 10', transaction_date: '13/01/2024', sector: '', price: 34 },
        { id: 7, asset_name: 'Asset 10', transaction_date: '17/08/2023', sector: 'Sector 4', price: 86 },
        { id: 8, asset_name: 'Asset 10', transaction_date: '07/02/2024', sector: 'Sector 3', price: 42 },
        { id: 9, asset_name: 'Asset 10', transaction_date: '14/09/2023', sector: 'Sector 2', price: 36 },
        { id: 10, asset_name: 'Asset 10', transaction_date: '25/01/2024', sector: '', price: 73 },
        { id: 11, asset_name: 'Asset 10', transaction_date: '07/09/2023', sector: 'Sector 4', price: 64 },
        { id: 12, asset_name: 'Asset 10', transaction_date: '02/09/2023', sector: 'Sector 1', price: 94 },
        { id: 13, asset_name: 'Asset 10', transaction_date: '13/10/2023', sector: 'Sector 4', price: 61 },
        { id: 14, asset_name: 'Asset 10', transaction_date: '02/01/2024', sector: 'Sector 1', price: 14 },
        { id: 15, asset_name: 'Asset 10', transaction_date: '17/03/2024', sector: 'Sector 4', price: 73 },
        { id: 16, asset_name: 'Asset 10', transaction_date: '02/07/2023', sector: '', price: 53 },
        { id: 17, asset_name: 'Asset 10', transaction_date: '20/10/2023', sector: 'Sector 1', price: 97 },
        { id: 18, asset_name: 'Asset 10', transaction_date: '05/08/2023', sector: 'Sector 4', price: 21 },
        { id: 19, asset_name: 'Asset 10', transaction_date: '11/10/2023', sector: 'Sector 1', price: 53 },
        { id: 20, asset_name: 'Asset 10', transaction_date: '31/07/2023', sector: 'Sector 1', price: 29 },
    ];

    return latestTransactions;
});
