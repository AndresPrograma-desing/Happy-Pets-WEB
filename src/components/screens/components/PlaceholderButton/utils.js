export const handleAction = async ({
    actionPromise,
    value,
    setIsSaving,
    setMessage,
    clearCache,
    successMessage,
    errorMessage,
    validationErrorMsg,
    validate,
    setValue,
    clearOnSuccess
}) => {
    if (validate && !validate(value)) {
        setMessage({ text: validationErrorMsg, type: 'error' });
        return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
        const response = await actionPromise(value);
        if (clearCache) clearCache();
        if (clearOnSuccess && setValue) setValue('');
        
        const apiMsg = response?.message || (typeof response === 'string' ? response : null);
        const finalSuccessMessage = apiMsg || successMessage;
        
        setMessage({ text: finalSuccessMessage, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
        console.error(errorMessage, error);
        
        const apiErrorMsg = error?.message || error?.body?.message || error?.body?.error || (typeof error === 'string' ? error : null);
        const finalErrorMessage = apiErrorMsg || errorMessage;
        
        setMessage({ text: finalErrorMessage, type: 'error' });
    } finally {
        setIsSaving(false);
    }
};
