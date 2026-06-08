// ─────────────────────────────────────────────────────────────
// DATE & TIME
// ─────────────────────────────────────────────────────────────

export function isValidDateString(dateString: string): boolean {
	const date = new Date(dateString);
	return !isNaN(date.getTime());
}

export function formatDate(
	date: Date | string,
	locale = 'en-US',
	options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString(locale, options);
}

export function formatRelativeTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const diff = Date.now() - d.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return formatDate(d);
}

export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export function isBefore(date: Date, compareDate: Date): boolean {
	return date.getTime() < compareDate.getTime();
}

export function isAfter(date: Date, compareDate: Date): boolean {
	return date.getTime() > compareDate.getTime();
}

export function isBetween(date: Date, start: Date, end: Date): boolean {
	return isAfter(date, start) && isBefore(date, end);
}

export function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function endOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

export function daysBetween(a: Date, b: Date): number {
	return Math.abs(Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}
