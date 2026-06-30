import { constants } from "./constansts";

export function getMoneyName(tipeMoney) {
    const moneyMap = {
        'VES': constants.VES,
        'USD': constants.USD
    };
    return moneyMap[tipeMoney] || constants.VES;
}