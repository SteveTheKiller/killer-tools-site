function formatPercentageNumber(value: number) {
  return Number(value.toFixed(8)).toString();
}

export function percentageOf(percent: number, total: number) {
  if (!Number.isFinite(percent) || !Number.isFinite(total)) {
    return '';
  }
  return formatPercentageNumber(percent / 100 * total);
}

export function percentageRatio(part: number, total: number) {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total === 0) {
    return '';
  }
  return `${formatPercentageNumber(100 * part / total)}%`;
}

export function percentageChange(from: number, to: number) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) {
    return '';
  }
  const percent = (to - from) / from * 100;
  return `${percent >= 0 ? '+' : ''}${formatPercentageNumber(percent)}%`;
}
