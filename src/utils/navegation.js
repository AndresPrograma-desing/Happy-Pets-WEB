
/**
 * @param {string} url - La ruta a la que se desea navegar.
 */
export const openNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    if (window.focus) {
        window.focus();
    }
}