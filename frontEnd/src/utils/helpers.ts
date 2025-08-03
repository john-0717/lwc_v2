export function timeAgo(dateInput:any) {
  const now:any = new Date();
  const date:any = new Date(dateInput);
  const seconds = Math.floor((now - date) / 1000);

  if (isNaN(seconds) || seconds < 0) return 'just now';

  const intervals = {
    year: 365 * 24 * 60 * 60,
    month: 30 * 24 * 60 * 60,
    day: 24 * 60 * 60,
    hour: 60 * 60,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) {
      return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}
