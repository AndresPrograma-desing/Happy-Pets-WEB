/**
 * Formats a report date string into a local Venezuela date-time format.
 * @param {string} dateString
 * @returns {string}
 */
export const formatReportDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
