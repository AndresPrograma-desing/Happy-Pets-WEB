import { getDollarBcv } from '../services/api';

export const fetchDollarRate = async () => {
  try {
    const response = await getDollarBcv();
    const rawRate = response?.BcvDollar || response?.data?.BcvDollar || response?.bcvDollar || response?.data?.bcvDollar || response?.BcvDollarPrice || response?.data?.BcvDollarPrice || response?.bcvDollarPrice || response?.data?.bcvDollarPrice || response;
    
    if (typeof rawRate === 'string' && isNaN(Number(rawRate.replace(',', '.')))) {
      return rawRate;
    }
    
    const rate = Number(String(rawRate).replace(',', '.'));
    return isNaN(rate) ? 0 : rate;
  } catch (error) {
    console.error("Error al obtener tasa BCV:", error);
    if (error?.body?.BcvDollar || error?.body?.bcvDollar || error?.body?.BcvDollarPrice || error?.body?.bcvDollarPrice) {
      return error.body.BcvDollar || error.body.bcvDollar || error.body.BcvDollarPrice || error.body.bcvDollarPrice;
    }
    if (error?.body?.Message || error?.body?.message) {
      return error.body.Message || error.body.message;
    }
    throw error;
  }
};