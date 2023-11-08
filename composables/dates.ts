export function useIntlDates(date: Date | string) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    const incomingDate = new Date(date);

    const dateTimeFormat = new Intl.DateTimeFormat('en-GB', options);
    return dateTimeFormat.format(incomingDate);
}
