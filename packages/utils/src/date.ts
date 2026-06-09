// ─────────────────────────────────────────────────────────────
// DATE & TIME
// ─────────────────────────────────────────────────────────────

export const isValidDateString = (dateString: string): boolean => {
	const date = new Date(dateString);
	return !isNaN(date.getTime());
};

export const formatDate = (
	date: Date | string,
	locale = 'en-US',
	options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString(locale, options);
};

export const formatRelativeTime = (date: Date | string): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	const diff = Date.now() - d.getTime(); // Difference in milliseconds
	const seconds = Math.floor(diff / 1000);  // Convert ms → seconds
	const minutes = Math.floor(seconds / 60); // Convert seconds → minutes
	const hours = Math.floor(minutes / 60);  // Convert minutes → hours 
	const days = Math.floor(hours / 24); // Convert hours → days

	if (seconds < 60) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return formatDate(d);
}

export const addDays = (date: Date, days: number): Date => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export const isBefore = (date: Date, compareDate: Date): boolean => {
	return date.getTime() < compareDate.getTime();
}

export const isAfter = (date: Date, compareDate: Date): boolean => {
	return date.getTime() > compareDate.getTime();
}

export const isBetween = (date: Date, start: Date, end: Date): boolean => {
	return isAfter(date, start) && isBefore(date, end);
}

export const startOfDay = (date: Date): Date => {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export const endOfDay = (date: Date): Date => {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

export const daysBetween = (a: Date, b: Date): number => {
	return Math.abs(Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}
