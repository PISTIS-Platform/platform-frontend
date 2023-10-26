export default defineI18nConfig(() => ({
    legacy: false,
    numberFormats: {
        // FIXME: These are examples. We should adjust them accordingly
        en: {
            decimal: {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
            percent: {
                maximumFractionDigits: 2,
                maximumSignificantDigits: 3,
                style: 'percent',
                useGrouping: false,
            },
        },
    },
    messages: {
        en: {
            home: {
                home: 'Home',
                dashboard: 'Dashboard',
                analytics: 'Analytics',
            },
            data: {
                data: 'My Data',
                designer: 'Purchase / Subscription Plan Designer',
                log: 'Data Log',
                wallet: {
                    title: 'My Wallet',
                    balance: 'My Balance',
                    monthlyExpenses: 'Monthly Expenses',
                    monthlyIncome: 'Monthly Income',
                    transactions: {
                        title: 'My Transactions',
                        incoming: 'Incoming',
                        outgoing: 'Outgoing',
                    },
                },
                dmRepository: {
                    title: 'Data Model Repository',
                    dmAddTitle: 'Add Data Model Repository',
                    upload: 'Upload New Artefact',
                    select: 'Select file',
                    drag: 'or drag and drop',
                    noFile: 'No file selected',
                    fileName: 'File name:',
                    invalid: 'Invalid file type.',
                    uploadButton: 'Upload',
                    formTitle: 'Title:',
                    formVersion: 'Version:',
                    formDescription: 'Description:',
                    search: 'Search data models',
                    addDataset: 'Add new dataset',
                    tableFields: {
                        id: 'ID',
                        title: 'Title',
                        year: 'Date',
                        size: 'Size (MB)',
                        version: 'Version',
                        country: 'Country',
                    },
                },
            },
            market: {
                market: 'PISTIS Market',
                store: 'Store',
                log: 'Log',
            },
            transactions: {
                transactions: 'My Transactions',
                details: 'Details',
                overview: 'Overview',
            },
            user: {
                profile: 'Your Profile',
                settings: 'Settings',
                signOut: 'Sign out',
            },
        },
    },
}));
