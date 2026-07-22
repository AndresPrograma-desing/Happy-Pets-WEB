export const parseTimeTo12h = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const h24 = value.getHours();
    const m = value.getMinutes();
    const period = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return { hours: h12, minutes: m, period };
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const h24 = Number(match[1]);
      const m = Number(match[2]);
      if (!Number.isNaN(h24) && !Number.isNaN(m) && h24 >= 0 && h24 <= 23 && m >= 0 && m <= 59) {
        const period = h24 >= 12 ? 'PM' : 'AM';
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        return { hours: h12, minutes: m, period };
      }
    }
  }

  return { hours: 12, minutes: 0, period: 'AM' };
};

export const format12hTo24h = (hours, minutes, period) => {
  let h24 = Number(hours);
  if (period === 'PM' && h24 !== 12) h24 += 12;
  if (period === 'AM' && h24 === 12) h24 = 0;
  
  const formattedHours = String(h24).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
};

export const getDisplayTimeText = (value, hours, minutes, period) => {
  if (!value) return '';
  const displayHours = String(hours).padStart(2, '0');
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
};

export const getCurrentTime12h = () => {
  const now = new Date();
  return parseTimeTo12h(now);
};
