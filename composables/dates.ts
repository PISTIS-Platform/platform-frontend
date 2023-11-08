export function useIntlDates(date: Date | string) {
    const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    const incomingDate = new Date(date);

    const dateTimeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);
    return dateTimeFormat.format(incomingDate);
}
