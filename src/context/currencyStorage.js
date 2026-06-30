const CURRENCY_KEY = 'app_currency_preference';

export const currencyStorage = {
  save: (currencyCode) => {
    localStorage.setItem(CURRENCY_KEY, currencyCode);
  },
  get: (defaultValue = 'USD') => {
    return localStorage.getItem(CURRENCY_KEY) || defaultValue;
  }
};