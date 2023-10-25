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
                wallet: 'My Wallet',
                designer: 'Purchase / Subscription Plan Designer',
                log: 'Data Log',
                dmRepository: {
                    title: 'Data Model Repository',
                    dmAddTitle: 'Add Data Model Repository',
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
