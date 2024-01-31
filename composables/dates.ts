export const useDateHelper = () => {
    const formatIntlDate = (date?: Date | string) => {
        if (!date) {
            return '';
        }

        const formatOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };

        const incomingDate = new Date(date);

        const dateTimeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);
        return dateTimeFormat.format(incomingDate);
    };

    const formatToTimestamp = (date?: string | undefined | null): string => {
        if (!date) {
            return '';
        }

        return new Date(date).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    return {
        formatIntlDate,
        formatToTimestamp,
    };
};
