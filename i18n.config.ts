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
            intervals: {
                daily: 'Daily',
                weekly: 'Weekly',
                monthly: 'Monthly',
            },
            before: {
                day: '1D',
                week: '1W',
                month: '1M',
            },
            addNew: 'Add new',
            cancel: 'Cancel',
            yes: 'Yes',
            no: 'No',
            submit: 'Submit',
            title: 'Title',
            price: 'Price',
            percentage: 'Percentage',
            license: 'License',
            description: 'Description',
            termsConditions: 'Terms and conditions',
            keywords: 'Keywords',
            times: 'times',
            perDay: 'per day',
            perWeek: 'per week',
            perMonth: 'per month',
            perYear: 'per year',
            monthly: 'monthly',
            annual: 'annual',
            learnMore: 'Learn More',
            frequency: 'Frequency',
            or: 'or',
            sortBy: 'Sort By',
            compareBy: 'Compare By',
            val: {
                atLeastNumberChars: 'Must be at least {count} characters',
                validNumber: 'Please enter a valid number',
                zeroOrPositive: 'Must be 0 or a positive number',
                positive: 'Must be a positive number',
            },
            home: {
                home: 'Home',
                dashboard: 'Dashboard',
                analytics: 'Analytics',
            },
            data: {
                data: 'My Data',
                designer: {
                    free: 'Free',
                    paid: 'Paid',
                    priceHigherThanZero: 'Price needs to be higher than zero',
                    title: 'Publish Data',
                    completeDataset: 'Complete Dataset',
                    selectDataset: 'Select the complete dataset',
                    queryFilter: 'Query / Filter',
                    selectQueryFilter: 'Select a subset of the dataset',
                    datasetSelection: 'Dataset Selection',
                    datasetSelectionInfo: 'Search for and select the dataset you wish to put on the market',
                    selectDifferent: 'Select a different dataset',
                    areYouSure: 'Are you sure?',
                    willReset: 'Any configuration you have made will be reset',
                    searchDataset: 'Search for a dataset...',
                    selectSearchDataset: 'Select / search for a dataset',
                    assetTitle: 'Asset Title',
                    assetDescription: 'Asset Description',
                    atLeastNumberChars: 'Must be at least {count} characters',
                    assetOfferingDetails: 'Asset Offering Details',
                    assetOfferingDetailsInfo: 'More info here',
                    titleOfAsset: 'Title of the asset',
                    descriptionOfAsset: 'Type a description for the asset here',
                    keywordsOfAsset: 'Type keywords separated by commas or use the Enter button',
                    fairTitle: 'FAIR Data Valuation Suggestions',
                    fairInfo: 'Find out more here',
                    suggestedOneOff: 'Suggested One-off Price',
                    suggestedSubscription: 'Suggested Subscription Price',
                    oneOffSale: 'One-off Sale',
                    oneOffSaleInfo: 'Info here',
                    subscription: 'Subscription',
                    subscriptionInfo: 'Info here',
                    nft: 'NFT',
                    nftInfo: 'Info here',
                    investmentPlan: 'Investment Plan',
                    investmentPlanInfo: 'Info here',
                    monetizationMethod: 'Monetization Method',
                    monetizationMethodInfo: 'Info here',
                    oneOffPrice: 'One-off Sale price',
                    oneOffKind: 'One-off Sale kind',
                    assetPrice: 'Price of the asset',
                    selectLicense: 'Select a license',
                    typeTerms: 'Type the terms and conditions of your license here',
                    downloadLimit: 'Download limit',
                    downloadLimitPH: 'Number of times',
                    selectFrequency: 'Select a frequency',
                    subscriptionFrequency: 'Subscription Frequency',
                    subscriptionPrice: 'Subscription price',
                    subscriptionPricePH: 'Subscription price',
                    subscriptionKind: 'Subscription kind',
                    nftPrice: 'NFT Price',
                    generateNFT: 'Generate New NFT',
                    searchEditCreatePlan: 'Search for / select / edit / create new plan',
                    searchPlan: 'Search for a Data Investment Plan...',
                    searchSelectPlan: 'Search for / select a Data Investment Plan',
                    editPlan: 'edit plan',
                    createPlan: 'create new plan',
                    investmentPlanTitle: 'Investment Plan Title',
                    totalEquityPercentage: 'Total Equity Percentage',
                    minEquityPercentage: 'Minimum Equity Percentage',
                    equityPrice: 'Equity Price',
                    maxInvestors: 'Max No of Investors',
                    investors: 'investors',
                    saveInvestmentPlan: 'Save Investment Plan',
                    monthly: 'Monthly',
                    annual: 'Annual',
                },
                log: 'Data Log',
                wallet: {
                    title: 'Wallet',
                    balance: 'Balance',
                    monthlyExpenses: 'Monthly Expenses',
                    monthlyIncome: 'Monthly Income',
                    transactions: {
                        title: 'Transactions',
                        incoming: 'Incoming',
                        outgoing: 'Outgoing',
                    },
                },
                dmRepository: {
                    title: 'Models Management',
                    view: 'View',
                    edit: 'Edit',
                    delete: 'Delete',
                    download: 'Download',
                    dmAddTitle: 'Add Model',
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
                    search: 'Search...',
                    addDataset: 'Add new model',
                    addDataModel: 'Add new model',
                    modelType: 'Model type',
                    tableFields: {
                        id: 'ID',
                        title: 'Title',
                        date: 'Date',
                        size: 'Size (MB)',
                        version: 'Version',
                        country: 'Country',
                        type: 'Model Type',
                    },
                },
                usage: {
                    title: 'Data Usage and Intensions Analytics',
                    questionnaire: 'Questionnaire',
                    dashboard: 'Dashboard',
                    questionnaireInfo: 'Display the questionnaire for selected dataset',
                    dashboardInfo: 'Display analytics for selected dataset',
                },
            },
            market: {
                market: 'Market Insights',
                totalSales: 'Total Sales',
                marketCap: 'Market Cap',
                changeSince1DayAgo: 'Change since 1 Day Ago',
                changeSince1WeekAgo: 'Change since 1 Week Ago',
                changeSince1MonthAgo: 'Change since 1 Month Ago',
                assets: {
                    title: 'Assets',
                },
                overview: {
                    title: 'Overview',
                },
                sectors: {
                    title: 'Sectors',
                    overview: 'Sectors Overview',
                    selectSector: 'Select Sector',
                    changeSince1WeekAgo: 'Change Since 1 Week Ago',
                    errorInLoadingBasicInfo: 'Error occurred while loading sectors basic info',
                    allSectorsSales: 'Sectors Sales By Date',
                    movingAverages: 'Moving Averages',
                    marketCapPerSector: 'Market Cap per sector',
                    totalSalesPerSector: 'Total Sales per sector',
                    assetsPerformanceBySector: 'Asset Performance By Sector',
                    topPerformingAssets: 'Top Performing Assets',
                    salesBySectorVsTotal: 'Total number of sales by sector vs total',
                    marketCapBySectorVsTotal: 'Market Cap by sector vs total',
                    assetsComparison: 'Compare individual assets',
                },
            },
            transactions: {
                transactions: 'My Transactions',
                details: 'Details',
                overview: 'Overview',
                auditor: 'Auditor',
                tableFields: {
                    id: 'ID',
                    buyer: 'Byuer',
                    date: 'Transaction Date',
                    seller: 'Seller',
                    transactionId: 'Transaction ID',
                    price: 'Price',
                },
            },
            user: {
                profile: 'Your Profile',
                settings: 'Settings',
                signOut: 'Sign out',
                signIn: 'Sign in',
            },
            notifications: {
                title: 'Notifications',
                read: 'Mark as read',
                unread: 'Mark as unread',
                delete: 'Remove notification',
            },
            admin: {
                services: {
                    title: 'Manage Services',
                    factoryConnectors: {
                        title: 'DataSpace Factory Connectors Manager',
                        name: 'Name',
                        ip: 'IP Address',
                        country: 'Country',
                        status: 'Status',
                        live: 'Live',
                        pending: 'Pending Activation',
                        deactivated: 'Deactivated',
                        activate: 'Activate',
                        deactivate: 'Deactivate',
                    },
                },
                resources: {
                    title: 'Resources & Activities Monitor',
                    tableFields: {
                        asset: 'Asset',
                        date: 'Transaction Date',
                        plan: 'Monetisation Plan',
                        transactionId: 'Transaction ID',
                    },
                    cardsFields: {
                        total: 'Total',
                        inUse: 'In Use',
                        factories: 'Registered Factories',
                        users: 'Registered Users',
                        assets: 'Total Assets',
                    },
                },
            },
        },
    },
}));
