import { DEFAULT_RANGE, WORKING_HOURS_TEXTS } from './constants';

export const parseWorkingHoursResponse = (response) => {
  const item = response?.data ?? response;
  return {
    start: item?.start_time || DEFAULT_RANGE.start,
    end: item?.end_time || DEFAULT_RANGE.end
  };
};

export const buildWorkingHoursPayload = (range) => ({
  start_time: range.start,
  end_time: range.end
});

export const validateRange = (range) => {
  if (!range?.start || !range?.end || range.start >= range.end) {
    return WORKING_HOURS_TEXTS.invalidRange;
  }
  return null;
};
