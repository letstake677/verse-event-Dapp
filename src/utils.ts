
export const POINT_TO_USD_RATIO = 1000;

export const pointsToUsd = (points: number): number => points / POINT_TO_USD_RATIO;

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatPoints = (val: number): string => new Intl.NumberFormat().format(Math.floor(val));

export const USD_ICON = '💵';
