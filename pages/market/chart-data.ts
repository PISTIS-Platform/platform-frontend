export const data = {
    labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    datasets: [
        {
            label: '',
            backgroundColor: '#7BA3A2',
            data: [40, 20, 12, 39, 10, 40, 39, 20, 40, 20, 12, 11],
        },
    ],
};

export const pieData = {
    labels: ['OneOff', 'NFT', 'Investment Plan', 'Subscription'],
    datasets: [
        {
            label: '',
            backgroundColor: ['#3B5454', '#557777', '#709999', '#A0BBBB'],
            data: [40, 20, 12, 39],
        },
    ],
};

export const lineData = {
    labels: ['January', 'February', 'March', 'April'],
    datasets: [
        {
            label: 'Earnings',
            backgroundColor: '#7BA3A2',
            data: [20, 12, 11, 39],
        },
        {
            label: 'Costs',
            backgroundColor: '#4B6C6C',
            data: [11, 20, 12, 39],
        },
    ],
};

export const options = {
    responsive: false,
    maintainAspectRatio: false,
};
